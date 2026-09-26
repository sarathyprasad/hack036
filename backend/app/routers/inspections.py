import hashlib
import random
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user, require_officer
from app.models import (
    AlertNotification,
    AlertType,
    ApplicationStatus,
    DigitalCertificate,
    InspectionRecord,
    InspectionResult,
    Instrument,
    InstrumentStatus,
    User,
    UserRole,
    VerificationApplication,
)
from app.schemas import InspectionRecordCreate, InspectionRecordPublic

router = APIRouter(prefix="/inspections", tags=["inspections"])


def generate_certificate_number() -> str:
    year = datetime.now().year
    rand_seq = random.randint(100000, 999999)
    return f"LM-CERT-{year}-{rand_seq}"


def generate_security_hash(cert_num: str, serial_no: str, seal_no: str, valid_until: datetime) -> str:
    raw = f"{cert_num}:{serial_no}:{seal_no}:{valid_until.isoformat()}:LEGAL_METROLOGY_INDIA_2026"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


@router.post("", response_model=InspectionRecordPublic, status_code=status.HTTP_201_CREATED)
def submit_inspection(
    payload: InspectionRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer),
):
    app_obj = db.scalar(
        select(VerificationApplication)
        .options(joinedload(VerificationApplication.instrument))
        .where(VerificationApplication.id == payload.application_id)
    )
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    if app_obj.status in [ApplicationStatus.APPROVED, ApplicationStatus.INSPECTED, ApplicationStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Application '{app_obj.application_number}' has already been processed with status '{app_obj.status.value}'."
        )

    inst = app_obj.instrument
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")

    stamping_mark = payload.stamping_mark_no or f"LM-STAMP-{datetime.now().year}-{random.randint(1000, 9999)}"
    seal_num = payload.seal_number or f"SEAL-{random.randint(10000, 99999)}"

    inspection = InspectionRecord(
        application_id=app_obj.id,
        instrument_id=inst.id,
        inspector_id=current_user.id,
        standard_weights_used=payload.standard_weights_used.strip(),
        observed_max_error=payload.observed_max_error,
        tolerance_limit=payload.tolerance_limit,
        result=payload.result,
        stamping_mark_no=stamping_mark,
        seal_number=seal_num,
        photo_url=payload.photo_url,
        remarks=payload.remarks,
    )
    db.add(inspection)
    app_obj.status = ApplicationStatus.INSPECTED

    if payload.result == InspectionResult.PASSED:
        app_obj.status = ApplicationStatus.APPROVED
        now = datetime.now()
        interval = inst.verification_interval_months or 12
        due_date = now + timedelta(days=int(interval * 30.5))

        inst.status = InstrumentStatus.VERIFIED
        inst.last_verified_at = now
        inst.next_due_date = due_date

        cert_num = generate_certificate_number()
        sec_hash = generate_security_hash(cert_num, inst.serial_number, seal_num, due_date)

        cert = DigitalCertificate(
            certificate_number=cert_num,
            application_id=app_obj.id,
            instrument_id=inst.id,
            trader_id=inst.trader_id,
            inspector_id=current_user.id,
            issue_date=now,
            valid_until=due_date,
            seal_number=seal_num,
            security_hash=sec_hash,
            qr_code_url=f"/verify-certificate/{cert_num}",
            is_active=True,
        )
        db.add(cert)

        # Send pass alert notification
        alert = AlertNotification(
            user_id=inst.trader_id,
            instrument_id=inst.id,
            alert_type=AlertType.APPLICATION_UPDATED,
            title="Verification Approved & Certificate Issued!",
            message=f"Digital Verification Certificate {cert_num} issued for {inst.brand} ({inst.serial_number}). Seal #{seal_num}. Valid until {due_date.strftime('%Y-%m-%d')}.",
        )
        db.add(alert)
    else:
        app_obj.status = ApplicationStatus.REJECTED
        inst.status = InstrumentStatus.REJECTED

        # Send rejection alert
        alert = AlertNotification(
            user_id=inst.trader_id,
            instrument_id=inst.id,
            alert_type=AlertType.APPLICATION_UPDATED,
            title="Verification Rejected",
            message=f"Verification for {inst.brand} ({inst.serial_number}) was REJECTED. Remarks: {payload.remarks or 'Tolerance error exceeded limit.'}",
        )
        db.add(alert)

    db.commit()
    db.refresh(inspection)

    pub = InspectionRecordPublic.model_validate(inspection)
    pub.inspector_name = current_user.name
    return pub


@router.get("/application/{application_id}", response_model=InspectionRecordPublic)
def get_inspection_by_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    insp = db.scalar(
        select(InspectionRecord)
        .options(
            joinedload(InspectionRecord.inspector),
            joinedload(InspectionRecord.application)
        )
        .where(InspectionRecord.application_id == application_id)
    )
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection record not found")

    if current_user.role == UserRole.TRADER and insp.application and insp.application.trader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this inspection record")

    pub = InspectionRecordPublic.model_validate(insp)
    if insp.inspector:
        pub.inspector_name = insp.inspector.name
    return pub

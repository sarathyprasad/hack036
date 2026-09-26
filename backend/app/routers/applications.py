import random
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user, require_officer
from app.models import (
    ApplicationStatus,
    Instrument,
    InstrumentStatus,
    User,
    UserRole,
    VerificationApplication,
    AlertNotification,
    AlertType,
)
from app.schemas import (
    AssignApplicationRequest,
    InstrumentPublic,
    UserPublic,
    VerificationApplicationCreate,
    VerificationApplicationPublic,
)

router = APIRouter(prefix="/applications", tags=["applications"])


def generate_application_number() -> str:
    year = datetime.now().year
    rand_seq = random.randint(10000, 99999)
    return f"LM-APP-{year}-{rand_seq}"


@router.post("", response_model=VerificationApplicationPublic, status_code=status.HTTP_201_CREATED)
def submit_application(
    payload: VerificationApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inst = db.scalar(select(Instrument).where(Instrument.id == payload.instrument_id))
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")

    if current_user.role == UserRole.TRADER and inst.trader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to submit application for this instrument")

    app_num = generate_application_number()
    app_obj = VerificationApplication(
        application_number=app_num,
        instrument_id=payload.instrument_id,
        trader_id=inst.trader_id,
        application_type=payload.application_type,
        status=ApplicationStatus.SUBMITTED,
        preferred_date=payload.preferred_date,
        trader_notes=payload.trader_notes,
    )
    inst.status = InstrumentStatus.PENDING_VERIFICATION
    db.add(app_obj)

    # Add alert notification
    alert = AlertNotification(
        user_id=inst.trader_id,
        instrument_id=inst.id,
        alert_type=AlertType.APPLICATION_UPDATED,
        title="Application Submitted",
        message=f"Verification Application #{app_num} submitted successfully for {inst.brand} {inst.model_number}.",
    )
    db.add(alert)
    db.commit()

    # Query with relationships loaded
    full_app = db.scalar(
        select(VerificationApplication)
        .options(
            joinedload(VerificationApplication.instrument).joinedload(Instrument.trader),
            joinedload(VerificationApplication.trader),
            joinedload(VerificationApplication.assigned_officer),
        )
        .where(VerificationApplication.id == app_obj.id)
    )

    pub = VerificationApplicationPublic.model_validate(full_app)
    if full_app.instrument:
        pub.instrument = InstrumentPublic.model_validate(full_app.instrument)
        if full_app.instrument.trader:
            pub.instrument.trader_name = full_app.instrument.trader.name
    if full_app.trader:
        pub.trader = UserPublic.model_validate(full_app.trader)
    if full_app.assigned_officer:
        pub.assigned_officer_name = full_app.assigned_officer.name
    return pub


@router.get("", response_model=list[VerificationApplicationPublic])
def list_applications(
    status: ApplicationStatus | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(VerificationApplication).options(
        joinedload(VerificationApplication.instrument).joinedload(Instrument.trader),
        joinedload(VerificationApplication.trader),
        joinedload(VerificationApplication.assigned_officer),
    )

    if current_user.role == UserRole.TRADER:
        query = query.where(VerificationApplication.trader_id == current_user.id)
    elif current_user.role in [UserRole.LMO, UserRole.GATC]:
        query = query.where(
            (VerificationApplication.assigned_officer_id == current_user.id)
            | (VerificationApplication.status == ApplicationStatus.SUBMITTED)
        )

    if status:
        query = query.where(VerificationApplication.status == status)

    query = query.order_by(VerificationApplication.created_at.desc())
    apps = db.scalars(query).all()

    results = []
    for a in apps:
        pub = VerificationApplicationPublic.model_validate(a)
        if a.instrument:
            pub.instrument = InstrumentPublic.model_validate(a.instrument)
            if a.instrument.trader:
                pub.instrument.trader_name = a.instrument.trader.name
        if a.trader:
            pub.trader = UserPublic.model_validate(a.trader)
        if a.assigned_officer:
            pub.assigned_officer_name = a.assigned_officer.name
        results.append(pub)

    return results


@router.get("/{application_id}", response_model=VerificationApplicationPublic)
def get_application(
    application_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    a = db.scalar(
        select(VerificationApplication)
        .options(
            joinedload(VerificationApplication.instrument).joinedload(Instrument.trader),
            joinedload(VerificationApplication.trader),
            joinedload(VerificationApplication.assigned_officer),
        )
        .where(VerificationApplication.id == application_id)
    )
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")

    pub = VerificationApplicationPublic.model_validate(a)
    if a.instrument:
        pub.instrument = InstrumentPublic.model_validate(a.instrument)
        if a.instrument.trader:
            pub.instrument.trader_name = a.instrument.trader.name
    if a.trader:
        pub.trader = UserPublic.model_validate(a.trader)
    if a.assigned_officer:
        pub.assigned_officer_name = a.assigned_officer.name
    return pub


@router.post("/{application_id}/assign", response_model=VerificationApplicationPublic)
def assign_application(
    application_id: UUID,
    payload: AssignApplicationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer),
):
    a = db.scalar(select(VerificationApplication).where(VerificationApplication.id == application_id))
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")

    officer = db.scalar(select(User).where(User.id == payload.assigned_officer_id))
    if not officer:
        raise HTTPException(status_code=404, detail="Assigned officer not found")

    a.assigned_type = payload.assigned_type
    a.assigned_officer_id = payload.assigned_officer_id
    a.scheduled_date = payload.scheduled_date or datetime.now()
    a.status = ApplicationStatus.SCHEDULED

    # Create alert for Trader
    alert = AlertNotification(
        user_id=a.trader_id,
        instrument_id=a.instrument_id,
        alert_type=AlertType.INSPECTION_SCHEDULED,
        title="Verification Inspection Scheduled",
        message=f"Application #{a.application_number} assigned to {officer.name} ({payload.assigned_type}). Scheduled for {a.scheduled_date.strftime('%Y-%m-%d')}.",
    )
    db.add(alert)
    db.commit()

    full_app = db.scalar(
        select(VerificationApplication)
        .options(
            joinedload(VerificationApplication.instrument).joinedload(Instrument.trader),
            joinedload(VerificationApplication.trader),
            joinedload(VerificationApplication.assigned_officer),
        )
        .where(VerificationApplication.id == application_id)
    )

    pub = VerificationApplicationPublic.model_validate(full_app)
    if full_app.instrument:
        pub.instrument = InstrumentPublic.model_validate(full_app.instrument)
        if full_app.instrument.trader:
            pub.instrument.trader_name = full_app.instrument.trader.name
    if full_app.trader:
        pub.trader = UserPublic.model_validate(full_app.trader)
    if full_app.assigned_officer:
        pub.assigned_officer_name = full_app.assigned_officer.name
    return pub

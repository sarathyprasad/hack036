from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import (
    ApplicationStatus,
    DigitalCertificate,
    InspectionRecord,
    Instrument,
    InstrumentStatus,
    User,
    UserRole,
    VerificationApplication,
)
from app.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now()
    thirty_days_later = now + timedelta(days=30)

    inst_query = select(Instrument)
    app_query = select(VerificationApplication)
    cert_query = select(DigitalCertificate)
    insp_query = select(InspectionRecord)

    if current_user.role == UserRole.TRADER:
        inst_query = inst_query.where(Instrument.trader_id == current_user.id)
        app_query = app_query.where(VerificationApplication.trader_id == current_user.id)
        cert_query = cert_query.where(DigitalCertificate.trader_id == current_user.id)
    elif current_user.role in [UserRole.LMO, UserRole.GATC]:
        app_query = app_query.where(VerificationApplication.assigned_officer_id == current_user.id)
        insp_query = insp_query.where(InspectionRecord.inspector_id == current_user.id)

    total_instruments = db.scalar(select(func.count()).select_from(inst_query.subquery())) or 0
    
    active_verified = db.scalar(
        select(func.count()).select_from(inst_query.where(Instrument.status == InstrumentStatus.VERIFIED).subquery())
    ) or 0

    pending_apps = db.scalar(
        select(func.count()).select_from(
            app_query.where(
                VerificationApplication.status.in_([ApplicationStatus.SUBMITTED, ApplicationStatus.ASSIGNED, ApplicationStatus.SCHEDULED])
            ).subquery()
        )
    ) or 0

    expiring_soon = db.scalar(
        select(func.count()).select_from(
            inst_query.where(
                Instrument.status == InstrumentStatus.VERIFIED,
                Instrument.next_due_date <= thirty_days_later,
                Instrument.next_due_date > now,
            ).subquery()
        )
    ) or 0

    expired_count = db.scalar(
        select(func.count()).select_from(
            inst_query.where(
                (Instrument.status == InstrumentStatus.EXPIRED)
                | (Instrument.next_due_date <= now)
            ).subquery()
        )
    ) or 0

    total_certs = db.scalar(select(func.count()).select_from(cert_query.subquery())) or 0
    assigned_insps = db.scalar(select(func.count()).select_from(insp_query.subquery())) or 0

    compliance_rate = round((active_verified / total_instruments * 100), 1) if total_instruments > 0 else 100.0

    return DashboardStats(
        total_instruments=total_instruments,
        active_verified_instruments=active_verified,
        pending_applications=pending_apps,
        expiring_soon_count=expiring_soon,
        expired_count=expired_count,
        total_certificates=total_certs,
        assigned_inspections=assigned_insps,
        compliance_rate_percent=compliance_rate,
    )

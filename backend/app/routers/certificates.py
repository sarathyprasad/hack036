from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user
from app.models import (
    DigitalCertificate,
    Instrument,
    User,
    UserRole,
)
from app.schemas import (
    DigitalCertificatePublic,
    InstrumentPublic,
    PublicVerificationResult,
    UserPublic,
)

router = APIRouter(tags=["certificates"])


@router.get("/certificates", response_model=list[DigitalCertificatePublic])
def list_certificates(
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(DigitalCertificate).options(
        joinedload(DigitalCertificate.instrument).joinedload(Instrument.trader),
        joinedload(DigitalCertificate.trader),
        joinedload(DigitalCertificate.application),
    )

    if current_user.role == UserRole.TRADER:
        query = query.where(DigitalCertificate.trader_id == current_user.id)

    if search:
        s = f"%{search}%"
        query = query.where(
            (DigitalCertificate.certificate_number.ilike(s))
            | (DigitalCertificate.seal_number.ilike(s))
        )

    query = query.order_by(DigitalCertificate.created_at.desc())
    certs = db.scalars(query).all()

    results = []
    for c in certs:
        pub = DigitalCertificatePublic.model_validate(c)
        if c.instrument:
            pub.instrument = InstrumentPublic.model_validate(c.instrument)
            if c.instrument.trader:
                pub.instrument.trader_name = c.instrument.trader.name
        if c.trader:
            pub.trader = UserPublic.model_validate(c.trader)
        results.append(pub)
    return results


@router.get("/certificates/{certificate_id}", response_model=DigitalCertificatePublic)
def get_certificate_by_id(
    certificate_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cert = db.scalar(
        select(DigitalCertificate)
        .options(
            joinedload(DigitalCertificate.instrument).joinedload(Instrument.trader),
            joinedload(DigitalCertificate.trader),
        )
        .where(DigitalCertificate.id == certificate_id)
    )
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if current_user.role == UserRole.TRADER and cert.trader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this certificate")

    pub = DigitalCertificatePublic.model_validate(cert)
    if cert.instrument:
        pub.instrument = InstrumentPublic.model_validate(cert.instrument)
        if cert.instrument.trader:
            pub.instrument.trader_name = cert.instrument.trader.name
    if cert.trader:
        pub.trader = UserPublic.model_validate(cert.trader)
    return pub


@router.get("/certificates/number/{cert_number}", response_model=DigitalCertificatePublic)
def get_certificate_by_number(
    cert_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cert = db.scalar(
        select(DigitalCertificate)
        .options(
            joinedload(DigitalCertificate.instrument).joinedload(Instrument.trader),
            joinedload(DigitalCertificate.trader),
        )
        .where(DigitalCertificate.certificate_number == cert_number)
    )
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    pub = DigitalCertificatePublic.model_validate(cert)
    if cert.instrument:
        pub.instrument = InstrumentPublic.model_validate(cert.instrument)
        if cert.instrument.trader:
            pub.instrument.trader_name = cert.instrument.trader.name
    if cert.trader:
        pub.trader = UserPublic.model_validate(cert.trader)
    return pub


@router.get("/public/verify/{cert_number}", response_model=PublicVerificationResult)
def public_verify_certificate(cert_number: str, db: Session = Depends(get_db)):
    cert = db.scalar(
        select(DigitalCertificate)
        .options(
            joinedload(DigitalCertificate.instrument),
            joinedload(DigitalCertificate.trader),
            joinedload(DigitalCertificate.application),
        )
        .where(DigitalCertificate.certificate_number == cert_number)
    )

    if not cert:
        raise HTTPException(status_code=404, detail="Invalid certificate number or record not found.")

    now = datetime.now()
    valid_until = cert.valid_until.replace(tzinfo=None) if cert.valid_until and cert.valid_until.tzinfo else cert.valid_until

    is_valid = cert.is_active and (valid_until > now)

    status_str = "VERIFIED AND ACTIVE" if is_valid else ("EXPIRED" if valid_until <= now else "REVOKED / INVALID")

    inspector_user = db.scalar(select(User).where(User.id == cert.inspector_id))
    inspector_name = inspector_user.name if inspector_user else "State Legal Metrology Officer"

    return PublicVerificationResult(
        is_valid=is_valid,
        certificate_number=cert.certificate_number,
        status=status_str,
        issue_date=cert.issue_date,
        valid_until=cert.valid_until,
        seal_number=cert.seal_number,
        security_hash=cert.security_hash,
        trader_name=cert.trader.name if cert.trader else "Unknown",
        organization=cert.trader.organization if cert.trader else None,
        district=cert.instrument.district if cert.instrument else "State Jurisdiction",
        instrument_category=cert.instrument.category.value.replace("_", " ").title() if cert.instrument else "Weighing Instrument",
        instrument_brand=cert.instrument.brand if cert.instrument else "Unknown",
        instrument_model=cert.instrument.model_number if cert.instrument else "N/A",
        instrument_serial=cert.instrument.serial_number if cert.instrument else "N/A",
        accuracy_class=cert.instrument.accuracy_class.value.replace("_", " ").upper() if cert.instrument else "Class III",
        capacity_rating=cert.instrument.capacity_rating if cert.instrument else "N/A",
        inspector_name=inspector_name,
        verification_authority="Department of Legal Metrology, Government of India",
    )

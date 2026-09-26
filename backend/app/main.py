from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, func

from app.config import BACKEND_DIR, settings
from app.database import Base, engine, SessionLocal
from app import models
from app.models import (
    AccuracyClass,
    AlertNotification,
    AlertType,
    ApplicationStatus,
    ApplicationType,
    DigitalCertificate,
    InspectionRecord,
    InspectionResult,
    Instrument,
    InstrumentCategory,
    InstrumentStatus,
    User,
    UserRole,
    VerificationApplication,
)
from app.routers import alerts, applications, auth, certificates, dashboard, inspections, instruments, users
from app.security import hash_password


def seed_initial_data(db):
    user_count = db.scalar(select(func.count()).select_from(User))
    if user_count and user_count > 0:
        return

    # Seed Users
    admin = User(
        name="State LM Administrator",
        email="admin@legalmetrology.gov.in",
        phone="+91 11 2338 0000",
        organization="Department of Legal Metrology, HQ",
        jurisdiction_district="Headquarters",
        role=UserRole.ADMIN,
        password_hash=hash_password("Admin@123"),
    )
    db.add(admin)

    lmo = User(
        name="Rajesh Kumar (Senior LMO)",
        email="lmo.delhi@legalmetrology.gov.in",
        phone="+91 98100 12345",
        organization="State Legal Metrology Inspectorate",
        jurisdiction_district="Central Delhi",
        role=UserRole.LMO,
        password_hash=hash_password("Lmo@12345"),
    )
    db.add(lmo)

    gatc = User(
        name="Dr. Anita Sharma (GATC Technical Lead)",
        email="gatc.north@gatc.gov.in",
        phone="+91 98765 43210",
        organization="National Test House GATC Facility",
        jurisdiction_district="North Delhi",
        role=UserRole.GATC,
        password_hash=hash_password("Gatc@12345"),
    )
    db.add(gatc)

    trader = User(
        name="Apex Logistics & Trading Solutions",
        email="apex.logistics@trader.com",
        phone="+91 99999 88888",
        organization="Apex Logistics Ltd",
        jurisdiction_district="Central Delhi",
        role=UserRole.TRADER,
        password_hash=hash_password("Trader@12345"),
    )
    db.add(trader)
    db.commit()
    db.refresh(trader)
    db.refresh(lmo)

    now = datetime.now()
    due_in_15d = now + timedelta(days=15)
    due_in_1y = now + timedelta(days=365)

    # Seed Instruments
    inst1 = Instrument(
        trader_id=trader.id,
        category=InstrumentCategory.ELECTRONIC_WEIGHING_SCALE,
        brand="Contech Precision",
        model_number="CZA-300",
        serial_number="CNT-2025-9941",
        capacity_rating="300 g",
        accuracy_class=AccuracyClass.CLASS_II,
        verification_interval_months=12,
        installation_address="Plot 14, Okhla Industrial Area Phase 3",
        district="Central Delhi",
        state="Delhi NCT",
        pincode="110020",
        status=InstrumentStatus.VERIFIED,
        last_verified_at=now - timedelta(days=350),
        next_due_date=due_in_15d,
    )
    db.add(inst1)

    inst2 = Instrument(
        trader_id=trader.id,
        category=InstrumentCategory.WEIGHBRIDGE,
        brand="Avery India",
        model_number="WB-60T-HEAVY",
        serial_number="AVR-WB-2024-883",
        capacity_rating="60,000 kg",
        accuracy_class=AccuracyClass.CLASS_III,
        verification_interval_months=12,
        installation_address="Yard 4B, ICD Tughlakabad Container Depot",
        district="Central Delhi",
        state="Delhi NCT",
        pincode="110044",
        status=InstrumentStatus.VERIFIED,
        last_verified_at=now - timedelta(days=10),
        next_due_date=due_in_1y,
    )
    db.add(inst2)

    inst3 = Instrument(
        trader_id=trader.id,
        category=InstrumentCategory.PETROL_DISPENSER,
        brand="Gilbarco Veeder-Root",
        model_number="Horizon Duet 50L",
        serial_number="GVR-PD-2026-701",
        capacity_rating="50 L/min",
        accuracy_class=AccuracyClass.CLASS_III,
        verification_interval_months=12,
        installation_address="Apex Fuel Station, NH-48 Expressway Circle",
        district="Central Delhi",
        state="Delhi NCT",
        pincode="110037",
        status=InstrumentStatus.PENDING_VERIFICATION,
    )
    db.add(inst3)
    db.commit()
    db.refresh(inst1)
    db.refresh(inst2)
    db.refresh(inst3)

    # Seed Application & Certificate for inst2
    app_num2 = "LM-APP-2026-80021"
    app2 = VerificationApplication(
        application_number=app_num2,
        instrument_id=inst2.id,
        trader_id=trader.id,
        application_type=ApplicationType.INITIAL_VERIFICATION,
        status=ApplicationStatus.APPROVED,
        assigned_type="LMO",
        assigned_officer_id=lmo.id,
        scheduled_date=now - timedelta(days=10),
        trader_notes="Annual re-verification for container scale",
    )
    db.add(app2)
    db.commit()
    db.refresh(app2)

    insp2 = InspectionRecord(
        application_id=app2.id,
        instrument_id=inst2.id,
        inspector_id=lmo.id,
        inspection_date=now - timedelta(days=10),
        standard_weights_used="Standard Test Weights Set #F1-1000KG & 500KG",
        observed_max_error=0.015,
        tolerance_limit=0.050,
        result=InspectionResult.PASSED,
        stamping_mark_no="LM-STAMP-2026-DEL-042",
        seal_number="SEAL-DL-2026-9842",
        remarks="All load cells tested up to max capacity 60,000kg. Zero-drift and corner test within permissible MPE limits.",
    )
    db.add(insp2)

    cert2 = DigitalCertificate(
        certificate_number="LM-CERT-2026-984210",
        application_id=app2.id,
        instrument_id=inst2.id,
        trader_id=trader.id,
        inspector_id=lmo.id,
        issue_date=now - timedelta(days=10),
        valid_until=due_in_1y,
        seal_number="SEAL-DL-2026-9842",
        security_hash="c5f8992a01bf9e832049d110f66a87319bb6a200e47081774391e4a7710ab94f",
        is_active=True,
    )
    db.add(cert2)

    # Seed Pending Application for inst3
    app_num3 = "LM-APP-2026-90415"
    app3 = VerificationApplication(
        application_number=app_num3,
        instrument_id=inst3.id,
        trader_id=trader.id,
        application_type=ApplicationType.INITIAL_VERIFICATION,
        status=ApplicationStatus.SUBMITTED,
        preferred_date=now + timedelta(days=2),
        trader_notes="Initial stamping and verification before commercial operation.",
    )
    db.add(app3)

    # Seed Alert
    alert1 = AlertNotification(
        user_id=trader.id,
        instrument_id=inst1.id,
        alert_type=AlertType.EXPIRY_WARNING_30D,
        title="Verification Expiring Soon!",
        message=f"Instrument {inst1.brand} {inst1.model_number} (S/N: {inst1.serial_number}) verification expires on {due_in_15d.strftime('%Y-%m-%d')}. Submit re-verification application.",
    )
    db.add(alert1)
    db.commit()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Ensure database schema is created on startup (works with both SQLite and PostgreSQL)
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        print(f"Database schema initialization warning: {exc}")
    
    # Run seeder if empty
    db = SessionLocal()
    try:
        seed_initial_data(db)
    except Exception as exc:
        print(f"Data seeder notice: {exc}")
    finally:
        db.close()
    yield


app = FastAPI(
    title="Legal Metrology Verification & Certification API",
    description="Unified Online Verification and Digital Certification Platform under the Legal Metrology Act, 2009.",
    version="2.0.0",
    lifespan=lifespan,
)

# Flexible CORS setup compatible with Render preview and production domains
cors_origins = settings.cors_origin_list
has_wildcard = "*" in cors_origins or any(o == "*" for o in cors_origins)

if has_wildcard:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.onrender\.com)(:\d+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

upload_path = Path(settings.upload_dir)
if not upload_path.is_absolute():
    upload_path = BACKEND_DIR / upload_path
upload_path.mkdir(parents=True, exist_ok=True)

report_path = Path(settings.report_dir)
if not report_path.is_absolute():
    report_path = BACKEND_DIR / report_path
report_path.mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(instruments.router)
app.include_router(applications.router)
app.include_router(inspections.router)
app.include_router(certificates.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "system": "Legal Metrology Verification API v2.0"}

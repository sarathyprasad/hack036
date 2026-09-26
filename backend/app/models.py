import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def enum_values(enum_cls: type[enum.Enum]) -> list[str]:
    return [member.value for member in enum_cls]


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    LMO = "lmo"
    GATC = "gatc"
    TRADER = "trader"
    ENFORCEMENT_OFFICIAL = "enforcement_official"


class InstrumentCategory(str, enum.Enum):
    ELECTRONIC_WEIGHING_SCALE = "electronic_weighing_scale"
    WEIGHBRIDGE = "weighbridge"
    FLOW_METER = "flow_meter"
    PETROL_DISPENSER = "petrol_dispenser"
    WEIGHTS = "weights"
    MEASURES = "measures"
    CAPACITY_MEASURE = "capacity_measure"
    OTHER = "other"


class AccuracyClass(str, enum.Enum):
    CLASS_I = "class_i"
    CLASS_II = "class_ii"
    CLASS_III = "class_iii"
    CLASS_IIII = "class_iiii"
    NOT_APPLICABLE = "not_applicable"


class InstrumentStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    EXPIRED = "expired"
    REJECTED = "rejected"


class ApplicationType(str, enum.Enum):
    INITIAL_VERIFICATION = "initial_verification"
    PERIODIC_REVERIFICATION = "periodic_reverification"
    VERIFICATION_POST_REPAIR = "verification_post_repair"


class ApplicationStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    ASSIGNED = "assigned"
    SCHEDULED = "scheduled"
    INSPECTED = "inspected"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class InspectionResult(str, enum.Enum):
    PASSED = "passed"
    FAILED = "failed"
    RECTIFICATION_REQUIRED = "rectification_required"


class AlertType(str, enum.Enum):
    EXPIRY_WARNING_30D = "expiry_warning_30d"
    EXPIRY_WARNING_7D = "expiry_warning_7d"
    EXPIRED = "expired"
    APPLICATION_UPDATED = "application_updated"
    INSPECTION_SCHEDULED = "inspection_scheduled"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50))
    organization: Mapped[str | None] = mapped_column(String(255))
    jurisdiction_district: Mapped[str | None] = mapped_column(String(100))
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", native_enum=True, values_callable=enum_values),
        nullable=False,
        default=UserRole.TRADER,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    instruments: Mapped[list["Instrument"]] = relationship(back_populates="trader", foreign_keys="[Instrument.trader_id]")
    applications: Mapped[list["VerificationApplication"]] = relationship(back_populates="trader", foreign_keys="[VerificationApplication.trader_id]")
    assigned_applications: Mapped[list["VerificationApplication"]] = relationship(back_populates="assigned_officer", foreign_keys="[VerificationApplication.assigned_officer_id]")
    inspections: Mapped[list["InspectionRecord"]] = relationship(back_populates="inspector")
    certificates: Mapped[list["DigitalCertificate"]] = relationship(back_populates="trader", foreign_keys="[DigitalCertificate.trader_id]")
    alerts: Mapped[list["AlertNotification"]] = relationship(back_populates="user")


class Instrument(Base):
    __tablename__ = "instruments"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trader_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category: Mapped[InstrumentCategory] = mapped_column(
        Enum(InstrumentCategory, name="instrument_category", native_enum=True, values_callable=enum_values),
        nullable=False,
        default=InstrumentCategory.ELECTRONIC_WEIGHING_SCALE,
    )
    brand: Mapped[str] = mapped_column(String(255), nullable=False)
    model_number: Mapped[str] = mapped_column(String(255), nullable=False)
    serial_number: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    capacity_rating: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., "150 kg", "5000 kg"
    accuracy_class: Mapped[AccuracyClass] = mapped_column(
        Enum(AccuracyClass, name="accuracy_class", native_enum=True, values_callable=enum_values),
        nullable=False,
        default=AccuracyClass.CLASS_III,
    )
    verification_interval_months: Mapped[int] = mapped_column(default=12)
    installation_address: Mapped[str] = mapped_column(Text, nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False, default="State Legal Metrology Department")
    pincode: Mapped[str | None] = mapped_column(String(20))
    status: Mapped[InstrumentStatus] = mapped_column(
        Enum(InstrumentStatus, name="instrument_status", native_enum=True, values_callable=enum_values),
        nullable=False,
        default=InstrumentStatus.UNVERIFIED,
        index=True,
    )
    last_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    next_due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    trader: Mapped["User"] = relationship(back_populates="instruments", foreign_keys=[trader_id])
    applications: Mapped[list["VerificationApplication"]] = relationship(back_populates="instrument", cascade="all, delete-orphan")
    inspections: Mapped[list["InspectionRecord"]] = relationship(back_populates="instrument", cascade="all, delete-orphan")
    certificates: Mapped[list["DigitalCertificate"]] = relationship(back_populates="instrument", cascade="all, delete-orphan")


class VerificationApplication(Base):
    __tablename__ = "verification_applications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    instrument_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    trader_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    application_type: Mapped[ApplicationType] = mapped_column(
        Enum(ApplicationType, name="application_type", native_enum=True, values_callable=enum_values),
        nullable=False,
        default=ApplicationType.INITIAL_VERIFICATION,
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status", native_enum=True, values_callable=enum_values),
        nullable=False,
        default=ApplicationStatus.SUBMITTED,
        index=True,
    )
    preferred_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    assigned_type: Mapped[str | None] = mapped_column(String(20))  # "LMO" or "GATC"
    assigned_officer_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    scheduled_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    trader_notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    instrument: Mapped["Instrument"] = relationship(back_populates="applications")
    trader: Mapped["User"] = relationship(back_populates="applications", foreign_keys=[trader_id])
    assigned_officer: Mapped["User | None"] = relationship(back_populates="assigned_applications", foreign_keys=[assigned_officer_id])
    inspection: Mapped["InspectionRecord | None"] = relationship(back_populates="application", uselist=False, cascade="all, delete-orphan")
    certificate: Mapped["DigitalCertificate | None"] = relationship(back_populates="application", uselist=False)


class InspectionRecord(Base):
    __tablename__ = "inspection_records"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("verification_applications.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    instrument_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inspector_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    inspection_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    standard_weights_used: Mapped[str] = mapped_column(Text, nullable=False)  # e.g., "Class F1 Standard Weights Set #504"
    observed_max_error: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)  # e.g., 0.01
    tolerance_limit: Mapped[float] = mapped_column(Float, nullable=False, default=0.05)  # e.g., 0.05
    result: Mapped[InspectionResult] = mapped_column(
        Enum(InspectionResult, name="inspection_result", native_enum=True, values_callable=enum_values),
        nullable=False,
        default=InspectionResult.PASSED,
    )
    stamping_mark_no: Mapped[str | None] = mapped_column(String(100))  # e.g. "LM-STAMP-2026-88"
    seal_number: Mapped[str | None] = mapped_column(String(100))  # e.g. "SEAL-99410"
    photo_url: Mapped[str | None] = mapped_column(Text)
    remarks: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    application: Mapped["VerificationApplication"] = relationship(back_populates="inspection")
    instrument: Mapped["Instrument"] = relationship(back_populates="inspections")
    inspector: Mapped["User"] = relationship(back_populates="inspections")


class DigitalCertificate(Base):
    __tablename__ = "digital_certificates"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    certificate_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("verification_applications.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    instrument_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    trader_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inspector_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    issue_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    seal_number: Mapped[str] = mapped_column(String(100), nullable=False)
    security_hash: Mapped[str] = mapped_column(String(128), nullable=False)  # Cryptographic authenticity hash
    qr_code_url: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    application: Mapped["VerificationApplication"] = relationship(back_populates="certificate")
    instrument: Mapped["Instrument"] = relationship(back_populates="certificates")
    trader: Mapped["User"] = relationship(back_populates="certificates", foreign_keys=[trader_id])


class AlertNotification(Base):
    __tablename__ = "alert_notifications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    instrument_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("instruments.id", ondelete="SET NULL")
    )
    certificate_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("digital_certificates.id", ondelete="SET NULL")
    )
    alert_type: Mapped[AlertType] = mapped_column(
        Enum(AlertType, name="alert_type", native_enum=True, values_callable=enum_values),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="alerts")

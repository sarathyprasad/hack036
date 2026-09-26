from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

from app.models import (
    AccuracyClass,
    AlertType,
    ApplicationStatus,
    ApplicationType,
    InspectionResult,
    InstrumentCategory,
    InstrumentStatus,
    UserRole,
)


# User Schemas
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    role: UserRole = UserRole.TRADER
    phone: str | None = None
    organization: str | None = None
    jurisdiction_district: str | None = None


class AdminUserCreate(UserCreate):
    role: UserRole = UserRole.LMO


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=6, max_length=72)


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=6, max_length=72)


class UserPublic(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: UserRole
    phone: str | None = None
    organization: str | None = None
    jurisdiction_district: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


# Instrument Schemas
class InstrumentCreate(BaseModel):
    category: InstrumentCategory = InstrumentCategory.ELECTRONIC_WEIGHING_SCALE
    brand: str = Field(min_length=1, max_length=255)
    model_number: str = Field(min_length=1, max_length=255)
    serial_number: str = Field(min_length=1, max_length=255)
    capacity_rating: str = Field(min_length=1, max_length=100)
    accuracy_class: AccuracyClass = AccuracyClass.CLASS_III
    verification_interval_months: int = 12
    installation_address: str
    district: str
    state: str = "State Legal Metrology Department"
    pincode: str | None = None


class InstrumentUpdate(BaseModel):
    brand: str | None = None
    model_number: str | None = None
    capacity_rating: str | None = None
    accuracy_class: AccuracyClass | None = None
    installation_address: str | None = None
    district: str | None = None
    pincode: str | None = None


class InstrumentPublic(BaseModel):
    id: UUID
    trader_id: UUID
    category: InstrumentCategory
    brand: str
    model_number: str
    serial_number: str
    capacity_rating: str
    accuracy_class: AccuracyClass
    verification_interval_months: int
    installation_address: str
    district: str
    state: str
    pincode: str | None = None
    status: InstrumentStatus
    last_verified_at: datetime | None = None
    next_due_date: datetime | None = None
    created_at: datetime
    trader_name: str | None = None

    model_config = {"from_attributes": True}


# Verification Application Schemas
class VerificationApplicationCreate(BaseModel):
    instrument_id: UUID
    application_type: ApplicationType = ApplicationType.INITIAL_VERIFICATION
    preferred_date: datetime | None = None
    trader_notes: str | None = None


class AssignApplicationRequest(BaseModel):
    assigned_type: str  # "LMO" or "GATC"
    assigned_officer_id: UUID
    scheduled_date: datetime | None = None


class VerificationApplicationPublic(BaseModel):
    id: UUID
    application_number: str
    instrument_id: UUID
    trader_id: UUID
    application_type: ApplicationType
    status: ApplicationStatus
    preferred_date: datetime | None = None
    assigned_type: str | None = None
    assigned_officer_id: UUID | None = None
    assigned_officer_name: str | None = None
    scheduled_date: datetime | None = None
    trader_notes: str | None = None
    created_at: datetime
    updated_at: datetime

    instrument: InstrumentPublic | None = None
    trader: UserPublic | None = None

    model_config = {"from_attributes": True}


# Inspection Record Schemas
class InspectionRecordCreate(BaseModel):
    application_id: UUID
    standard_weights_used: str
    observed_max_error: float
    tolerance_limit: float
    result: InspectionResult
    stamping_mark_no: str | None = None
    seal_number: str | None = None
    photo_url: str | None = None
    remarks: str | None = None


class InspectionRecordPublic(BaseModel):
    id: UUID
    application_id: UUID
    instrument_id: UUID
    inspector_id: UUID
    inspection_date: datetime
    standard_weights_used: str
    observed_max_error: float
    tolerance_limit: float
    result: InspectionResult
    stamping_mark_no: str | None = None
    seal_number: str | None = None
    photo_url: str | None = None
    remarks: str | None = None
    created_at: datetime
    inspector_name: str | None = None

    model_config = {"from_attributes": True}


# Digital Certificate Schemas
class DigitalCertificatePublic(BaseModel):
    id: UUID
    certificate_number: str
    application_id: UUID
    instrument_id: UUID
    trader_id: UUID
    inspector_id: UUID
    issue_date: datetime
    valid_until: datetime
    seal_number: str
    security_hash: str
    qr_code_url: str | None = None
    is_active: bool
    created_at: datetime

    instrument: InstrumentPublic | None = None
    trader: UserPublic | None = None
    inspector_name: str | None = None

    model_config = {"from_attributes": True}


# Public QR Verification Response
class PublicVerificationResult(BaseModel):
    is_valid: bool
    certificate_number: str
    status: str  # "VERIFIED AND ACTIVE", "EXPIRED", "REVOKED / INVALID"
    issue_date: datetime
    valid_until: datetime
    seal_number: str
    security_hash: str
    trader_name: str
    organization: str | None
    district: str
    instrument_category: str
    instrument_brand: str
    instrument_model: str
    instrument_serial: str
    accuracy_class: str
    capacity_rating: str
    inspector_name: str
    verification_authority: str


# Alert Notification Schemas
class AlertNotificationPublic(BaseModel):
    id: UUID
    user_id: UUID
    instrument_id: UUID | None = None
    certificate_id: UUID | None = None
    alert_type: AlertType
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# Dashboard Statistics Schema
class DashboardStats(BaseModel):
    total_instruments: int
    active_verified_instruments: int
    pending_applications: int
    expiring_soon_count: int
    expired_count: int
    total_certificates: int
    assigned_inspections: int
    compliance_rate_percent: float

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole
from app.schemas import ChangePasswordRequest, ResetPasswordRequest, TokenResponse, UserCreate, UserLogin, UserPublic
from app.security import create_access_token, hash_password, verify_password
from app.deps import get_current_user, require_officer

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    existing = db.scalar(select(User).where(func.lower(User.email) == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user_count = db.scalar(select(func.count()).select_from(User)) or 0
    # First user is admin, otherwise use requested role (defaults to TRADER)
    role = UserRole.ADMIN if user_count == 0 else payload.role
    user = User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        phone=payload.phone,
        organization=payload.organization,
        jurisdiction_district=payload.jurisdiction_district,
        role=role,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.role.value)
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(func.lower(User.email) == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(user.id, user.role.value)
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/officers", response_model=list[UserPublic])
def list_officers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    officers = db.scalars(
        select(User).where(User.role.in_([UserRole.LMO, UserRole.GATC, UserRole.ADMIN, UserRole.ENFORCEMENT_OFFICIAL]))
    ).all()
    return [UserPublic.model_validate(u) for u in officers]


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.scalar(select(User).where(func.lower(User.email) == payload.email.lower()))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found with provided email")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": f"Password reset successfully for {user.email}"}


@router.post("/reset-demo-passwords")
def reset_demo_passwords(db: Session = Depends(get_db)):
    demo_accounts = [
        ("admin@legalmetrology.gov.in", "Admin@123"),
        ("lmo.delhi@legalmetrology.gov.in", "Lmo@12345"),
        ("gatc.north@gatc.gov.in", "Gatc@12345"),
        ("apex.logistics@trader.com", "Trader@12345"),
    ]
    reset_count = 0
    for email, passw in demo_accounts:
        u = db.scalar(select(User).where(func.lower(User.email) == email))
        if u:
            u.password_hash = hash_password(passw)
            reset_count += 1

    db.commit()
    return {"message": f"Successfully reset credentials for {reset_count} demo accounts back to default."}


from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user
from app.models import Instrument, InstrumentStatus, User, UserRole
from app.schemas import InstrumentCreate, InstrumentPublic, InstrumentUpdate

router = APIRouter(prefix="/instruments", tags=["instruments"])


@router.post("", response_model=InstrumentPublic, status_code=status.HTTP_201_CREATED)
def create_instrument(
    payload: InstrumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    serial = payload.serial_number.strip()
    existing = db.scalar(select(Instrument).where(Instrument.serial_number == serial))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An instrument with serial number '{serial}' is already registered in the system."
        )

    instrument = Instrument(
        trader_id=current_user.id,
        category=payload.category,
        brand=payload.brand.strip(),
        model_number=payload.model_number.strip(),
        serial_number=serial,
        capacity_rating=payload.capacity_rating.strip(),
        accuracy_class=payload.accuracy_class,
        verification_interval_months=payload.verification_interval_months,
        installation_address=payload.installation_address.strip(),
        district=payload.district.strip(),
        state=payload.state.strip(),
        pincode=payload.pincode.strip() if payload.pincode else None,
        status=InstrumentStatus.UNVERIFIED,
    )
    db.add(instrument)
    db.commit()
    db.refresh(instrument)
    
    res = InstrumentPublic.model_validate(instrument)
    res.trader_name = current_user.name
    return res


@router.get("", response_model=list[InstrumentPublic])
def list_instruments(
    district: str | None = Query(None),
    status: InstrumentStatus | None = Query(None),
    category: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Instrument).options(joinedload(Instrument.trader))

    # Traders only see their registered instruments
    if current_user.role == UserRole.TRADER:
        query = query.where(Instrument.trader_id == current_user.id)
    
    if district:
        query = query.where(Instrument.district == district)
    if status:
        query = query.where(Instrument.status == status)
    if category:
        query = query.where(Instrument.category == category)

    query = query.order_by(Instrument.created_at.desc())
    instruments = db.scalars(query).all()

    results = []
    for inst in instruments:
        pub = InstrumentPublic.model_validate(inst)
        if inst.trader:
            pub.trader_name = inst.trader.name
        results.append(pub)
    return results


@router.get("/{instrument_id}", response_model=InstrumentPublic)
def get_instrument(
    instrument_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inst = db.scalar(
        select(Instrument).options(joinedload(Instrument.trader)).where(Instrument.id == instrument_id)
    )
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")
    
    if current_user.role == UserRole.TRADER and inst.trader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this instrument")

    pub = InstrumentPublic.model_validate(inst)
    if inst.trader:
        pub.trader_name = inst.trader.name
    return pub


@router.put("/{instrument_id}", response_model=InstrumentPublic)
def update_instrument(
    instrument_id: UUID,
    payload: InstrumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inst = db.scalar(
        select(Instrument).options(joinedload(Instrument.trader)).where(Instrument.id == instrument_id)
    )
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")

    if current_user.role == UserRole.TRADER and inst.trader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this instrument")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(inst, field, val)

    db.commit()
    db.refresh(inst)
    pub = InstrumentPublic.model_validate(inst)
    if inst.trader:
        pub.trader_name = inst.trader.name
    return pub

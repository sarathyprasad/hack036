from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import AlertNotification, User
from app.schemas import AlertNotificationPublic

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertNotificationPublic])
def list_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts = db.scalars(
        select(AlertNotification)
        .where(AlertNotification.user_id == current_user.id)
        .order_by(AlertNotification.created_at.desc())
    ).all()
    return [AlertNotificationPublic.model_validate(a) for a in alerts]


@router.post("/{alert_id}/read", status_code=status.HTTP_200_OK)
def mark_alert_read(
    alert_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = db.scalar(
        select(AlertNotification)
        .where(AlertNotification.id == alert_id, AlertNotification.user_id == current_user.id)
    )
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = True
    db.commit()
    return {"status": "success"}


@router.post("/read-all", status_code=status.HTTP_200_OK)
def mark_all_alerts_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.execute(
        update(AlertNotification)
        .where(AlertNotification.user_id == current_user.id)
        .values(is_read=True)
    )
    db.commit()
    return {"status": "success"}

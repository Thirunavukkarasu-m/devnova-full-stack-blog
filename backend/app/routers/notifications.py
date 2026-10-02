from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationListResponse, NotificationResponse
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_user_notifications(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(desc(Notification.created_at)).limit(limit).all()

    unread_cnt = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    items = []
    for n in notifs:
        actor_data = None
        if n.actor:
            actor_data = {
                "id": n.actor.id,
                "first_name": n.actor.first_name,
                "last_name": n.actor.last_name,
                "username": n.actor.username,
                "profile_image": n.actor.profile_image,
            }
        items.append({
            "id": n.id,
            "user_id": n.user_id,
            "actor_id": n.actor_id,
            "actor": actor_data,
            "blog_id": n.blog_id,
            "type": n.type,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at,
        })

    return {
        "items": items,
        "unread_count": unread_cnt,
    }


@router.patch("/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read."}


@router.patch("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({Notification.is_read: True})
    db.commit()
    return {"message": "All notifications marked as read."}

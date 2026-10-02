from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class NotificationActor(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    username: str
    profile_image: Optional[str] = None


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    actor_id: Optional[int] = None
    actor: Optional[NotificationActor] = None
    blog_id: Optional[int] = None
    type: str
    message: str
    is_read: bool
    created_at: datetime


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    unread_count: int

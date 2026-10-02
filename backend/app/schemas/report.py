from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.report import ReportStatus


class ReportCreate(BaseModel):
    blog_id: Optional[int] = None
    comment_id: Optional[int] = None
    reported_user_id: Optional[int] = None
    reason: str = Field(..., min_length=2, max_length=100)
    details: Optional[str] = None


class ReportUpdate(BaseModel):
    status: ReportStatus


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reporter_id: int
    reporter_username: Optional[str] = None
    blog_id: Optional[int] = None
    blog_title: Optional[str] = None
    comment_id: Optional[int] = None
    reported_user_id: Optional[int] = None
    reported_username: Optional[str] = None
    reason: str
    details: Optional[str] = None
    status: ReportStatus
    created_at: datetime
    updated_at: datetime

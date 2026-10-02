from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class CommentAuthor(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    username: str
    profile_image: Optional[str] = None


class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class CommentCreate(CommentBase):
    parent_id: Optional[int] = None


class CommentUpdate(CommentBase):
    pass


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    blog_id: int
    user_id: int
    user: CommentAuthor
    parent_id: Optional[int] = None
    content: str
    is_deleted: bool
    likes_count: int = 0
    is_liked: Optional[bool] = False
    replies: List[CommentResponse] = []
    created_at: datetime
    updated_at: datetime


CommentResponse.model_rebuild()

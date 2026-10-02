from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    slug: Optional[str] = None


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    blogs_count: Optional[int] = 0

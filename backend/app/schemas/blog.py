from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.blog import BlogStatus
from app.schemas.category import CategoryResponse
from app.schemas.tag import TagResponse


class BlogAuthorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    username: str
    profile_image: Optional[str] = None
    role: str


class BlogBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: str = Field(..., min_length=10)
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[BlogStatus] = BlogStatus.DRAFT


class BlogCreate(BlogBase):
    tags: Optional[List[str]] = []


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    tags: Optional[List[str]] = None
    status: Optional[BlogStatus] = None


class BlogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    author: BlogAuthorResponse
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    category: Optional[CategoryResponse] = None
    tags: List[TagResponse] = []
    status: BlogStatus
    reading_time: int
    views: int
    likes_count: int = 0
    bookmarks_count: int = 0
    comments_count: int = 0
    is_liked: Optional[bool] = False
    is_bookmarked: Optional[bool] = False
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class PaginationMeta(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    has_next: bool
    has_prev: bool


class BlogListResponse(BaseModel):
    items: List[BlogResponse]
    meta: PaginationMeta

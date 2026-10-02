import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.database import Base


class BlogStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


# Association table for Blog <-> Tag
blog_tags = Table(
    "blog_tags",
    Base.metadata,
    Column("blog_id", Integer, ForeignKey("blogs.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(300), unique=True, index=True, nullable=False)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    cover_image = Column(String(500), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(Enum(BlogStatus), default=BlogStatus.DRAFT, nullable=False)
    reading_time = Column(Integer, default=1, nullable=False)  # in minutes
    views = Column(Integer, default=0, nullable=False)
    published_at = Column(DateTime, nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    author = relationship("User", back_populates="blogs")
    category = relationship("Category", back_populates="blogs")
    tags = relationship("Tag", secondary=blog_tags, back_populates="blogs")
    comments = relationship("Comment", back_populates="blog", cascade="all, delete-orphan")
    likes = relationship("BlogLike", back_populates="blog", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="blog", cascade="all, delete-orphan")

import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class ReportStatus(str, enum.Enum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    blog_id = Column(Integer, ForeignKey("blogs.id", ondelete="SET NULL"), nullable=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id", ondelete="SET NULL"), nullable=True, index=True)
    reported_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reason = Column(String(100), nullable=False)  # Spam, Abusive content, Copyright, Misleading content, Other
    details = Column(Text, nullable=True)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    reporter = relationship("User", foreign_keys=[reporter_id])
    blog = relationship("Blog")
    comment = relationship("Comment")
    reported_user = relationship("User", foreign_keys=[reported_user_id])

import math
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.blog import Blog, BlogStatus
from app.models.comment import Comment
from app.models.report import Report, ReportStatus
from app.models.category import Category
from app.models.tag import Tag
from app.schemas.analytics import AdminAnalyticsResponse
from app.schemas.user import UserResponse, UserRoleUpdate, UserStatusUpdate
from app.schemas.blog import BlogResponse, BlogListResponse
from app.schemas.report import ReportResponse, ReportUpdate
from app.services.analytics_service import AnalyticsService
from app.dependencies.auth import require_admin
from app.routers.users import enrich_user_response
from app.routers.blogs import enrich_blog

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_platform_analytics(db: Session = Depends(get_db)):
    return AnalyticsService.get_admin_analytics(db)


# ---------------- USER MANAGEMENT ----------------
@router.get("/users")
def list_admin_users(
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    query = db.query(User)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.username.ilike(search_term),
                User.email.ilike(search_term),
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
            )
        )

    if role:
        query = query.filter(User.role == role)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    query = query.order_by(desc(User.created_at))

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()

    items = [enrich_user_response(u, db, current_admin.id) for u in users]
    return {
        "items": items,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        }
    }


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role_in: UserRoleUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot modify your own administrative role.")

    user.role = role_in.role
    db.commit()
    db.refresh(user)
    return enrich_user_response(user, db, current_admin.id)


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: int,
    status_in: UserStatusUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot deactivate your own administrative account.")

    user.is_active = status_in.is_active
    db.commit()
    db.refresh(user)
    return enrich_user_response(user, db, current_admin.id)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own administrative account.")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully."}


# ---------------- BLOG MANAGEMENT ----------------
@router.get("/blogs")
def list_admin_blogs(
    search: Optional[str] = None,
    status: Optional[BlogStatus] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    query = db.query(Blog)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.join(Blog.author).filter(
            or_(
                Blog.title.ilike(search_term),
                Blog.slug.ilike(search_term),
                User.username.ilike(search_term),
            )
        )

    if status:
        query = query.filter(Blog.status == status)

    query = query.order_by(desc(Blog.created_at))

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    blogs = query.offset(offset).limit(limit).all()

    items = [enrich_blog(b, db, current_admin.id) for b in blogs]
    return {
        "items": items,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        }
    }


@router.patch("/blogs/{blog_id}/status", response_model=BlogResponse)
def update_blog_status(
    blog_id: int,
    new_status: BlogStatus = Body(..., embed=True),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found.")

    if new_status == BlogStatus.PUBLISHED and blog.status != BlogStatus.PUBLISHED:
        blog.published_at = datetime.now(timezone.utc)
    blog.status = new_status

    db.commit()
    db.refresh(blog)
    return enrich_blog(blog, db, current_admin.id)


@router.delete("/blogs/{blog_id}")
def delete_admin_blog(
    blog_id: int,
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found.")

    db.delete(blog)
    db.commit()
    return {"message": "Blog permanently deleted by admin."}


# ---------------- REPORTS MANAGEMENT ----------------
@router.get("/reports")
def list_reports(
    status: Optional[ReportStatus] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if status:
        query = query.filter(Report.status == status)

    query = query.order_by(desc(Report.created_at))

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    reports = query.offset(offset).limit(limit).all()

    items = []
    for r in reports:
        items.append({
            "id": r.id,
            "reporter_id": r.reporter_id,
            "reporter_username": r.reporter.username if r.reporter else "Unknown",
            "blog_id": r.blog_id,
            "blog_title": r.blog.title if r.blog else None,
            "comment_id": r.comment_id,
            "reported_user_id": r.reported_user_id,
            "reported_username": r.reported_user.username if r.reported_user else None,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        })

    return {
        "items": items,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        }
    }


@router.patch("/reports/{report_id}", response_model=ReportResponse)
def update_report_status(
    report_id: int,
    report_in: ReportUpdate,
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    report.status = report_in.status
    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "reporter_id": report.reporter_id,
        "reporter_username": report.reporter.username if report.reporter else "Unknown",
        "blog_id": report.blog_id,
        "blog_title": report.blog.title if report.blog else None,
        "comment_id": report.comment_id,
        "reported_user_id": report.reported_user_id,
        "reported_username": report.reported_user.username if report.reported_user else None,
        "reason": report.reason,
        "details": report.details,
        "status": report.status,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
    }

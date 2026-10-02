import math
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.blog import Blog, BlogStatus, blog_tags
from app.models.category import Category
from app.models.tag import Tag
from app.models.like import BlogLike
from app.models.bookmark import Bookmark
from app.models.comment import Comment
from app.models.follow import Follow
from app.models.notification import Notification
from app.schemas.blog import (
    BlogCreate,
    BlogUpdate,
    BlogResponse,
    BlogListResponse,
    PaginationMeta,
)
from app.schemas.analytics import AuthorAnalyticsResponse
from app.services.blog_service import BlogService
from app.services.analytics_service import AnalyticsService
from app.dependencies.auth import get_current_user, get_current_user_optional, require_author

router = APIRouter(prefix="/blogs", tags=["Blogs"])


def enrich_blog(blog: Blog, db: Session, current_user_id: Optional[int] = None) -> dict:
    likes_cnt = db.query(BlogLike).filter(BlogLike.blog_id == blog.id).count()
    bookmarks_cnt = db.query(Bookmark).filter(Bookmark.blog_id == blog.id).count()
    comments_cnt = db.query(Comment).filter(Comment.blog_id == blog.id, Comment.is_deleted == False).count()

    is_liked = False
    is_bookmarked = False
    if current_user_id:
        is_liked = bool(db.query(BlogLike).filter(BlogLike.blog_id == blog.id, BlogLike.user_id == current_user_id).first())
        is_bookmarked = bool(db.query(Bookmark).filter(Bookmark.blog_id == blog.id, Bookmark.user_id == current_user_id).first())

    return {
        "id": blog.id,
        "author_id": blog.author_id,
        "author": {
            "id": blog.author.id,
            "first_name": blog.author.first_name,
            "last_name": blog.author.last_name,
            "username": blog.author.username,
            "profile_image": blog.author.profile_image,
            "role": blog.author.role,
        },
        "title": blog.title,
        "slug": blog.slug,
        "excerpt": blog.excerpt,
        "content": blog.content,
        "cover_image": blog.cover_image,
        "category_id": blog.category_id,
        "category": blog.category,
        "tags": blog.tags,
        "status": blog.status,
        "reading_time": blog.reading_time,
        "views": blog.views,
        "likes_count": likes_cnt,
        "bookmarks_count": bookmarks_cnt,
        "comments_count": comments_cnt,
        "is_liked": is_liked,
        "is_bookmarked": is_bookmarked,
        "published_at": blog.published_at,
        "created_at": blog.created_at,
        "updated_at": blog.updated_at,
    }


@router.get("", response_model=BlogListResponse)
def list_blogs(
    search: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    author: Optional[str] = None,
    sort_by: Optional[str] = "latest",  # latest, oldest, views, likes
    page: int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Blog).filter(Blog.status == BlogStatus.PUBLISHED)

    # Search filter
    if search:
        search_term = f"%{search.strip()}%"
        query = query.join(Blog.author).outerjoin(Blog.tags).filter(
            or_(
                Blog.title.ilike(search_term),
                Blog.excerpt.ilike(search_term),
                Blog.content.ilike(search_term),
                User.username.ilike(search_term),
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
                Tag.name.ilike(search_term),
            )
        ).distinct()

    # Category filter
    if category:
        query = query.join(Blog.category).filter(Category.slug == category)

    # Tag filter
    if tag:
        query = query.join(Blog.tags).filter(Tag.slug == tag)

    # Author filter
    if author:
        query = query.join(Blog.author).filter(User.username == author)

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(asc(Blog.published_at), asc(Blog.created_at))
    elif sort_by == "views":
        query = query.order_by(desc(Blog.views))
    elif sort_by == "likes":
        # Group or subquery order by likes
        query = query.outerjoin(BlogLike).group_by(Blog.id).order_by(desc(func.count(BlogLike.id)))
    else:  # latest
        query = query.order_by(desc(Blog.published_at), desc(Blog.created_at))

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    blogs = query.offset(offset).limit(limit).all()

    current_id = current_user.id if current_user else None
    items = [enrich_blog(b, db, current_id) for b in blogs]

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


@router.get("/user/my-blogs", response_model=BlogListResponse)
def get_my_blogs(
    status: Optional[BlogStatus] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Blog).filter(Blog.author_id == current_user.id)
    if status:
        query = query.filter(Blog.status == status)
    query = query.order_by(desc(Blog.created_at))

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    blogs = query.offset(offset).limit(limit).all()

    items = [enrich_blog(b, db, current_user.id) for b in blogs]
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


@router.get("/user/bookmarks", response_model=BlogListResponse)
def get_my_bookmarks(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Blog).join(Bookmark).filter(Bookmark.user_id == current_user.id).order_by(desc(Bookmark.created_at))

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    blogs = query.offset(offset).limit(limit).all()

    items = [enrich_blog(b, db, current_user.id) for b in blogs]
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


@router.get("/user/analytics", response_model=AuthorAnalyticsResponse)
def get_my_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_author_analytics(db, current_user.id)


@router.get("/{slug_or_id}", response_model=BlogResponse)
def get_blog(
    slug_or_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if slug_or_id.isdigit():
        blog = db.query(Blog).filter(Blog.id == int(slug_or_id)).first()
    else:
        blog = db.query(Blog).filter(Blog.slug == slug_or_id).first()

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found."
        )

    # Check draft access
    if blog.status != BlogStatus.PUBLISHED:
        if not current_user or (current_user.id != blog.author_id and current_user.role != UserRole.ADMIN):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this unpublished draft."
            )

    current_id = current_user.id if current_user else None
    return enrich_blog(blog, db, current_id)


@router.get("/{slug_or_id}/related", response_model=List[BlogResponse])
def get_related_blogs(
    slug_or_id: str,
    limit: int = 4,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if slug_or_id.isdigit():
        blog = db.query(Blog).filter(Blog.id == int(slug_or_id)).first()
    else:
        blog = db.query(Blog).filter(Blog.slug == slug_or_id).first()

    if not blog:
        return []

    related = db.query(Blog).filter(
        Blog.id != blog.id,
        Blog.status == BlogStatus.PUBLISHED,
        Blog.category_id == blog.category_id
    ).order_by(desc(Blog.views)).limit(limit).all()

    # If not enough in same category, fallback to latest
    if len(related) < limit:
        remaining = limit - len(related)
        existing_ids = [b.id for b in related] + [blog.id]
        more = db.query(Blog).filter(
            Blog.id.notin_(existing_ids),
            Blog.status == BlogStatus.PUBLISHED
        ).order_by(desc(Blog.published_at)).limit(remaining).all()
        related.extend(more)

    current_id = current_user.id if current_user else None
    return [enrich_blog(b, db, current_id) for b in related]


@router.post("/{slug}/view")
def increment_view(slug: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if blog:
        blog.views += 1
        db.commit()
        return {"views": blog.views}
    return {"views": 0}


@router.post("", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
def create_blog(
    blog_in: BlogCreate,
    current_user: User = Depends(require_author),
    db: Session = Depends(get_db)
):
    slug = blog_in.slug or BlogService.generate_slug(db, blog_in.title)
    reading_time = BlogService.calculate_reading_time(blog_in.content)

    published_at = None
    if blog_in.status == BlogStatus.PUBLISHED:
        published_at = datetime.now(timezone.utc)

    # Excerpt generation fallback if empty
    excerpt = blog_in.excerpt
    if not excerpt:
        words = blog_in.content.split()
        excerpt = " ".join(words[:25]) + ("..." if len(words) > 25 else "")

    new_blog = Blog(
        author_id=current_user.id,
        title=blog_in.title,
        slug=slug,
        excerpt=excerpt,
        content=blog_in.content,
        cover_image=blog_in.cover_image or "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        category_id=blog_in.category_id,
        status=blog_in.status or BlogStatus.DRAFT,
        reading_time=reading_time,
        published_at=published_at,
    )
    db.add(new_blog)
    db.flush()

    if blog_in.tags:
        new_blog.tags = BlogService.sync_tags(db, blog_in.tags)

    db.commit()
    db.refresh(new_blog)

    # Notify followers if published immediately
    if new_blog.status == BlogStatus.PUBLISHED:
        followers = db.query(Follow).filter(Follow.following_id == current_user.id).all()
        for f in followers:
            notif = Notification(
                user_id=f.follower_id,
                actor_id=current_user.id,
                blog_id=new_blog.id,
                type="blog_published",
                message=f"@{current_user.username} published a new article: '{new_blog.title}'",
            )
            db.add(notif)
        db.commit()

    return enrich_blog(new_blog, db, current_user.id)


@router.put("/{blog_id}", response_model=BlogResponse)
def update_blog(
    blog_id: int,
    blog_in: BlogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found."
        )

    if blog.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to edit this article."
        )

    if blog_in.title and blog_in.title != blog.title:
        blog.title = blog_in.title
        if not blog_in.slug:
            blog.slug = BlogService.generate_slug(db, blog_in.title, blog_id=blog.id)

    if blog_in.slug:
        blog.slug = blog_in.slug
    if blog_in.excerpt is not None:
        blog.excerpt = blog_in.excerpt
    if blog_in.content is not None:
        blog.content = blog_in.content
        blog.reading_time = BlogService.calculate_reading_time(blog_in.content)
    if blog_in.cover_image is not None:
        blog.cover_image = blog_in.cover_image
    if blog_in.category_id is not None:
        blog.category_id = blog_in.category_id

    # Status update logic
    if blog_in.status:
        if blog_in.status == BlogStatus.PUBLISHED and blog.status != BlogStatus.PUBLISHED:
            blog.published_at = datetime.now(timezone.utc)
        blog.status = blog_in.status

    if blog_in.tags is not None:
        blog.tags = BlogService.sync_tags(db, blog_in.tags)

    db.commit()
    db.refresh(blog)
    return enrich_blog(blog, db, current_user.id)


@router.delete("/{blog_id}")
def delete_blog(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found."
        )

    if blog.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this article."
        )

    db.delete(blog)
    db.commit()
    return {"message": "Blog deleted successfully."}


@router.post("/{blog_id}/like")
def toggle_like_blog(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found."
        )

    existing_like = db.query(BlogLike).filter(
        BlogLike.blog_id == blog_id,
        BlogLike.user_id == current_user.id
    ).first()

    if existing_like:
        db.delete(existing_like)
        db.commit()
        likes_cnt = db.query(BlogLike).filter(BlogLike.blog_id == blog_id).count()
        return {"is_liked": False, "likes_count": likes_cnt, "message": "Removed like."}
    else:
        new_like = BlogLike(blog_id=blog_id, user_id=current_user.id)
        db.add(new_like)

        # Notify author if not liking own blog
        if blog.author_id != current_user.id:
            notif = Notification(
                user_id=blog.author_id,
                actor_id=current_user.id,
                blog_id=blog.id,
                type="like",
                message=f"@{current_user.username} liked your article '{blog.title}'.",
            )
            db.add(notif)

        db.commit()
        likes_cnt = db.query(BlogLike).filter(BlogLike.blog_id == blog_id).count()
        return {"is_liked": True, "likes_count": likes_cnt, "message": "Article liked."}


@router.post("/{blog_id}/bookmark")
def toggle_bookmark_blog(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found."
        )

    existing_bm = db.query(Bookmark).filter(
        Bookmark.blog_id == blog_id,
        Bookmark.user_id == current_user.id
    ).first()

    if existing_bm:
        db.delete(existing_bm)
        db.commit()
        bm_cnt = db.query(Bookmark).filter(Bookmark.blog_id == blog_id).count()
        return {"is_bookmarked": False, "bookmarks_count": bm_cnt, "message": "Removed from bookmarks."}
    else:
        new_bm = Bookmark(blog_id=blog_id, user_id=current_user.id)
        db.add(new_bm)
        db.commit()
        bm_cnt = db.query(Bookmark).filter(Bookmark.blog_id == blog_id).count()
        return {"is_bookmarked": True, "bookmarks_count": bm_cnt, "message": "Added to bookmarks."}

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.tag import Tag
from app.models.blog import Blog, BlogStatus, blog_tags
from app.schemas.tag import TagResponse

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("", response_model=List[TagResponse])
def get_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    results = []
    for t in tags:
        cnt = db.query(blog_tags).join(Blog).filter(
            blog_tags.c.tag_id == t.id,
            Blog.status == BlogStatus.PUBLISHED
        ).count()
        results.append({
            "id": t.id,
            "name": t.name,
            "slug": t.slug,
            "created_at": t.created_at,
            "blogs_count": cnt,
        })
    results.sort(key=lambda x: x["blogs_count"], reverse=True)
    return results


@router.get("/{slug}", response_model=TagResponse)
def get_tag_by_slug(slug: str, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.slug == slug).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found.")

    cnt = db.query(blog_tags).join(Blog).filter(
        blog_tags.c.tag_id == tag.id,
        Blog.status == BlogStatus.PUBLISHED
    ).count()

    return {
        "id": tag.id,
        "name": tag.name,
        "slug": tag.slug,
        "created_at": tag.created_at,
        "blogs_count": cnt,
    }

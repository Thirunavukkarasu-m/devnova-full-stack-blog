import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.category import Category
from app.models.blog import Blog, BlogStatus
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryWithCountResponse
from app.dependencies.auth import require_admin

router = APIRouter(prefix="/categories", tags=["Categories"])


def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", text)


@router.get("", response_model=List[CategoryWithCountResponse])
def get_all_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    results = []
    for cat in categories:
        count = db.query(Blog).filter(
            Blog.category_id == cat.id,
            Blog.status == BlogStatus.PUBLISHED
        ).count()
        results.append({
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "image": cat.image,
            "created_at": cat.created_at,
            "updated_at": cat.updated_at,
            "article_count": count,
        })
    results.sort(key=lambda x: x["article_count"], reverse=True)
    return results


@router.get("/{slug}", response_model=CategoryWithCountResponse)
def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    count = db.query(Blog).filter(
        Blog.category_id == cat.id,
        Blog.status == BlogStatus.PUBLISHED
    ).count()

    return {
        "id": cat.id,
        "name": cat.name,
        "slug": cat.slug,
        "description": cat.description,
        "image": cat.image,
        "created_at": cat.created_at,
        "updated_at": cat.updated_at,
        "article_count": count,
    }


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    slug = cat_in.slug or slugify(cat_in.name)
    existing = db.query(Category).filter(
        (Category.name == cat_in.name) | (Category.slug == slug)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A category with this name or slug already exists.")

    new_cat = Category(
        name=cat_in.name,
        slug=slug,
        description=cat_in.description,
        image=cat_in.image or "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat


@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(
    cat_id: int,
    cat_in: CategoryUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    if cat_in.name:
        cat.name = cat_in.name
    if cat_in.slug:
        cat.slug = cat_in.slug
    elif cat_in.name:
        cat.slug = slugify(cat_in.name)
    if cat_in.description is not None:
        cat.description = cat_in.description
    if cat_in.image is not None:
        cat.image = cat_in.image

    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{cat_id}")
def delete_category(
    cat_id: int,
    force: bool = False,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    dependent_count = db.query(Blog).filter(Blog.category_id == cat_id).count()
    if dependent_count > 0 and not force:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category: {dependent_count} article(s) are linked to it. Reassign articles or pass force=true."
        )

    if force:
        db.query(Blog).filter(Blog.category_id == cat_id).update({Blog.category_id: None})

    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully."}

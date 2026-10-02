from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.profile import Profile
from app.models.blog import Blog, BlogStatus
from app.models.follow import Follow
from app.models.like import BlogLike
from app.models.notification import Notification
from app.schemas.user import UserResponse
from app.schemas.profile import ProfileUpdate
from app.dependencies.auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/users", tags=["Users"])


def enrich_user_response(user: User, db: Session, current_user_id: Optional[int] = None) -> dict:
    followers_cnt = db.query(Follow).filter(Follow.following_id == user.id).count()
    following_cnt = db.query(Follow).filter(Follow.follower_id == user.id).count()
    blogs_cnt = db.query(Blog).filter(Blog.author_id == user.id, Blog.status == BlogStatus.PUBLISHED).count()
    likes_cnt = db.query(BlogLike).join(Blog).filter(Blog.author_id == user.id).count()

    is_following = False
    if current_user_id:
        is_following = bool(
            db.query(Follow).filter(
                Follow.follower_id == current_user_id,
                Follow.following_id == user.id
            ).first()
        )

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "auth_provider": user.auth_provider,
        "profile_image": user.profile_image,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "profile": user.profile,
        "followers_count": followers_cnt,
        "following_count": following_cnt,
        "blogs_count": blogs_cnt,
        "total_likes_received": likes_cnt,
        "is_following": is_following,
    }


@router.get("/popular", response_model=List[UserResponse])
def get_popular_authors(
    limit: int = 6,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    users = db.query(User).filter(
        User.is_active == True,
        User.role.in_([UserRole.AUTHOR, UserRole.ADMIN])
    ).limit(limit).all()

    current_id = current_user.id if current_user else None
    return [enrich_user_response(u, db, current_id) for u in users]


@router.get("/{username}", response_model=UserResponse)
def get_user_by_username(
    username: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    current_id = current_user.id if current_user else None
    return enrich_user_response(user, db, current_id)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update User fields if provided
    if profile_in.first_name:
        current_user.first_name = profile_in.first_name
    if profile_in.last_name:
        current_user.last_name = profile_in.last_name
    if profile_in.profile_image:
        current_user.profile_image = profile_in.profile_image

    # Ensure profile object exists
    if not current_user.profile:
        current_user.profile = Profile(user_id=current_user.id)
        db.add(current_user.profile)

    # Update profile fields
    if profile_in.bio is not None:
        current_user.profile.bio = profile_in.bio
    if profile_in.website is not None:
        current_user.profile.website = profile_in.website
    if profile_in.github_profile is not None:
        current_user.profile.github_profile = profile_in.github_profile
    if profile_in.linkedin_profile is not None:
        current_user.profile.linkedin_profile = profile_in.linkedin_profile
    if profile_in.location is not None:
        current_user.profile.location = profile_in.location

    db.commit()
    db.refresh(current_user)
    return enrich_user_response(current_user, db, current_user.id)


@router.post("/{user_id}/follow")
def toggle_follow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot follow yourself."
        )

    target_user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    existing_follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()

    if existing_follow:
        db.delete(existing_follow)
        db.commit()
        followers_cnt = db.query(Follow).filter(Follow.following_id == user_id).count()
        return {"is_following": False, "followers_count": followers_cnt, "message": f"Unfollowed @{target_user.username}"}
    else:
        new_follow = Follow(follower_id=current_user.id, following_id=user_id)
        db.add(new_follow)

        # Create notification for target user
        notif = Notification(
            user_id=target_user.id,
            actor_id=current_user.id,
            type="follow",
            message=f"@{current_user.username} started following you.",
        )
        db.add(notif)
        db.commit()

        followers_cnt = db.query(Follow).filter(Follow.following_id == user_id).count()
        return {"is_following": True, "followers_count": followers_cnt, "message": f"Now following @{target_user.username}"}


@router.get("/{user_id}/followers", response_model=List[UserResponse])
def get_user_followers(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    follows = db.query(Follow).filter(Follow.following_id == user_id).all()
    current_id = current_user.id if current_user else None
    return [enrich_user_response(f.follower, db, current_id) for f in follows if f.follower]


@router.get("/{user_id}/following", response_model=List[UserResponse])
def get_user_following(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    follows = db.query(Follow).filter(Follow.follower_id == user_id).all()
    current_id = current_user.id if current_user else None
    return [enrich_user_response(f.following, db, current_id) for f in follows if f.following]

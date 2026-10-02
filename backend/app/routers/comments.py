from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.blog import Blog
from app.models.comment import Comment
from app.models.like import CommentLike
from app.models.notification import Notification
from app.models.report import Report
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.schemas.report import ReportCreate
from app.dependencies.auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/comments", tags=["Comments"])


def build_comment_dict(comment: Comment, db: Session, current_user_id: Optional[int] = None) -> dict:
    likes_cnt = db.query(CommentLike).filter(CommentLike.comment_id == comment.id).count()
    is_liked = False
    if current_user_id:
        is_liked = bool(db.query(CommentLike).filter(CommentLike.comment_id == comment.id, CommentLike.user_id == current_user_id).first())

    replies = []
    if comment.replies:
        for r in comment.replies:
            replies.append(build_comment_dict(r, db, current_user_id))

    return {
        "id": comment.id,
        "blog_id": comment.blog_id,
        "user_id": comment.user_id,
        "user": {
            "id": comment.user.id,
            "first_name": comment.user.first_name,
            "last_name": comment.user.last_name,
            "username": comment.user.username,
            "profile_image": comment.user.profile_image,
        },
        "parent_id": comment.parent_id,
        "content": "[This comment was deleted]" if comment.is_deleted else comment.content,
        "is_deleted": comment.is_deleted,
        "likes_count": likes_cnt,
        "is_liked": is_liked,
        "replies": replies,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
    }


@router.get("/blog/{blog_id}", response_model=List[CommentResponse])
def get_blog_comments(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Only top-level comments (parent_id is None)
    top_comments = db.query(Comment).filter(
        Comment.blog_id == blog_id,
        Comment.parent_id == None
    ).order_by(desc(Comment.created_at)).all()

    current_id = current_user.id if current_user else None
    return [build_comment_dict(c, db, current_id) for c in top_comments]


@router.post("/blog/{blog_id}", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    blog_id: int,
    comment_in: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found.")

    parent_comment = None
    if comment_in.parent_id:
        parent_comment = db.query(Comment).filter(Comment.id == comment_in.parent_id, Comment.blog_id == blog_id).first()
        if not parent_comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found.")

    new_comment = Comment(
        blog_id=blog_id,
        user_id=current_user.id,
        parent_id=comment_in.parent_id,
        content=comment_in.content,
        is_deleted=False,
    )
    db.add(new_comment)
    db.flush()

    # Notify author or parent comment owner
    if parent_comment and parent_comment.user_id != current_user.id:
        notif = Notification(
            user_id=parent_comment.user_id,
            actor_id=current_user.id,
            blog_id=blog_id,
            type="reply",
            message=f"@{current_user.username} replied to your comment on '{blog.title}'.",
        )
        db.add(notif)
    elif blog.author_id != current_user.id:
        notif = Notification(
            user_id=blog.author_id,
            actor_id=current_user.id,
            blog_id=blog_id,
            type="comment",
            message=f"@{current_user.username} commented on your article '{blog.title}'.",
        )
        db.add(notif)

    db.commit()
    db.refresh(new_comment)
    return build_comment_dict(new_comment, db, current_user.id)


@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    comment_in: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own comments.")

    if comment.is_deleted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot edit a deleted comment.")

    comment.content = comment_in.content
    db.commit()
    db.refresh(comment)
    return build_comment_dict(comment, db, current_user.id)


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

    if comment.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not authorized to delete this comment.")

    # If has replies, soft delete so thread structure is preserved
    if comment.replies:
        comment.is_deleted = True
        comment.content = "[This comment was deleted]"
    else:
        db.delete(comment)

    db.commit()
    return {"message": "Comment deleted successfully."}


@router.post("/{comment_id}/like")
def toggle_like_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

    existing_like = db.query(CommentLike).filter(
        CommentLike.comment_id == comment_id,
        CommentLike.user_id == current_user.id
    ).first()

    if existing_like:
        db.delete(existing_like)
        db.commit()
        likes_cnt = db.query(CommentLike).filter(CommentLike.comment_id == comment_id).count()
        return {"is_liked": False, "likes_count": likes_cnt}
    else:
        new_like = CommentLike(comment_id=comment_id, user_id=current_user.id)
        db.add(new_like)
        db.commit()
        likes_cnt = db.query(CommentLike).filter(CommentLike.comment_id == comment_id).count()
        return {"is_liked": True, "likes_count": likes_cnt}


@router.post("/{comment_id}/report")
def report_comment(
    comment_id: int,
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

    report = Report(
        reporter_id=current_user.id,
        comment_id=comment_id,
        reported_user_id=comment.user_id,
        reason=report_in.reason,
        details=report_in.details,
    )
    db.add(report)
    db.commit()
    return {"message": "Comment reported successfully. Administrators will review it."}

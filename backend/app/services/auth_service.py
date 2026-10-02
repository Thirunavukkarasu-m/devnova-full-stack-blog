import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, UserRole, SocialAccount, PasswordResetToken, RefreshToken
from app.models.profile import Profile
from app.schemas.user import UserCreate, UserResponse
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, username_or_email: str, password: str) -> Optional[User]:
        user = db.query(User).filter(
            (User.email == username_or_email.lower()) | (User.username == username_or_email)
        ).first()

        if not user or not user.password_hash:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        # Check existing email
        if db.query(User).filter(User.email == user_in.email.lower()).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )
        # Check existing username
        if db.query(User).filter(User.username == user_in.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this username already exists."
            )

        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            username=user_in.username,
            email=user_in.email.lower(),
            password_hash=hashed_password,
            role=UserRole.USER,
            is_active=True,
            is_verified=True,
            auth_provider="local",
            profile_image=user_in.profile_image or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        )
        db.add(db_user)
        db.flush()

        # Create associated profile
        db_profile = Profile(
            user_id=db_user.id,
            bio=user_in.bio or "Passionate tech explorer and software engineer.",
        )
        db.add(db_profile)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def create_user_tokens(db: Session, user: User) -> Tuple[str, str]:
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        # Store refresh token
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        db_refresh = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=expires_at,
            is_revoked=False
        )
        db.add(db_refresh)
        db.commit()

        return access_token, refresh_token

    @staticmethod
    def refresh_access_token(db: Session, refresh_token_str: str) -> Tuple[str, str, User]:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        user_id = int(payload.get("sub"))
        token_record = db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token_str,
            RefreshToken.user_id == user_id,
            RefreshToken.is_revoked == False
        ).first()

        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has been revoked or is invalid."
            )

        # Check expiration
        # Ensure timezone-aware comparison
        exp = token_record.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired."
            )

        # Revoke old refresh token (rotation)
        token_record.is_revoked = True

        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or disabled."
            )

        new_access_token = create_access_token(user.id)
        new_refresh_token = create_refresh_token(user.id)

        new_record = RefreshToken(
            user_id=user.id,
            token=new_refresh_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            is_revoked=False
        )
        db.add(new_record)
        db.commit()

        return new_access_token, new_refresh_token, user

    @staticmethod
    def generate_password_reset_token(db: Session, user: User) -> str:
        token = uuid.uuid4().hex
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        reset_token_rec = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at,
            is_used=False
        )
        db.add(reset_token_rec)
        db.commit()
        return token

    @staticmethod
    def reset_password_with_token(db: Session, token: str, new_password: str) -> User:
        rec = db.query(PasswordResetToken).filter(
            PasswordResetToken.token == token,
            PasswordResetToken.is_used == False
        ).first()

        if not rec:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or already used password reset link."
            )

        exp = rec.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset token has expired. Please request a new one."
            )

        user = db.query(User).filter(User.id == rec.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )

        user.password_hash = get_password_hash(new_password)
        rec.is_used = True
        db.commit()
        return user

    @staticmethod
    def get_or_create_oauth_user(
        db: Session,
        provider: str,
        provider_user_id: str,
        email: str,
        first_name: str,
        last_name: str,
        avatar_url: Optional[str] = None,
        bio: Optional[str] = None
    ) -> User:
        # Check if social account exists
        social_acc = db.query(SocialAccount).filter(
            SocialAccount.provider == provider,
            SocialAccount.provider_user_id == str(provider_user_id)
        ).first()

        if social_acc and social_acc.user:
            return social_acc.user

        # Check if user with this email exists
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            # Generate unique username
            base_username = (email.split("@")[0]).lower().replace(".", "_")
            username = base_username
            counter = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}_{counter}"
                counter += 1

            user = User(
                first_name=first_name or "DevNova",
                last_name=last_name or "Developer",
                username=username,
                email=email.lower(),
                password_hash=None,
                role=UserRole.USER,
                is_active=True,
                is_verified=True,
                auth_provider=provider,
                profile_image=avatar_url or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
            )
            db.add(user)
            db.flush()

            profile = Profile(
                user_id=user.id,
                bio=bio or f"Hello, I am using DevNova via {provider.capitalize()}!"
            )
            db.add(profile)

        # Link social account
        social_acc = SocialAccount(
            user_id=user.id,
            provider=provider,
            provider_user_id=str(provider_user_id)
        )
        db.add(social_acc)
        db.commit()
        db.refresh(user)
        return user

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    RefreshTokenRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.core.oauth import OAuthService
from app.dependencies.auth import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if user_in.confirm_password and user_in.password != user_in.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    user = AuthService.register_user(db, user_in)
    access_token, refresh_token = AuthService.create_user_tokens(db, user)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(
        db, credentials.username_or_email, credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact support.",
        )

    access_token, refresh_token = AuthService.create_user_tokens(db, user)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/refresh", response_model=Dict[str, Any])
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    new_access_token, new_refresh_token, user = AuthService.refresh_access_token(
        db, req.refresh_token
    )
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def get_current_authenticated_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    # Always return positive message to prevent email enumeration
    if user:
        token = AuthService.generate_password_reset_token(db, user)
        EmailService.send_password_reset_email(user.email, token)

    return {
        "message": "If that email address exists in our database, we will send you a password reset link shortly."
    }


@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    AuthService.reset_password_with_token(db, req.token, req.new_password)
    return {"message": "Password updated successfully. You can now log in with your new credentials."}


@router.get("/google/url")
def get_google_auth_url(redirect_uri: str = f"{settings.FRONTEND_URL}/login"):
    url = OAuthService.get_google_auth_url(redirect_uri=redirect_uri)
    return {"url": url}


@router.post("/google/callback", response_model=TokenResponse)
async def google_callback(
    code: str = Body(..., embed=True),
    redirect_uri: str = Body(f"{settings.FRONTEND_URL}/login", embed=True),
    db: Session = Depends(get_db)
):
    profile_data = await OAuthService.exchange_google_code(code, redirect_uri)
    if not profile_data or not profile_data.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to authenticate with Google. Please try again."
        )

    user = AuthService.get_or_create_oauth_user(
        db=db,
        provider="google",
        provider_user_id=profile_data.get("sub", profile_data.get("id")),
        email=profile_data["email"],
        first_name=profile_data.get("given_name", "Google"),
        last_name=profile_data.get("family_name", "User"),
        avatar_url=profile_data.get("picture"),
    )

    access_token, refresh_token = AuthService.create_user_tokens(db, user)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/github/url")
def get_github_auth_url(redirect_uri: str = f"{settings.FRONTEND_URL}/login"):
    url = OAuthService.get_github_auth_url(redirect_uri=redirect_uri)
    return {"url": url}


@router.post("/github/callback", response_model=TokenResponse)
async def github_callback(
    code: str = Body(..., embed=True),
    redirect_uri: str = Body(f"{settings.FRONTEND_URL}/login", embed=True),
    db: Session = Depends(get_db)
):
    profile_data = await OAuthService.exchange_github_code(code, redirect_uri)
    if not profile_data or not profile_data.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to authenticate with GitHub. Please verify your permissions and try again."
        )

    name_parts = (profile_data.get("name") or profile_data.get("login") or "GitHub User").split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    user = AuthService.get_or_create_oauth_user(
        db=db,
        provider="github",
        provider_user_id=str(profile_data.get("id")),
        email=profile_data["email"],
        first_name=first_name,
        last_name=last_name or "Developer",
        avatar_url=profile_data.get("avatar_url"),
        bio=profile_data.get("bio"),
    )

    access_token, refresh_token = AuthService.create_user_tokens(db, user)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
    }

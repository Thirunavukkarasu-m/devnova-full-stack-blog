from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None


class UserLogin(BaseModel):
    username_or_email: str
    password: str
    remember_me: Optional[bool] = False


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image: Optional[str] = None


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserProfileMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    bio: Optional[str] = None
    website: Optional[str] = None
    github_profile: Optional[str] = None
    linkedin_profile: Optional[str] = None
    location: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    username: str
    email: str
    role: UserRole
    is_active: bool
    is_verified: bool
    auth_provider: str
    profile_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    profile: Optional[UserProfileMini] = None
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    blogs_count: Optional[int] = 0
    total_likes_received: Optional[int] = 0
    is_following: Optional[bool] = False


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=128)

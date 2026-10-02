from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ProfileBase(BaseModel):
    bio: Optional[str] = None
    website: Optional[str] = None
    github_profile: Optional[str] = None
    linkedin_profile: Optional[str] = None
    location: Optional[str] = None


class ProfileUpdate(ProfileBase):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image: Optional[str] = None


class ProfileResponse(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

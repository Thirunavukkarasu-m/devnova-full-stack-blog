import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "DevNova"
    TAGLINE: str = "Explore. Learn. Build."
    API_V1_STR: str = "/api"

    # Security
    SECRET_KEY: str = "devnova-super-secret-development-jwt-key-2026-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for good dev UX
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql://postgres:xxxx@localhost:5432/devnova"

    # OAuth
    GOOGLE_CLIENT_ID: str = "xxxx"
    GOOGLE_CLIENT_SECRET: str = "xxxx"
    GITHUB_CLIENT_ID: str = "xxxx"
    GITHUB_CLIENT_SECRET: str = "xxxx"

    # Image Storage (Cloudinary)
    CLOUDINARY_CLOUD_NAME: str = "xxxx"
    CLOUDINARY_API_KEY: str = "xxxx"
    CLOUDINARY_API_SECRET: str = "xxxx"

    # Email
    SMTP_HOST: str = "xxxx"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = "xxxx"
    SMTP_PASSWORD: str = "xxxx"
    SMTP_FROM_EMAIL: str = "noreply@devnova.io"

    # URLs
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or v == "xxxx":
            return "devnova-super-secret-production-grade-hmac-key-2026"
        return v


settings = Settings()

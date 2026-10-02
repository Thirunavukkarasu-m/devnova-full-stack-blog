import os
import uuid
import logging
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

logger = logging.getLogger("devnova.images")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB


class ImageService:
    @staticmethod
    def _is_cloudinary_configured() -> bool:
        return bool(
            settings.CLOUDINARY_CLOUD_NAME 
            and settings.CLOUDINARY_CLOUD_NAME != "xxxx"
            and settings.CLOUDINARY_API_KEY 
            and settings.CLOUDINARY_API_KEY != "xxxx"
            and settings.CLOUDINARY_API_SECRET 
            and settings.CLOUDINARY_API_SECRET != "xxxx"
        )

    @classmethod
    async def upload_image(cls, file: UploadFile, folder: str = "devnova") -> str:
        # Validate content type
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{file.content_type}'. Allowed types: JPEG, PNG, WEBP, GIF."
            )

        content = await file.read()
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds maximum allowed limit of 5MB."
            )

        # Check if Cloudinary is configured
        if cls._is_cloudinary_configured():
            try:
                import cloudinary
                import cloudinary.uploader

                cloudinary.config(
                    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                    api_key=settings.CLOUDINARY_API_KEY,
                    api_secret=settings.CLOUDINARY_API_SECRET,
                    secure=True,
                )
                response = cloudinary.uploader.upload(
                    content,
                    folder=folder,
                    resource_type="image",
                )
                secure_url = response.get("secure_url")
                if secure_url:
                    logger.info(f"Image uploaded to Cloudinary: {secure_url}")
                    return secure_url
            except Exception as e:
                logger.error(f"Cloudinary upload failed: {e}. Falling back to local storage.")

        # Fallback to local storage
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(file.filename or "")[1].lower()
        if not ext:
            ext = ".jpg"
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        target_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

        with open(target_path, "wb") as f:
            f.write(content)

        # Return full accessible URL
        file_url = f"{settings.BACKEND_URL}/uploads/{unique_filename}"
        logger.info(f"Image saved locally: {file_url}")
        return file_url

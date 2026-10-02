from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.services.image_service import ImageService
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    url = await ImageService.upload_image(file)
    return {"url": url}

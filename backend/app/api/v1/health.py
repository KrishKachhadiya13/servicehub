from fastapi import APIRouter
from datetime import datetime, timezone
from app.config import settings

router = APIRouter()

@router.get("/health", summary="Perform System Health Check")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

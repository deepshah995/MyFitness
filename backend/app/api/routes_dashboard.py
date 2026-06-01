from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings
from app.core.sheets_client import build_sheets_client
from app.services.sheets_repository import SheetsRepository


router = APIRouter()


@router.get("/dashboard/overview")
async def overview():
    settings = get_settings()
    repo = SheetsRepository(settings=settings, sheets_client=build_sheets_client(settings))
    return {
        "config": repo.get_config(),
        "recent": repo.get_recent_context(days=14),
    }


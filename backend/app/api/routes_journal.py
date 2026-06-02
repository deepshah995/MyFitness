from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.config import get_settings
from app.core.ai_client import build_ai_client  # noqa: F401 (kept for parity)
from app.core.sheets_client import build_sheets_client
from app.models.schemas import BodyStatCreate, JournalEntryCreate
from app.services.sheets_repository import SheetsRepository


router = APIRouter()


@router.post("/entry")
async def add_journal_entry(payload: JournalEntryCreate):
    settings = get_settings()
    repo = SheetsRepository(settings=settings, sheets_client=build_sheets_client(settings))
    entry_id = repo.append_journal_entry(payload.model_dump())
    return {"entry_id": entry_id}


@router.post("/body")
async def add_body_stat(payload: BodyStatCreate):
    settings = get_settings()
    repo = SheetsRepository(settings=settings, sheets_client=build_sheets_client(settings))
    entry_id = repo.append_body_stat(payload.model_dump())
    return {"entry_id": entry_id}


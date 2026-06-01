from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings
from app.core.sheets_client import build_sheets_client
from app.models.schemas import RunLogCreate, StrengthExerciseCreate, StrengthSessionCreate
from app.services.sheets_repository import SheetsRepository


router = APIRouter()


@router.post("/run")
async def add_run_log(payload: RunLogCreate):
    settings = get_settings()
    repo = SheetsRepository(settings=settings, sheets_client=build_sheets_client(settings))
    entry_id = repo.append_run_log(payload.model_dump())
    return {"entry_id": entry_id}


@router.post("/strength-session")
async def add_strength_session(payload: StrengthSessionCreate):
    settings = get_settings()
    repo = SheetsRepository(settings=settings, sheets_client=build_sheets_client(settings))
    entry_id = repo.append_strength_session(payload.model_dump())
    return {"entry_id": entry_id}


@router.post("/strength-exercise")
async def add_strength_exercise(payload: StrengthExerciseCreate):
    settings = get_settings()
    repo = SheetsRepository(settings=settings, sheets_client=build_sheets_client(settings))
    entry_id = repo.append_strength_exercise(payload.model_dump())
    return {"entry_id": entry_id}


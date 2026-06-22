from __future__ import annotations

from fastapi import APIRouter
from app.models.schemas import RunLogCreate, StrengthExerciseCreate, StrengthSessionCreate
from app.core.database import add_client_log

router = APIRouter()

@router.post("/run")
async def add_run_log(payload: RunLogCreate):
    content_str = f"Run logged: {payload.distance_km} km in {payload.duration_min} mins. Pace: {payload.avg_pace_sec_km} sec/km, RPE: {payload.rpe_1_10}. Notes: {payload.notes}"
    add_client_log(
        client_id=payload.client_id or 1,
        log_type="workout",
        content=content_str,
        meta=payload.model_dump()
    )
    return {"entry_id": "sqlite_log"}

@router.post("/strength-session")
async def add_strength_session(payload: StrengthSessionCreate):
    content_str = f"Strength session logged: {payload.session_type}. Week: {payload.program_week}, RPE: {payload.rpe_1_10}. Notes: {payload.notes}"
    add_client_log(
        client_id=payload.client_id or 1,
        log_type="workout",
        content=content_str,
        meta=payload.model_dump()
    )
    return {"entry_id": "sqlite_log"}

@router.post("/strength-exercise")
async def add_strength_exercise(payload: StrengthExerciseCreate):
    content_str = f"Exercise logged: {payload.exercise_name} - {payload.sets} sets x {payload.reps} reps @ {payload.weight_kg} kg."
    add_client_log(
        client_id=payload.client_id or 1,
        log_type="workout",
        content=content_str,
        meta=payload.model_dump()
    )
    return {"entry_id": "sqlite_log"}

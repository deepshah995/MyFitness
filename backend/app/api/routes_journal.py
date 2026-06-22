from __future__ import annotations

from fastapi import APIRouter
from app.models.schemas import BodyStatCreate, JournalEntryCreate
from app.core.database import add_client_log

router = APIRouter()

@router.post("/entry")
async def add_journal_entry(payload: JournalEntryCreate):
    content_str = f"Journal Entry: Sleep: {payload.sleep_hours} hrs (quality {payload.sleep_quality_1_5}/5), Stress: {payload.stress_1_5}/5, Hunger: {payload.hunger_1_5}/5. Steps: {payload.steps}. Glucose: {payload.fasting_glucose_mg_dl} fasting / {payload.post_meal_glucose_mg_dl} post-meal. Notes: {payload.notes}"
    add_client_log(
        client_id=payload.client_id or 1,
        log_type="journal",
        content=content_str,
        meta=payload.model_dump()
    )
    return {"entry_id": "sqlite_journal"}

@router.post("/body")
async def add_body_stat(payload: BodyStatCreate):
    content_str = f"Weight check: {payload.weight_kg} kg, Waist: {payload.waist_cm} cm. Notes: {payload.notes}"
    cid = payload.client_id or 1
    add_client_log(
        client_id=cid,
        log_type="weight",
        content=content_str,
        meta=payload.model_dump()
    )
    
    # Let's also update the client's current weight in their profile so CreatorStudio represents it!
    from app.core.database import get_client, update_client_plan
    client = get_client(cid)
    if client:
        update_client_plan(
            client_id=cid,
            goal=client["goal"],
            weight=f"{payload.weight_kg} kg",
            diet=client["diet"],
            status=client["status"],
            progress=client["progress"]
        )
        
    return {"entry_id": "sqlite_weight"}

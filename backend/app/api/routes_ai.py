from __future__ import annotations

import traceback
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.core.config import get_settings
from app.core.ai_client import build_ai_client
from app.models.schemas import AIChatRequest, AIChatResponse
from app.services.ai_coach import apply_writes_if_allowed, run_coach_chat


router = APIRouter()


@router.post("/chat", response_model=AIChatResponse)
async def chat(req: AIChatRequest) -> AIChatResponse:
    settings = get_settings()
    ai = build_ai_client()
    client_id = req.client_id or 1

    try:
        result = await run_coach_chat(
            ai=ai,
            client_id=client_id,
            settings=settings,
            question=req.question,
            mode=req.mode,
        )
        reply = result.get("reply", "")
        writes = result.get("writes") or []

        applied = 0
        if req.apply_updates and settings.ai_apply_updates:
            applied = apply_writes_if_allowed(client_id=client_id, writes=writes)

        return AIChatResponse(reply=reply, applied_writes=applied, writes_preview=writes[:5])
    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        # Don't leak secrets; keep the error for debugging in server logs.
        raise HTTPException(status_code=500, detail=f"AI chat failed: {e}\n{tb}")


from pydantic import BaseModel

class ProgramParseRequest(BaseModel):
    instruction: str

class ProgramParseResponse(BaseModel):
    calories: str
    protein: str
    diet: str
    focus: str

@router.post("/parse-program", response_model=ProgramParseResponse)
async def parse_program(req: ProgramParseRequest) -> ProgramParseResponse:
    ai = build_ai_client()
    prompt = f"""
    Analyze this fitness coaching instruction:
    "{req.instruction}"
    
    Extract the following plan details:
    - Daily Calories: estimated number as string (default to 2000 if not specified)
    - Daily Protein (grams): estimated number as string (default to 130 if not specified)
    - Diet Preference: must be one of 'Eggetarian', 'Vegan', 'Standard', 'Keto' (default to 'Standard' if not specified)
    - Primary Focus: must be one of 'Recomp', 'Arm Hypertrophy', 'Cardio / Running' (default to 'Recomp' if not specified)
    """
    
    schema = {
        "type": "object",
        "properties": {
            "calories": {"type": "string"},
            "protein": {"type": "string"},
            "diet": {"type": "string", "enum": ["Eggetarian", "Vegan", "Standard", "Keto"]},
            "focus": {"type": "string", "enum": ["Recomp", "Arm Hypertrophy", "Cardio / Running"]}
        },
        "required": ["calories", "protein", "diet", "focus"]
    }
    
    try:
        response = await ai.generate_json(prompt=prompt, response_schema=schema)
        return ProgramParseResponse(
            calories=response.get("calories", "2000"),
            protein=response.get("protein", "130"),
            diet=response.get("diet", "Standard"),
            focus=response.get("focus", "Recomp")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse program prompt: {str(e)}")


# Decoupled Google Sheets fully.


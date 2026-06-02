from __future__ import annotations

import traceback
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.core.config import get_settings
from app.core.ai_client import build_ai_client
from app.models.schemas import AIChatRequest, AIChatResponse
from app.services.ai_coach import apply_writes_if_allowed, run_coach_chat
from app.services.sheets_repository import SheetsRepository


router = APIRouter()


@router.post("/chat", response_model=AIChatResponse)
async def chat(req: AIChatRequest) -> AIChatResponse:
    settings = get_settings()
    sheets = SheetsRepository(settings=settings, sheets_client=build_sheets_client(settings))
    ai = build_ai_client()

    try:
        result = await run_coach_chat(
            ai=ai,
            repo=sheets,
            settings=settings,
            question=req.question,
            mode=req.mode,
        )
        reply = result.get("reply", "")
        writes = result.get("writes") or []

        applied = 0
        if req.apply_updates and settings.ai_apply_updates:
            applied = apply_writes_if_allowed(repo=sheets, writes=writes, mode=req.mode)

        return AIChatResponse(reply=reply, applied_writes=applied, writes_preview=writes[:5])
    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        # Don't leak secrets; keep the error for debugging in server logs.
        raise HTTPException(status_code=500, detail=f"AI chat failed: {e}\n{tb}")


# Late import to avoid unused import linting
from app.core.sheets_client import build_sheets_client  # noqa: E402


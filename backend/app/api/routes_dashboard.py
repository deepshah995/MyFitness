from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings
from app.core.sheets_client import build_sheets_client
from app.services.sheets_repository import SheetsRepository

router = APIRouter()


@router.get("/dashboard/overview")
async def overview():
    settings = get_settings()
    status = {
        "sheets_configured": False,
        "postgres_configured": False,
        "active_mode": "sheets"
    }
    
    try:
        sheets_client = build_sheets_client(settings)
        if sheets_client.service and settings.spreadsheet_id:
            status["sheets_configured"] = True
            
        repo = SheetsRepository(settings=settings, sheets_client=sheets_client)
        
        if not status["sheets_configured"]:
            return {
                "status": status,
                "config": {},
                "recent": {
                    "journal_entries": [],
                    "body_stats": [],
                    "run_logs": [],
                    "strength_sessions": []
                },
                "error": "Sheets client service failed to initialize. Please check Google Cloud credentials."
            }
            
        return {
            "status": status,
            "config": repo.get_config(),
            "recent": repo.get_recent_context(days=14),
        }
    except Exception as e:
        return {
            "status": status,
            "config": {},
            "recent": {
                "journal_entries": [],
                "body_stats": [],
                "run_logs": [],
                "strength_sessions": []
            },
            "error": f"Failed to connect to database: {e}"
        }

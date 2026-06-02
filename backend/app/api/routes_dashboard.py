from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings
from app.core.sheets_client import build_sheets_client
from app.services.sheets_repository import SheetsRepository


router = APIRouter()


@router.get("/dashboard/overview")
async def overview():
    settings = get_settings()
    
    gemini_configured = bool(settings.gemini_api_key)
    sheets_configured = bool(settings.spreadsheet_id)
    
    status = {
        "gemini_configured": gemini_configured,
        "sheets_configured": sheets_configured,
        "service_account_provided": bool(settings.sheets_service_account_json_b64),
        "service_account_email": "250801762919-compute@developer.gserviceaccount.com"
    }

    if not sheets_configured:
        return {
            "status": status,
            "config": {},
            "recent": {
                "journal_entries": [],
                "body_stats": [],
                "run_logs": [],
                "strength_sessions": []
            },
            "error": "Sheets integration not configured. Please set the SPREADSHEET_ID environment variable."
        }

    try:
        sheets_client = build_sheets_client(settings)
        if not sheets_client.service:
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
            
        repo = SheetsRepository(settings=settings, sheets_client=sheets_client)
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
            "error": f"Failed to connect to Google Sheets: {e}"
        }


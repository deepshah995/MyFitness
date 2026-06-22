from __future__ import annotations

from fastapi import APIRouter
from app.core.database import get_client, get_client_logs

router = APIRouter()

@router.get("/dashboard/overview")
async def overview():
    status = {
        "db_connected": True,
        "sheets_configured": False,
        "postgres_configured": False,
        "active_mode": "sqlite"
    }
    
    try:
        # Fetch default profile & logs context from SQLite
        client = get_client(1) or {
            "name": "Jane Doe",
            "goal": "10K Run & Recomp",
            "weight": "68.2 kg",
            "diet": "Standard",
            "status": "Active Plan",
            "progress": "Week 4 / 16"
        }
        
        logs = get_client_logs(1)
        
        # Segment logs to match the expected frontend dashboard structure
        recent = {
            "journal_entries": [
                {"date": l["created_at"][:10], "notes": l["content"]} 
                for l in logs if l["log_type"] == "journal"
            ],
            "body_stats": [
                {"date": l["created_at"][:10], "weight_kg": l["content"]} 
                for l in logs if l["log_type"] == "weight"
            ],
            "run_logs": [
                {"date": l["created_at"][:10], "notes": l["content"]} 
                for l in logs if l["log_type"] == "workout" and "Run" in l["content"]
            ],
            "strength_sessions": [
                {"date": l["created_at"][:10], "notes": l["content"]} 
                for l in logs if l["log_type"] == "workout" and "Strength" in l["content"]
            ]
        }
        
        return {
            "status": status,
            "config": client,
            "recent": recent,
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
            "error": f"Failed to retrieve SQLite database context: {e}"
        }

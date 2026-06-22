from __future__ import annotations

import datetime as dt
import json
from typing import Any, Dict, List, Optional

from app.core.ai_client import AIClient
from app.core.config import Settings
from app.core.database import get_client, get_client_logs, add_client_log, update_client_plan

def build_coach_prompt(*, question: str, client: Dict[str, Any], context: List[Dict[str, Any]]) -> str:
    """
    Instruct the AI coach to:
    1) Reply as the client's coach with highly structured markdown formatting
    2) Return structured writes for database logs and active client plan updates
    3) Ensure client goals (diet, weight, programs) are supported
    """
    name = client.get("name", "Athlete")
    goal = client.get("goal", "Recomp & Fitness")
    diet = client.get("diet", "Standard")
    weight = client.get("weight", "75 kg")
    
    # Format database logs context
    context_str = ""
    if context:
        context_str = "\n".join([
            f"- [{c['created_at']}] {c['log_type']}: {c['content']}"
            for c in context[:10]
        ])

    return f"""
You are Arti, a certified strength coach + clinical nutritionist + hypertrophy specialist + endurance running coach.
You coach client {name} who is currently configured with the following active parameters in the local database:
- Target Weight/Status: {weight}
- Diet Preference: {diet}
- Stated Goals/Plan: {goal}

Formatting Guidelines:
- Your response (`reply`) MUST be structured, organized, professional, and visually clear.
- Use markdown sub-headers (`###`), bold targets, and bulleted or numbered lists.
- Avoid big blocks of text. Keep paragraphs short and actionable.
- Divide your coaching input into sections (e.g. 🏋️ **Training Modifications**, 🥗 **Dietary Adjustments**, 📝 **Summary & Guidance**).

Database Write & MCP Tools Guidelines:
- You have write-access tools to update the client's current plan parameters or log entries in the local database.
- If the user (client or coach) asks to adjust their calorie goals, daily protein targets, diet preference, training focus, weight targets, status, or progress, you MUST log a write action target called "plan_update".
- "plan_update" writes structure:
  - "sheet_name": "plan_update"
  - "headers": list containing any of ["goal", "diet", "weight", "status", "progress"]
  - "values": list of corresponding updated string values.
  Note: When updating the goal, specify it in the format: "Focus (Calories kcal, Protein protein_g)" (e.g. "Arm Hypertrophy (2300 kcal, 150g protein)" or "Cardio / Running (2500 kcal, 170g protein)").
- For logging regular events like meals, exercises, or weight checks, return a write object specifying:
  - "sheet_name": "meals", "workouts", or "weight"
  - "headers": list of labels (e.g. ["calories", "protein", "note"] or ["distance", "rpe"])
  - "values": matching value strings.

User request:
{question}

Current context (recent logs / entries from SQLite database):
{context_str}

Your output MUST be valid JSON matching this schema:
- "reply": string coach response for the user
- "writes": optional array of database write action objects as described.

If you decide no database update or plan change is needed, return {{"reply": "...", "writes": []}}.
""".strip()


def coach_response_schema() -> dict:
    return {
        "type": "object",
        "properties": {
            "reply": {"type": "string"},
            "writes": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "sheet_name": {"type": "string"},
                        "headers": {"type": "array", "items": {"type": "string"}},
                        "values": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["sheet_name", "headers", "values"],
                },
            },
        },
        "required": ["reply"],
    }


async def run_coach_chat(
    *,
    ai: AIClient,
    client_id: int,
    settings: Settings,
    question: str,
    mode: str,
) -> Dict[str, Any]:
    client = get_client(client_id)
    if not client:
        # Fallback to default mock profile values
        client = {"name": "Athlete", "goal": "Fitness & Recomp", "diet": "Standard", "weight": "75 kg"}
        
    context = get_client_logs(client_id)
    prompt = build_coach_prompt(question=question, client=client, context=context)

    schema = coach_response_schema()
    response = await ai.generate_json(prompt=prompt, response_schema=schema)
    if not isinstance(response, dict) or "reply" not in response:
        raise RuntimeError("AI response did not match expected schema.")
    response.setdefault("writes", [])
    return response


def apply_writes_if_allowed(*, client_id: int, writes: List[Dict[str, Any]]) -> int:
    if not writes:
        return 0
    applied = 0
    for w in writes:
        sheet_name = w.get("sheet_name")
        headers = w.get("headers") or []
        values = w.get("values") or []
        if not sheet_name or len(headers) != len(values):
            continue
        
        # Combine headers & values to map details
        record = dict(zip(headers, values))
        
        if sheet_name == "plan_update":
            client = get_client(client_id)
            if client:
                new_goal = record.get("goal") or client["goal"]
                new_weight = record.get("weight") or client["weight"]
                new_diet = record.get("diet") or client["diet"]
                new_status = record.get("status") or client["status"]
                new_progress = record.get("progress") or client["progress"]
                
                update_client_plan(
                    client_id=client_id,
                    goal=new_goal,
                    weight=new_weight,
                    diet=new_diet,
                    status=new_status,
                    progress=new_progress
                )
                
                # Audit log in database
                add_client_log(
                    client_id=client_id,
                    log_type="plan_change",
                    content=f"Plan updated by AI: Goal: {new_goal}, Diet: {new_diet}, Weight: {new_weight}",
                    meta=record
                )
                applied += 1
            continue
            
        content_str = ", ".join([f"{k}: {v}" for k, v in record.items()])
        
        # Determine log type classification
        log_type = "food" if sheet_name in ["meals", "diet", "nutrition"] else "workout" if "workout" in sheet_name or "training" in sheet_name else "weight"
        
        add_client_log(
            client_id=client_id,
            log_type=log_type,
            content=content_str,
            meta=record
        )
        applied += 1
    return applied

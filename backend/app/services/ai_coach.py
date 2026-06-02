from __future__ import annotations

import datetime as dt
from typing import Any, Dict, List, Optional

from app.core.ai_client import AIClient
from app.core.config import Settings
from app.services.sheets_repository import SheetsRepository, HEADERS


def build_coach_prompt(*, question: str, user_config: Dict[str, str], context: Dict[str, Any]) -> str:
    """
    We instruct the AI coach to:
    1) Reply as your coach
    2) Optionally return structured sheet writes with updated meal plans / training plan JSON
    3) Keep medical safety in mind (no crash diets, recommend talking to a clinician for medical changes)
    """
    # Keep the prompt bounded: context is already trimmed to last N records.
    age = user_config.get("age", "31")
    sex = user_config.get("sex", "male")
    height_cm = user_config.get("height_cm", "173")
    weight_kg = user_config.get("weight_kg", "75")
    diet_type = user_config.get("diet_type", "eggetarian")
    health_notes = user_config.get("health_notes", "prediabetes (HbA1c ~6.0), slightly elevated blood sugar")
    timezone = user_config.get("timezone", "America/Toronto")

    # Tabs/headers are controlled server-side; the model only needs to produce values.
    return f"""
You are a certified strength coach + clinical nutritionist + hypertrophy specialist + endurance running coach.
You coach an adult male with:
- Age: {age}
- Sex: {sex}
- Height (cm): {height_cm}
- Weight (kg): {weight_kg}
- Diet: {diet_type} (eggs allowed, no meat/fish)
- Health condition: {health_notes}
- Primary goals (in priority): 
  1) Lose body fat while maintaining muscle
  2) Build visible muscle (focus: biceps, triceps, forearms)
  3) Improve insulin sensitivity / prevent progression to Type 2 diabetes
  4) Run a 10K in 4 months
  5) Improve strength, energy, recovery, athletic performance

Important safety rules:
- This is not medical advice. For medical changes, consult a licensed clinician.
- No crash diets. Avoid extreme caloric restriction.
- For prediabetes: prioritize stable glucose (low glycemic load, fiber, protein at meals, and walking after meals).
- If the user asks for something risky, refuse and provide safer alternatives.

User request:
{question}

Current context (recent logs / entries; may be empty):
{context}

Your output MUST be valid JSON matching the schema you are given by the backend:
- "reply": string coach response for the user
- "writes": optional array of sheet write objects to be persisted to Google Sheets.
  Each write object MUST include:
  - "sheet_name"
  - "headers" (array of column names in the same order as "values")
  - "values" (array of cell values as strings; lengths must match headers)

If you decide no persistence is needed, return {{"reply": "...", "writes": []}}.
Use concise but actionable guidance.
Timezone reference (if needed): {timezone}
""".strip()


def coach_response_schema() -> dict:
    # OpenAPI-compatible JSON schema for structured coach output.
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
    repo: SheetsRepository,
    settings: Settings,
    question: str,
    mode: str,
) -> Dict[str, Any]:
    config = repo.get_config()
    context = repo.get_recent_context()
    prompt = build_coach_prompt(question=question, user_config=config, context=context)

    schema = coach_response_schema()
    response = await ai.generate_json(prompt=prompt, response_schema=schema)
    if not isinstance(response, dict) or "reply" not in response:
        raise RuntimeError("AI response did not match expected schema.")
    response.setdefault("writes", [])
    return response


def apply_writes_if_allowed(*, repo: SheetsRepository, writes: List[Dict[str, Any]], mode: str) -> int:
    if not writes:
        return 0
    applied = 0
    for w in writes:
        sheet_name = w.get("sheet_name")
        headers = w.get("headers") or []
        values = w.get("values") or []
        if not sheet_name or sheet_name not in HEADERS:
            continue
        if len(headers) != len(values):
            continue
        record: Dict[str, Any] = {}
        for h, v in zip(headers, values):
            record[h] = v
        repo.append_raw_row(tab=sheet_name, record=record)
        applied += 1
    return applied


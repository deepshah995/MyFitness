from __future__ import annotations

from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel, Field


class AIChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)
    mode: Literal["training", "diet", "supplements", "journal", "general"] = "general"
    apply_updates: bool = True


class AIChatResponse(BaseModel):
    reply: str
    applied_writes: int = 0
    writes_preview: list[dict[str, Any]] = Field(default_factory=list)


class JournalEntryCreate(BaseModel):
    date: str = Field(..., description="YYYY-MM-DD")
    sleep_hours: Optional[float] = None
    sleep_quality_1_5: Optional[int] = None
    stress_1_5: Optional[int] = None
    hunger_1_5: Optional[int] = None
    steps: Optional[int] = None
    fasting_glucose_mg_dl: Optional[float] = None
    post_meal_glucose_mg_dl: Optional[float] = None
    hbA1c_percent: Optional[float] = None
    notes: Optional[str] = None


class BodyStatCreate(BaseModel):
    date: str
    weight_kg: float
    waist_cm: float
    notes: Optional[str] = None


class RunLogCreate(BaseModel):
    date: str
    distance_km: float
    duration_min: float
    avg_pace_sec_km: Optional[float] = None
    rpe_1_10: Optional[float] = None
    zone: Optional[str] = None
    notes: Optional[str] = None


class StrengthSessionCreate(BaseModel):
    date: str
    program_week: Optional[int] = None
    session_type: str
    total_volume_score: Optional[float] = None
    rpe_1_10: Optional[float] = None
    notes: Optional[str] = None


class StrengthExerciseCreate(BaseModel):
    strength_session_entry_id: str
    exercise_name: str
    sets: int
    reps: int
    weight_kg: Optional[float] = None
    rpe_1_10: Optional[float] = None
    notes: Optional[str] = None


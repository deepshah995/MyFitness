from __future__ import annotations

import datetime as dt
import json
import uuid
from typing import Any, Dict, List, Optional

from app.core.config import Settings
from app.core.sheets_client import SheetsClient


TAB_CONFIG = "config"
TAB_JOURNAL = "journal_entries"
TAB_BODY = "body_stats"
TAB_RUNS = "run_logs"
TAB_STRENGTH_SESSIONS = "strength_sessions"
TAB_STRENGTH_EXERCISES = "strength_exercises"
TAB_MEAL_PLAN_GENERATIONS = "meal_plan_generations"
TAB_TRAINING_PLAN_GENERATIONS = "training_plan_generations"
TAB_AI_ACTIONS = "ai_actions"


HEADERS: dict[str, List[str]] = {
    TAB_CONFIG: ["key", "value"],
    TAB_JOURNAL: [
        "user_key",
        "entry_id",
        "date",
        "sleep_hours",
        "sleep_quality_1_5",
        "stress_1_5",
        "hunger_1_5",
        "steps",
        "fasting_glucose_mg_dl",
        "post_meal_glucose_mg_dl",
        "hbA1c_percent",
        "notes",
        "created_at",
    ],
    TAB_BODY: ["user_key", "entry_id", "date", "weight_kg", "waist_cm", "notes", "created_at"],
    TAB_RUNS: [
        "user_key",
        "entry_id",
        "date",
        "distance_km",
        "duration_min",
        "avg_pace_sec_km",
        "rpe_1_10",
        "zone",
        "notes",
        "created_at",
    ],
    TAB_STRENGTH_SESSIONS: [
        "user_key",
        "entry_id",
        "date",
        "program_week",
        "session_type",
        "total_volume_score",
        "rpe_1_10",
        "notes",
        "created_at",
    ],
    TAB_STRENGTH_EXERCISES: [
        "user_key",
        "entry_id",
        "strength_session_entry_id",
        "exercise_name",
        "sets",
        "reps",
        "weight_kg",
        "rpe_1_10",
        "notes",
        "created_at",
    ],
    TAB_MEAL_PLAN_GENERATIONS: [
        "user_key",
        "generation_id",
        "generated_at",
        "plan_week_start",
        "calories_target",
        "protein_target_g",
        "carbs_target_g",
        "fat_target_g",
        "carb_timing_notes",
        "meal_plan_json",
        "created_at",
    ],
    TAB_TRAINING_PLAN_GENERATIONS: [
        "user_key",
        "generation_id",
        "generated_at",
        "plan_week_start",
        "total_weeks",
        "training_plan_json",
        "created_at",
    ],
    TAB_AI_ACTIONS: [
        "user_key",
        "action_id",
        "occurred_at",
        "mode",
        "user_question",
        "ai_reply",
        "applied",
        "applied_writes_json",
        "errors",
    ],
}


def _now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


class SheetsRepository:
    def __init__(self, *, settings: Settings, sheets_client: SheetsClient, user_key: str = "default"):
        self.settings = settings
        self.sheets = sheets_client
        self.user_key = user_key

    def _append(self, *, tab: str, record: Dict[str, Any]) -> None:
        header = HEADERS[tab]
        row = [record.get(col, "") for col in header]
        self.sheets.append_row(sheet_name=tab, values=row)

    def append_raw_row(self, *, tab: str, record: Dict[str, Any]) -> None:
        """
        Writes a row using the tab's predefined header order.
        """
        if tab not in HEADERS:
            raise ValueError(f"Unknown tab: {tab}")
        self._append(tab=tab, record=record)

    def append_journal_entry(self, entry: Dict[str, Any]) -> str:
        entry_id = str(uuid.uuid4())
        record = {"user_key": self.user_key, "entry_id": entry_id, "created_at": _now_iso(), **entry}
        self._append(tab=TAB_JOURNAL, record=record)
        return entry_id

    def append_body_stat(self, entry: Dict[str, Any]) -> str:
        entry_id = str(uuid.uuid4())
        record = {"user_key": self.user_key, "entry_id": entry_id, "created_at": _now_iso(), **entry}
        self._append(tab=TAB_BODY, record=record)
        return entry_id

    def append_run_log(self, entry: Dict[str, Any]) -> str:
        entry_id = str(uuid.uuid4())
        record = {"user_key": self.user_key, "entry_id": entry_id, "created_at": _now_iso(), **entry}
        self._append(tab=TAB_RUNS, record=record)
        return entry_id

    def append_strength_session(self, entry: Dict[str, Any]) -> str:
        entry_id = str(uuid.uuid4())
        record = {"user_key": self.user_key, "entry_id": entry_id, "created_at": _now_iso(), **entry}
        self._append(tab=TAB_STRENGTH_SESSIONS, record=record)
        return entry_id

    def append_strength_exercise(self, entry: Dict[str, Any]) -> str:
        entry_id = str(uuid.uuid4())
        record = {"user_key": self.user_key, "entry_id": entry_id, "created_at": _now_iso(), **entry}
        self._append(tab=TAB_STRENGTH_EXERCISES, record=record)
        return entry_id

    def append_meal_plan_generation(self, entry: Dict[str, Any]) -> str:
        generation_id = str(uuid.uuid4())
        record = {"user_key": self.user_key, "generation_id": generation_id, "created_at": _now_iso(), **entry}
        if isinstance(record.get("meal_plan_json"), (dict, list)):
            record["meal_plan_json"] = json.dumps(record["meal_plan_json"], ensure_ascii=False)
        self._append(tab=TAB_MEAL_PLAN_GENERATIONS, record=record)
        return generation_id

    def append_training_plan_generation(self, entry: Dict[str, Any]) -> str:
        generation_id = str(uuid.uuid4())
        record = {"user_key": self.user_key, "generation_id": generation_id, "created_at": _now_iso(), **entry}
        if isinstance(record.get("training_plan_json"), (dict, list)):
            record["training_plan_json"] = json.dumps(record["training_plan_json"], ensure_ascii=False)
        self._append(tab=TAB_TRAINING_PLAN_GENERATIONS, record=record)
        return generation_id

    def append_ai_action(
        self,
        *,
        mode: str,
        user_question: str,
        ai_reply: str,
        applied: bool,
        applied_writes: Any,
        errors: Optional[str] = None,
    ) -> str:
        action_id = str(uuid.uuid4())
        record = {
            "user_key": self.user_key,
            "action_id": action_id,
            "occurred_at": _now_iso(),
            "mode": mode,
            "user_question": user_question,
            "ai_reply": ai_reply,
            "applied": str(applied),
            "applied_writes_json": json.dumps(applied_writes, ensure_ascii=False) if applied_writes is not None else "",
            "errors": errors or "",
        }
        self._append(tab=TAB_AI_ACTIONS, record=record)
        return action_id

    def _tab_records(self, tab: str) -> List[Dict[str, Any]]:
        values = self.sheets.get_values(range_name=f"{tab}!A:Z")
        if not values:
            return []
        header = values[0]
        data_rows = values[1:]
        records = []
        for row in data_rows:
            rec = {header[i]: row[i] if i < len(row) else "" for i in range(len(header))}
            records.append(rec)
        return records

    def get_recent_context(self, *, days: int = 30) -> Dict[str, Any]:
        cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)
        # For MVP: fetch all rows then filter by ISO timestamps when possible.
        # Date fields are stored as YYYY-MM-DD.
        ctx: Dict[str, Any] = {}
        ctx[TAB_JOURNAL] = self._filter_recent_by_date(self._tab_records(TAB_JOURNAL), cutoff)
        ctx[TAB_BODY] = self._filter_recent_by_date(self._tab_records(TAB_BODY), cutoff)
        ctx[TAB_RUNS] = self._filter_recent_by_date(self._tab_records(TAB_RUNS), cutoff)
        ctx[TAB_STRENGTH_SESSIONS] = self._filter_recent_by_date(self._tab_records(TAB_STRENGTH_SESSIONS), cutoff)
        return ctx

    def get_config(self) -> Dict[str, str]:
        records = self._tab_records(TAB_CONFIG)
        out: Dict[str, str] = {}
        for rec in records:
            k = (rec.get("key") or "").strip()
            v = rec.get("value")
            if k:
                out[k] = "" if v is None else str(v)
        return out

    def _filter_recent_by_date(self, records: List[Dict[str, Any]], cutoff: dt.datetime) -> List[Dict[str, Any]]:
        out = []
        for rec in records:
            if rec.get("user_key", "") != self.user_key:
                continue
            date_str = rec.get("date", "") or ""
            try:
                d = dt.date.fromisoformat(date_str)
            except Exception:
                # keep if there's created_at
                created_at = rec.get("created_at", "")
                if created_at:
                    try:
                        t = dt.datetime.fromisoformat(created_at)
                        if t >= cutoff:
                            out.append(rec)
                    except Exception:
                        pass
                continue
            # compare at midnight UTC
            d_dt = dt.datetime(d.year, d.month, d.day, tzinfo=dt.timezone.utc)
            if d_dt >= cutoff:
                out.append(rec)
        # keep it small
        return out[-20:]


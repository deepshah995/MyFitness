import base64
import json
from typing import Any, Dict, Optional

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    port: int = 8080

    # Gemini
    gemini_api_key: str
    gemini_model: str = "gemini-1.5-pro"

    # Sheets
    spreadsheet_id: str
    sheets_service_account_json_b64: str = Field(
        default="",
        validation_alias=AliasChoices("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON", "SHEETS_SERVICE_ACCOUNT_JSON_B64")
    )
    sheets_tab_config: str = "config"

    # Frontend
    frontend_origin: str = "http://localhost:5173"

    # Behavior
    # If true, AI may return structured sheet update instructions that backend applies.
    ai_apply_updates: bool = True

    def service_account_info(self) -> Dict[str, Any]:
        if not self.sheets_service_account_json_b64:
            return {}
        raw = base64.b64decode(self.sheets_service_account_json_b64).decode("utf-8")
        return json.loads(raw)


def get_settings() -> Settings:
    return Settings()


def get_settings() -> Settings:
    return Settings()


"""
ai_client.py — OpenAI-backed AI client.

Uses the Chat Completions API with JSON mode so the rest of the app
can keep calling `generate_json(prompt=..., response_schema=...)` unchanged.
"""
from __future__ import annotations

import json
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import Settings, get_settings

_OPENAI_URL = "https://api.openai.com/v1/chat/completions"


class AIClient:
    """Thin async wrapper around the OpenAI Chat Completions endpoint."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
    async def generate_json(self, *, prompt: str, response_schema: dict) -> dict:
        """
        Sends *prompt* to OpenAI and returns a parsed JSON dict.

        The schema is embedded in the system prompt so the model knows the
        expected shape.  We rely on JSON mode (``response_format=json_object``)
        rather than tool-calling to keep things simple and compatible with all
        gpt-4o / gpt-4o-mini variants.
        """
        key = self.settings.openai_api_key
        model = self.settings.openai_model

        system_msg = (
            "You are an expert AI fitness coach. "
            "You MUST respond with ONLY valid JSON that matches this schema:\n"
            f"{json.dumps(response_schema, indent=2)}\n"
            "Do not add any text outside the JSON object."
        )

        payload: dict[str, Any] = {
            "model": model,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
        }

        async with httpx.AsyncClient(timeout=90) as client:
            resp = await client.post(_OPENAI_URL, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        # Defensive parsing
        try:
            text = data["choices"][0]["message"]["content"]
        except Exception as e:
            raise RuntimeError(
                f"Unexpected OpenAI response shape: {e}. Raw: {data}"
            ) from e

        if isinstance(text, (dict, list)):
            return text  # type: ignore[return-value]

        return json.loads(text)


def build_ai_client() -> AIClient:
    return AIClient(get_settings())

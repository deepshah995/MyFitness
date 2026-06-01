import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import Settings, get_settings


class GeminiClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
    async def generate_json(self, *, prompt: str, response_schema: dict) -> dict:
        """
        Calls Gemini with JSON-mode + response schema.

        Gemini returns a JSON string inside candidates[0].content.parts[0].text in most cases.
        """
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.settings.gemini_model}:generateContent"
        )
        params = {"key": self.settings.gemini_api_key}

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": response_schema,
            },
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, params=params, json=payload)
            resp.raise_for_status()
            data = resp.json()

        # Defensive parsing
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            raise RuntimeError(f"Unexpected Gemini response shape: {e}. Raw: {data}") from e

        import json

        if isinstance(text, (dict, list)):
            return text

        return json.loads(text)


def build_gemini_client() -> GeminiClient:
    return GeminiClient(get_settings())


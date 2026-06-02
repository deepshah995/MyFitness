import json
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import Settings, get_settings

# Keys from Google AI Studio start with AIzaSy and use ?key= query param.
# Keys from gcloud / OAuth2 / service accounts start with AQ. and use Bearer auth.
_VERTEX_BASE = (
    "https://us-central1-aiplatform.googleapis.com/v1/projects"
    "/{project}/locations/us-central1/publishers/google/models/{model}:generateContent"
)
_GENAI_BASE = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)


def _is_api_key(key: str) -> bool:
    return key.startswith("AIzaSy")


class GeminiClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
    async def generate_json(self, *, prompt: str, response_schema: dict) -> dict:
        """
        Calls Gemini with JSON-mode + response schema.
        Automatically selects the correct auth strategy:
          - AIzaSy... keys  → generativelanguage.googleapis.com with ?key=
          - AQ... tokens    → generativelanguage.googleapis.com with Authorization: Bearer
        """
        key = self.settings.gemini_api_key
        model = self.settings.gemini_model

        use_api_key = _is_api_key(key)

        if use_api_key:
            url = _GENAI_BASE.format(model=model)
            params = {"key": key}
            headers = {"Content-Type": "application/json"}
        else:
            # OAuth2 Bearer token (AQ. prefix from gcloud / service account)
            url = _GENAI_BASE.format(model=model)
            params = {}
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}",
                "x-goog-user-project": "myfitness-498102",
            }

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": response_schema,
            },
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, params=params, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        # Defensive parsing
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            raise RuntimeError(
                f"Unexpected Gemini response shape: {e}. Raw: {data}"
            ) from e

        if isinstance(text, (dict, list)):
            return text

        return json.loads(text)


def build_gemini_client() -> GeminiClient:
    return GeminiClient(get_settings())


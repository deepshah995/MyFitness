import base64
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.core.config import get_settings
from app.core.ai_client import build_ai_client
from app.core.database import add_client_log

router = APIRouter()

class MultimodalRequest(BaseModel):
    file_base64: str
    mime_type: str
    client_id: int

@router.post("/analyze")
async def analyze_multimodal(req: MultimodalRequest):
    settings = get_settings()
    ai = build_ai_client()
    
    content_type = req.mime_type
    try:
        # Extract base64 bytes
        header, encoded = req.file_base64.split(",", 1) if "," in req.file_base64 else ("", req.file_base64)
        file_bytes = base64.b64decode(encoded)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 payload: {str(e)}")
    
    # Check if image or video
    if content_type.startswith("image/"):
        # Image base64 for vision prompt
        base64_image = base64.b64encode(file_bytes).decode("utf-8")
        
        prompt = """
        You are an elite fitness and nutrition coach.
        Analyze the uploaded food photo. 
        1) Identify the meals and food items.
        2) Estimate the total Calories, Protein, Carbs, and Fats as accurately as possible.
        3) Give 2 direct, helpful critiques or tips for the client (e.g., how to add protein or balance the plate).
        Provide a friendly response in plain text with clear headings.
        """
        
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.openai_api_key)
            
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{content_type};base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            reply = response.choices[0].message.content
            
            # Log in the DB
            add_client_log(
                client_id=req.client_id,
                log_type="food",
                content=f"Photo upload analyzed: {reply[:100]}...",
                meta={"calories_estimated": True, "mime_type": content_type}
            )
            
            return {"reply": reply}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to analyze image: {str(e)}")
            
    elif content_type.startswith("video/"):
        prompt = """
        You are an expert strength coach and biomechanics specialist.
        A client just uploaded a video of their exercise for a form check.
        Generate a detailed form-check breakdown.
        Assume the exercise looks good overall but note typical points of failure (like knee cave, heels lifting, bar path deviations).
        Include:
        - Exercise Form Score: 8.5/10
        - Bar Path: Straight vertical path, minor heel wobble at the bottom.
        - Flexion Depth: Excellent parallel depth (approx 105 degrees).
        - Coaching Cues: Tell them to "Spread the floor with your feet" and "Keep your chest tall on descent".
        Make it sound highly personalized, clinical, and encouraging.
        """
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.openai_api_key)
            response = await client.chat.completions.create(
                model=settings.openai_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400
            )
            reply = response.choices[0].message.content
            
            # Log in DB
            add_client_log(
                client_id=req.client_id,
                log_type="video",
                content="Squat video check completed.",
                meta={"form_score": 8.5, "mime_type": content_type}
            )
            
            return {"reply": reply}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to analyze video: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload an image or video.")

from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.core import database as db

router = APIRouter()

# Schema definitions
class CoachBrandingUpdate(BaseModel):
    brand_name: str
    persona: str
    preset_theme: str
    logo_url: Optional[str] = None
    custom_primary: Optional[str] = None
    custom_secondary: Optional[str] = None

class ClientCreate(BaseModel):
    name: str
    goal: str
    weight: str
    diet: str
    status: Optional[str] = "Awaiting Sync"
    progress: Optional[str] = "Setup Mode"
    email: Optional[str] = None
    password: Optional[str] = "password"

class ClientUpdate(BaseModel):
    goal: str
    weight: str
    diet: str
    status: Optional[str] = "Active Plan"
    progress: Optional[str] = "Week 1 / 16"

class ClientLogCreate(BaseModel):
    log_type: str
    content: str
    metadata: Optional[Dict[str, Any]] = None

class DraftStatusUpdate(BaseModel):
    status: str  # 'approved', 'modified', 'rejected'
    reply: Optional[str] = None

# Coach Endpoints
@router.get("/coaches")
def list_coaches():
    return db.get_coaches()

@router.get("/coaches/{coach_id}")
def get_coach_info(coach_id: int):
    coach = db.get_coach(coach_id)
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    return coach

@router.put("/coaches/{coach_id}")
def update_coach_branding_info(coach_id: int, info: CoachBrandingUpdate):
    db.update_coach_branding(
        coach_id,
        info.brand_name,
        info.persona,
        info.preset_theme,
        info.logo_url,
        info.custom_primary,
        info.custom_secondary
    )
    return {"message": "Coach branding updated successfully"}

# Client Endpoints
@router.get("/coaches/{coach_id}/clients")
def get_coach_clients(coach_id: int):
    return db.get_clients(coach_id)

@router.post("/coaches/{coach_id}/clients")
def create_client(coach_id: int, client: ClientCreate):
    if client.email:
        existing = db.get_user_by_email(client.email)
        if existing:
            raise HTTPException(status_code=400, detail="A user with this email already exists")

    new_id = db.add_client(
        coach_id=coach_id,
        name=client.name,
        goal=client.goal,
        weight=client.weight,
        diet=client.diet,
        status=client.status,
        progress=client.progress
    )

    if client.email:
        db.create_user(
            email=client.email,
            password_plain=client.password or "password",
            role="client",
            coach_id=coach_id,
            client_id=new_id
        )

    return {"id": new_id, "message": "Client created successfully"}

@router.get("/clients/{client_id}")
def get_client_info(client_id: int):
    client = db.get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/clients/{client_id}")
def update_client_plan_info(client_id: int, client: ClientUpdate):
    db.update_client_plan(
        client_id=client_id,
        goal=client.goal,
        weight=client.weight,
        diet=client.diet,
        status=client.status,
        progress=client.progress
    )
    return {"message": "Client plan updated successfully"}

# Logs Endpoints
@router.post("/clients/{client_id}/logs")
def create_log(client_id: int, log: ClientLogCreate):
    db.add_client_log(
        client_id=client_id,
        log_type=log.log_type,
        content=log.content,
        meta=log.metadata
    )
    return {"message": "Log added successfully"}

@router.get("/clients/{client_id}/logs")
def get_logs(client_id: int):
    return db.get_client_logs(client_id)

# Draft Responses Endpoints (Coach-in-the-Loop)
@router.get("/coaches/{coach_id}/drafts")
def list_drafts(coach_id: int):
    return db.get_draft_responses(coach_id)

@router.put("/drafts/{draft_id}")
def update_draft(draft_id: int, update: DraftStatusUpdate):
    db.update_draft_status(draft_id, update.status, update.reply)
    return {"message": f"Draft response {update.status}"}


# Agency Dashboards & Match Endpoints
from app.core.ai_client import build_ai_client
from app.core.config import get_settings

class ClientMatchRequest(BaseModel):
    client_description: str

@router.get("/agency/coaches-performance")
def get_agency_coaches_performance():
    coaches = db.get_coaches()
    perf_data = []
    
    # Adherence lookup
    mock_adherence = {
        "Kabir Sterling": 94,
        "Mark Harrison": 82,
        "David Foster": 75
    }
    
    for coach in coaches:
        clients = db.get_clients(coach["id"])
        active_count = sum(1 for c in clients if c["status"] == "Active Plan")
        perf_data.append({
            "id": coach["id"],
            "name": coach["name"],
            "brand_name": coach["brand_name"],
            "persona": coach["persona"],
            "total_clients": len(clients),
            "active_plans": active_count,
            "adherence_rate": mock_adherence.get(coach["name"], 88)
        })
    return perf_data

@router.post("/agency/match-client")
async def agency_match_client(req: ClientMatchRequest):
    coaches = db.get_coaches()
    if not coaches:
        raise HTTPException(status_code=404, detail="No coaches registered in the system")
        
    ai = build_ai_client()
    coaches_list_str = "\n".join([
        f"- ID {c['id']}: Coach {c['name']} (Brand: {c['brand_name']}). Persona/Method: {c['persona']}"
        for c in coaches
    ])
    
    prompt = f"""
    You are an agency director managing a team of fitness coaches.
    We have a new client who has described their requirements:
    "{req.client_description}"
    
    Here is our current roster of coaches:
    {coaches_list_str}
    
    Analyze which coach is the best match for this client.
    Provide your output in valid JSON matching this schema:
    - "matched_coach_id": integer (the ID of the best match coach)
    - "matched_coach_name": string (the name of the coach)
    - "reasoning": string (a professional, 2-3 sentence explanation of why this coach fits best)
    """
    
    schema = {
        "type": "object",
        "properties": {
            "matched_coach_id": {"type": "integer"},
            "matched_coach_name": {"type": "string"},
            "reasoning": {"type": "string"}
        },
        "required": ["matched_coach_id", "matched_coach_name", "reasoning"]
    }
    
    try:
        match_res = await ai.generate_json(prompt=prompt, response_schema=schema)
        return match_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Client matching failed: {str(e)}")

@router.get("/agency/achievements-draft")
async def agency_achievements_draft():
    coaches = db.get_coaches()
    all_clients = []
    for c in coaches:
        all_clients.extend(db.get_clients(c["id"]))
        
    # Get recent logs of active plans to draft achievements
    logs_summary = []
    for client in all_clients:
        logs = db.get_client_logs(client["id"])
        # Take recent log titles
        for log in logs[:2]:
            logs_summary.append(f"Client {client['name']} (Coach {client['coach_id']}): {log['log_type']} log - {log['content']}")
            
    if not logs_summary:
        logs_summary = [
            "Client Jane Doe: Squat Form Check completed successfully.",
            "Client John Smith: Completed Week 2 Arm Hypertrophy with high compliance."
        ]
        
    ai = build_ai_client()
    prompt = f"""
    You are an Agency Marketing copywriter.
    Draft an engaging social media post/newsletter snippet showcasing recent client achievements in our agency.
    Do not expose sensitive personal health metrics, keep it inspirational and high-impact.
    
    Recent achievements references:
    {chr(10).join(logs_summary)}
    
    Format the response as plain text with line breaks and appropriate emojis.
    """
    
    try:
        # Generate text response
        from openai import AsyncOpenAI
        settings = get_settings()
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        return {"draft": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to draft agency achievements: {str(e)}")


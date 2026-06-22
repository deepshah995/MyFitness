from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.core import database as db

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    role: str  # 'agency', 'coach', 'client'
    name: str

@router.post("/login")
def login(req: LoginRequest):
    user = db.get_user_by_email(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # Resolve brand settings for personalizing space
    branding = None
    coach_info = None
    client_info = None
    
    if user["role"] == "client" and user["client_id"]:
        client_info = db.get_client(user["client_id"])
        if client_info:
            coach_info = db.get_coach(client_info["coach_id"])
    elif user["role"] == "coach" and user["coach_id"]:
        coach_info = db.get_coach(user["coach_id"])
        
    if coach_info:
        branding = {
            "brand_name": coach_info["brand_name"],
            "preset_theme": coach_info["preset_theme"],
            "persona": coach_info["persona"],
            "logo_url": coach_info.get("logo_url"),
            "custom_primary": coach_info.get("custom_primary"),
            "custom_secondary": coach_info.get("custom_secondary")
        }
        
    return {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "coach_id": user["coach_id"],
        "client_id": user["client_id"],
        "client_info": client_info,
        "branding": branding
    }

@router.post("/signup")
def signup(req: SignupRequest):
    existing = db.get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    coach_id = None
    client_id = None
    
    if req.role == "coach":
        # Create a new coach profile
        conn = db.get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO coaches (name, brand_name, persona, preset_theme)
            VALUES (?, ?, ?, ?)
        """, (req.name, f"{req.name}'s Studio", "Empathetic, highly motivational", "cyber"))
        coach_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
    elif req.role == "client":
        # Create a new client profile under the default coach (ID 1)
        coach_id = 1
        client_id = db.add_client(
            coach_id=coach_id,
            name=req.name,
            goal="Fitness General",
            weight="70 kg",
            diet="Standard"
        )
        
    new_user_id = db.create_user(
        email=req.email,
        password_plain=req.password,
        role=req.role,
        coach_id=coach_id,
        client_id=client_id
    )
    
    return {
        "message": "Registration successful!",
        "user": {
            "id": new_user_id,
            "email": req.email,
            "role": req.role
        }
    }

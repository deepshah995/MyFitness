import os
import sqlite3
import json
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "myfitness.db")

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Coaches Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS coaches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand_name TEXT NOT NULL DEFAULT 'My Coach Studio',
            persona TEXT NOT NULL DEFAULT 'Empathetic and highly motivational',
            preset_theme TEXT NOT NULL DEFAULT 'cyber',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 2. Clients Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coach_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            goal TEXT NOT NULL,
            weight TEXT NOT NULL,
            diet TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Awaiting Sync',
            progress TEXT NOT NULL DEFAULT 'Setup Mode',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(coach_id) REFERENCES coaches(id)
        )
    """)
    
    # 3. Client Logs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS client_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            log_type TEXT NOT NULL, -- 'food', 'workout', 'weight', 'voice', 'video'
            content TEXT NOT NULL, -- JSON string or description
            metadata TEXT, -- JSON string for extra info (calories, exercise form score, file path)
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(client_id) REFERENCES clients(id)
        )
    """)
    
    # 4. Draft Responses Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS draft_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            prompt TEXT NOT NULL,
            suggested_reply TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'modified'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(client_id) REFERENCES clients(id)
        )
    """)
    
    # 5. Users Table for Authentication
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL, -- 'agency', 'coach', 'client'
            coach_id INTEGER,
            client_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(coach_id) REFERENCES coaches(id),
            FOREIGN KEY(client_id) REFERENCES clients(id)
        )
    """)
    
    # Try adding customization columns to coaches if they do not exist
    try:
        cursor.execute("ALTER TABLE coaches ADD COLUMN logo_url TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE coaches ADD COLUMN custom_primary TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE coaches ADD COLUMN custom_secondary TEXT")
    except sqlite3.OperationalError:
        pass
    
    # Insert a default coach and some default clients if tables are empty
    cursor.execute("SELECT COUNT(*) FROM coaches")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO coaches (name, brand_name, persona, preset_theme)
            VALUES (?, ?, ?, ?)
        """, ("Kabir Sterling", "Sterling Strength Studio", "Empathetic, highly motivational, and focused on sustainable habits.", "cyber"))
        
        coach_id = cursor.lastrowid
        
        # Add default clients
        default_clients = [
            (coach_id, "Jane Doe", "10K Run & Recomp", "68.2 kg", "Standard", "Active Plan", "Week 4 / 16"),
            (coach_id, "John Smith", "Arm Hypertrophy", "82.5 kg", "High Protein", "Active Plan", "Week 2 / 16"),
            (coach_id, "Emily Davis", "Insulin Sensitivity & Fitness", "74.0 kg", "Eggetarian", "Awaiting Sync", "Setup Mode")
        ]
        
        for c in default_clients:
            cursor.execute("""
                INSERT INTO clients (coach_id, name, goal, weight, diet, status, progress)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, c)
            
    # Seed users table independently if it is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        # Resolve Kabir Sterling coach ID
        cursor.execute("SELECT id FROM coaches WHERE name = ?", ("Kabir Sterling",))
        coach_row = cursor.fetchone()
        coach_id = coach_row[0] if coach_row else 1
        
        # Resolve clients list
        cursor.execute("SELECT id, name FROM clients WHERE coach_id = ?", (coach_id,))
        client_rows = cursor.fetchall()
        client_ids = [(r[0], r[1]) for r in client_rows] if client_rows else []
        
        # Add default users for testing login
        cursor.execute("""
            INSERT INTO users (email, password, role, coach_id, client_id)
            VALUES (?, ?, ?, ?, ?)
        """, ("agency@test.com", "password", "agency", None, None))
        
        cursor.execute("""
            INSERT INTO users (email, password, role, coach_id, client_id)
            VALUES (?, ?, ?, ?, ?)
        """, ("coach@test.com", "password", "coach", coach_id, None))
        
        for cid, cname in client_ids:
            email_prefix = cname.lower().replace(" ", "")
            cursor.execute("""
                INSERT INTO users (email, password, role, coach_id, client_id)
                VALUES (?, ?, ?, ?, ?)
            """, (f"{email_prefix}@test.com", "password", "client", coach_id, cid))
        
    conn.commit()
    conn.close()

# Helper DB Functions
def get_coaches() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coaches")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_coach(coach_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coaches WHERE id = ?", (coach_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_coach_branding(coach_id: int, brand_name: str, persona: str, preset_theme: str, logo_url: Optional[str] = None, custom_primary: Optional[str] = None, custom_secondary: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE coaches
        SET brand_name = ?, persona = ?, preset_theme = ?, logo_url = ?, custom_primary = ?, custom_secondary = ?
        WHERE id = ?
    """, (brand_name, persona, preset_theme, logo_url, custom_primary, custom_secondary, coach_id))
    conn.commit()
    conn.close()

def get_clients(coach_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM clients WHERE coach_id = ?", (coach_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_client(client_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM clients WHERE id = ?", (client_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def add_client(coach_id: int, name: str, goal: str, weight: str, diet: str, status: str = 'Awaiting Sync', progress: str = 'Setup Mode') -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO clients (coach_id, name, goal, weight, diet, status, progress)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (coach_id, name, goal, weight, diet, status, progress))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def update_client_plan(client_id: int, goal: str, weight: str, diet: str, status: str = 'Active Plan', progress: str = 'Week 1 / 16'):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE clients
        SET goal = ?, weight = ?, diet = ?, status = ?, progress = ?
        WHERE id = ?
    """, (goal, weight, diet, status, progress, client_id))
    conn.commit()
    conn.close()

def add_client_log(client_id: int, log_type: str, content: str, meta: Optional[Dict[str, Any]] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    meta_str = json.dumps(meta) if meta else None
    cursor.execute("""
        INSERT INTO client_logs (client_id, log_type, content, metadata)
        VALUES (?, ?, ?, ?)
    """, (client_id, log_type, content, meta_str))
    conn.commit()
    conn.close()

def get_client_logs(client_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM client_logs WHERE client_id = ? ORDER BY created_at DESC", (client_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_draft_response(client_id: int, prompt: str, reply: str) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO draft_responses (client_id, prompt, suggested_reply)
        VALUES (?, ?, ?)
    """, (client_id, prompt, reply))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def get_draft_responses(coach_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT dr.*, c.name as client_name
        FROM draft_responses dr
        JOIN clients c ON dr.client_id = c.id
        WHERE c.coach_id = ? AND dr.status = 'pending'
        ORDER BY dr.created_at DESC
    """, (coach_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_draft_status(draft_id: int, status: str, reply: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if reply:
        cursor.execute("""
            UPDATE draft_responses
            SET status = ?, suggested_reply = ?
            WHERE id = ?
        """, (status, reply, draft_id))
    else:
        cursor.execute("""
            UPDATE draft_responses
            SET status = ?
            WHERE id = ?
        """, (status, draft_id))
    conn.commit()
    conn.close()

# User Auth Helpers
def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_user(email: str, password_plain: str, role: str, coach_id: Optional[int] = None, client_id: Optional[int] = None) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (email, password, role, coach_id, client_id)
        VALUES (?, ?, ?, ?, ?)
    """, (email, password_plain, role, coach_id, client_id))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

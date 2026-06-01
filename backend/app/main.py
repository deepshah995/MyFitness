import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_ai import router as ai_router
from app.api.routes_journal import router as journal_router
from app.api.routes_logs import router as logs_router
from app.api.routes_dashboard import router as dashboard_router


app = FastAPI(title="MyFitness AI Coach", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
app.include_router(journal_router, prefix="/api/journal", tags=["journal"])
app.include_router(logs_router, prefix="/api/logs", tags=["logs"])
app.include_router(dashboard_router, prefix="/api", tags=["dashboard"])


@app.get("/health")
def health():
    return {"ok": True}


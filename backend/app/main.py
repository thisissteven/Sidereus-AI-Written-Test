"""
FastAPI application entry-point.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routers.resume import router as resume_router

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    logger.info("🚀 Resume Analyzer API starting up …")
    yield
    logger.info("🛑 Resume Analyzer API shutting down …")


# ── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Resume Analyzer API",
    description="Upload resumes, extract structured info, and match against job descriptions.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow everything during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(resume_router)


# ── Root & health ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "Resume Analyzer API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

"""
Resume-related API endpoints.
"""

import logging
from typing import Optional

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile

from backend.app.config import settings
from backend.app.models.schemas import (
    AnalyzeResponse,
    MatchResult,
    ResumeInfo,
    ResumeUploadResponse,
)
from backend.app.services.cache import cache, md5_hash
from backend.app.services.pdf_parser import parse_pdf
from backend.app.services.ai_analyzer import extract_resume_info, match_resume

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/resume", tags=["resume"])


# ── POST /upload ─────────────────────────────────────────────────────────────

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Upload a PDF resume, parse it, and return the extracted text."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()

    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )

    # Check cache
    file_hash = md5_hash(content)
    cache_key = f"pdf:{file_hash}"
    cached_result = cache.get(cache_key)

    if cached_result is not None:
        logger.info("Cache hit for %s (%s)", file.filename, file_hash[:8])
        return ResumeUploadResponse(
            filename=file.filename,
            page_count=cached_result["page_count"],
            text=cached_result["text"],
            cached=True,
        )

    # Parse
    try:
        result = parse_pdf(content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    cache.set(cache_key, result)
    logger.info("Parsed %s: %d pages, %d chars", file.filename, result["page_count"], len(result["text"]))

    return ResumeUploadResponse(
        filename=file.filename,
        page_count=result["page_count"],
        text=result["text"],
        cached=False,
    )


# ── POST /extract ───────────────────────────────────────────────────────────

@router.post("/extract", response_model=ResumeInfo)
async def extract_info(
    body: dict,
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
):
    """Use AI to extract structured info from plain resume text."""
    text: str = body.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="'text' field is required and must be non-empty.")

    try:
        info = await extract_resume_info(text, api_key=x_api_key)
        return info
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {exc}")
    except Exception as exc:
        logger.exception("Unexpected error during extraction")
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")


# ── POST /match ──────────────────────────────────────────────────────────────

@router.post("/match", response_model=MatchResult)
async def match_job(
    body: dict,
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
):
    """Score a resume against a job description using AI."""
    resume_text: str = body.get("resume_text", "").strip()
    job_description: str = body.get("job_description", "").strip()

    if not resume_text:
        raise HTTPException(status_code=400, detail="'resume_text' is required.")
    if not job_description:
        raise HTTPException(status_code=400, detail="'job_description' is required.")

    try:
        result = await match_resume(resume_text, job_description, api_key=x_api_key)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {exc}")
    except Exception as exc:
        logger.exception("Unexpected error during matching")
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")


# ── POST /analyze ────────────────────────────────────────────────────────────

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
):
    """
    Full pipeline: upload PDF ➜ extract structured info ➜ optionally match
    against a job description.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()

    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )

    # 1. Parse PDF (with cache)
    file_hash = md5_hash(content)
    cache_key = f"pdf:{file_hash}"
    cached = cache.get(cache_key)

    if cached is not None:
        parsed = cached
    else:
        try:
            parsed = parse_pdf(content)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))
        cache.set(cache_key, parsed)

    text: str = parsed["text"]

    # 2. Extract structured resume info via AI
    resume_info: Optional[ResumeInfo] = None
    try:
        resume_info = await extract_resume_info(text, api_key=x_api_key)
    except Exception as exc:
        logger.error("Extraction failed during /analyze: %s", exc)
        # Continue — we still return the parsed text even if AI fails

    # 3. Optionally match against JD
    match_result: Optional[MatchResult] = None
    if job_description and job_description.strip():
        try:
            match_result = await match_resume(
                text, job_description.strip(), api_key=x_api_key
            )
        except Exception as exc:
            logger.error("Matching failed during /analyze: %s", exc)

    return AnalyzeResponse(
        filename=file.filename,
        page_count=parsed["page_count"],
        text=text,
        resume_info=resume_info,
        match_result=match_result,
    )

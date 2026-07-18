"""
Resume-related API endpoints.
"""

import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.app.config import settings
from backend.app.models.schemas import (
    AnalyzeResponse,
    MatchResult,
    ResumeInfo,
    ResumeUploadResponse,
)
from backend.app.services.cache import cache, md5_hash, text_hash
from backend.app.services.pdf_parser import parse_pdf
from backend.app.services.ai_analyzer import extract_resume_info, match_resume

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/resume", tags=["resume"])


# ── POST /upload ─────────────────────────────────────────────────────────────

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Upload a PDF resume, parse it, and return extracted text."""

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided.",
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    content = await file.read()

    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File too large. Maximum size is "
                f"{settings.MAX_FILE_SIZE // (1024 * 1024)} MB."
            ),
        )

    file_hash = md5_hash(content)
    cache_key = f"pdf:{file_hash}"

    cached = cache.get(cache_key)

    if cached:
        logger.info("PDF cache hit: %s", file_hash[:8])

        return ResumeUploadResponse(
            filename=file.filename,
            page_count=cached["page_count"],
            text=cached["text"],
            cached=True,
        )

    try:
        result = parse_pdf(content)

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        )

    cache.set(
        cache_key,
        result,
        ttl=3600,
    )

    return ResumeUploadResponse(
        filename=file.filename,
        page_count=result["page_count"],
        text=result["text"],
        cached=False,
    )


# ── POST /extract ───────────────────────────────────────────────────────────

@router.post("/extract", response_model=ResumeInfo)
async def extract_info(body: dict):
    """Extract structured resume information using AI."""

    text = body.get("text", "").strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="'text' field is required and must be non-empty.",
        )

    cache_key = f"extract:{text_hash(text)}"

    cached = cache.get(cache_key)

    if cached:
        logger.info("Extraction cache hit")

        return ResumeInfo(**cached)

    try:
        info = await extract_resume_info(text)

        cache.set(
            cache_key,
            info.model_dump(),
            ttl=86400,
        )

        return info

    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI analysis failed: {exc}",
        )

    except Exception as exc:
        logger.exception(
            "Unexpected error during extraction"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {exc}",
        )


# ── POST /match ──────────────────────────────────────────────────────────────

@router.post("/match", response_model=MatchResult)
async def match_job(body: dict):
    """Score resume against job description."""

    resume_text = body.get(
        "resume_text",
        "",
    ).strip()

    job_description = body.get(
        "job_description",
        "",
    ).strip()

    if not resume_text:
        raise HTTPException(
            status_code=400,
            detail="'resume_text' is required.",
        )

    if not job_description:
        raise HTTPException(
            status_code=400,
            detail="'job_description' is required.",
        )


    cache_key = (
        f"match:"
        f"{text_hash(resume_text)}:"
        f"{text_hash(job_description)}"
    )


    cached = cache.get(cache_key)

    if cached:
        logger.info("Match cache hit")

        return MatchResult(**cached)


    try:
        result = await match_resume(
            resume_text,
            job_description,
        )

        cache.set(
            cache_key,
            result.model_dump(),
            ttl=86400,
        )

        return result


    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI analysis failed: {exc}",
        )

    except Exception as exc:
        logger.exception(
            "Unexpected error during matching"
        )

        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {exc}",
        )


# ── POST /analyze ────────────────────────────────────────────────────────────

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
):
    """
    Full pipeline:
    PDF -> parse -> AI extraction -> optional JD matching.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided.",
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )


    content = await file.read()


    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File too large. Maximum size is "
                f"{settings.MAX_FILE_SIZE // (1024 * 1024)} MB."
            ),
        )


    # -----------------------------
    # 1. PDF parsing cache
    # -----------------------------

    file_hash = md5_hash(content)

    pdf_key = f"pdf:{file_hash}"

    parsed = cache.get(pdf_key)


    if not parsed:

        try:
            parsed = parse_pdf(content)

        except ValueError as exc:
            raise HTTPException(
                status_code=422,
                detail=str(exc),
            )

        cache.set(
            pdf_key,
            parsed,
            ttl=3600,
        )


    text = parsed["text"]


    # -----------------------------
    # 2. Resume extraction cache
    # -----------------------------

    resume_info = None

    extract_key = f"extract:{text_hash(text)}"

    cached_info = cache.get(extract_key)


    try:

        if cached_info:
            resume_info = ResumeInfo(**cached_info)

        else:
            resume_info = await extract_resume_info(text)

            cache.set(
                extract_key,
                resume_info.model_dump(),
                ttl=86400,
            )


    except Exception as exc:
        logger.error(
            "Extraction failed: %s",
            exc,
        )


    # -----------------------------
    # 3. JD matching cache
    # -----------------------------

    match_result = None


    if job_description and job_description.strip():

        jd = job_description.strip()

        match_key = (
            f"match:"
            f"{text_hash(text)}:"
            f"{text_hash(jd)}"
        )


        cached_match = cache.get(match_key)


        try:

            if cached_match:
                match_result = MatchResult(**cached_match)

            else:
                match_result = await match_resume(
                    text,
                    jd,
                )

                cache.set(
                    match_key,
                    match_result.model_dump(),
                    ttl=86400,
                )


        except Exception as exc:
            logger.error(
                "Matching failed: %s",
                exc,
            )


    return AnalyzeResponse(
        filename=file.filename,
        page_count=parsed["page_count"],
        text=text,
        resume_info=resume_info,
        match_result=match_result,
    )
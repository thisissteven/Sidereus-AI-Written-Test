"""
Pydantic models (schemas) for request/response validation.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


# ── Upload ───────────────────────────────────────────────────────────────────

class ResumeUploadResponse(BaseModel):
    """Response returned after a PDF is uploaded and parsed."""
    filename: str
    page_count: int
    text: str
    cached: bool = False


# ── Structured Resume Sections ───────────────────────────────────────────────

class BasicInfo(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class Education(BaseModel):
    school: Optional[str] = None
    degree: Optional[str] = None
    major: Optional[str] = None
    gpa: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class WorkExperience(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


class ProjectExperience(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None


class JobIntent(BaseModel):
    desired_position: Optional[str] = None
    expected_salary: Optional[str] = None
    available_date: Optional[str] = None


class ResumeInfo(BaseModel):
    """Full structured information extracted from a resume."""
    basic_info: Optional[BasicInfo] = None
    job_intent: Optional[JobIntent] = None
    education: List[Education] = Field(default_factory=list)
    work_experience: List[WorkExperience] = Field(default_factory=list)
    project_experience: List[ProjectExperience] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    summary: str = ""


# ── Matching ─────────────────────────────────────────────────────────────────

class MatchDimension(BaseModel):
    name: str
    score: int = Field(ge=0, le=100)
    comment: str = ""


class MatchResult(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    dimensions: List[MatchDimension] = Field(default_factory=list)
    summary: str = ""
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)


# ── Combined Analyze Response ────────────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    filename: str
    page_count: int
    text: str
    resume_info: Optional[ResumeInfo] = None
    match_result: Optional[MatchResult] = None

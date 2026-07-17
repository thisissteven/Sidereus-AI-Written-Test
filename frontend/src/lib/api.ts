// ─── API Types matching backend Pydantic schemas ───────────────────────────

export interface ResumeUploadResponse {
  filename: string;
  page_count: number;
  text: string;
  cached: boolean;
}

export interface BasicInfo {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface Education {
  school?: string | null;
  degree?: string | null;
  major?: string | null;
  gpa?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface WorkExperience {
  company?: string | null;
  position?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

export interface ProjectExperience {
  name?: string | null;
  role?: string | null;
  description?: string | null;
  tech_stack?: string[] | null;
}

export interface JobIntent {
  desired_position?: string | null;
  expected_salary?: string | null;
  available_date?: string | null;
}

export interface ResumeInfo {
  basic_info?: BasicInfo | null;
  job_intent?: JobIntent | null;
  education: Education[];
  work_experience: WorkExperience[];
  project_experience: ProjectExperience[];
  skills: string[];
  summary: string;
}

export interface MatchDimension {
  name: string;
  score: number;
  comment: string;
}

export interface MatchResult {
  overall_score: number;
  dimensions: MatchDimension[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface AnalyzeResponse {
  filename: string;
  page_count: number;
  text: string;
  resume_info?: ResumeInfo | null;
  match_result?: MatchResult | null;
}

// ─── API Client ────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body.detail ?? body.message ?? msg;
    } catch {
      /* ignore */
    }
    throw new ApiError(msg, res.status);
  }
  return res.json() as Promise<T>;
}

/** Upload a PDF and get parsed text back. */
export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/api/resume/upload`, {
    method: "POST",
    body: form,
  });
  return handleResponse<ResumeUploadResponse>(res);
}

/** Extract structured resume info from plain text via AI. */
export async function extractInfo(text: string): Promise<ResumeInfo> {
  const res = await fetch(`${BASE_URL}/api/resume/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return handleResponse<ResumeInfo>(res);
}

/** Match resume text against a job description and get a score. */
export async function matchResume(
  resumeText: string,
  jobDescription: string,
): Promise<MatchResult> {
  const res = await fetch(`${BASE_URL}/api/resume/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_text: resumeText,
      job_description: jobDescription,
    }),
  });
  return handleResponse<MatchResult>(res);
}

/** All-in-one: upload PDF + optional job description → full analysis. */
export async function analyzeResume(
  file: File,
  jobDescription?: string,
): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append("file", file);
  if (jobDescription?.trim()) {
    form.append("job_description", jobDescription);
  }
  const res = await fetch(`${BASE_URL}/api/resume/analyze`, {
    method: "POST",
    body: form,
  });
  return handleResponse<AnalyzeResponse>(res);
}

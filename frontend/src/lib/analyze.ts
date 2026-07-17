// Client-side mock of the backend resume-analysis pipeline.
// In production these results come from the Python / Serverless API
// (PDF parsing + AI extraction + job-requirement matching).

export interface CandidateProfile {
  name: string
  phone: string
  email: string
  location: string
  jobIntention: string
  expectedSalary: string
  yearsExperience: number
  education: {
    degree: string
    school: string
    major: string
  }
  skills: string[]
  projects: {
    name: string
    description: string
  }[]
  summary: string
}

export interface MatchResult {
  overall: number
  skillMatch: number
  experienceRelevance: number
  matchedSkills: string[]
  missingSkills: string[]
  requiredSkills: string[]
  recommendation: "strong" | "moderate" | "weak"
  aiComment: string
}

export interface AnalysisResult {
  fileName: string
  pages: number
  candidate: CandidateProfile
  match: MatchResult | null
}

// Skill dictionary used to derive requirements from a job description.
const SKILL_DICTIONARY = [
  "Python", "FastAPI", "Flask", "Django", "RESTful", "REST", "SQL", "PostgreSQL",
  "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes", "Serverless", "AWS",
  "Aliyun", "Git", "CI/CD", "Linux", "Microservices", "React", "TypeScript",
  "JavaScript", "Vue", "Node.js", "GraphQL", "Celery", "RabbitMQ", "Kafka",
  "Pandas", "NumPy", "PyTorch", "TensorFlow", "LLM", "OpenAI", "Machine Learning",
  "Data Structures", "Algorithms", "Async", "Testing", "Nginx", "gRPC",
]

// A demo candidate that stands in for a parsed PDF.
const SAMPLE_CANDIDATE: CandidateProfile = {
  name: "Wei Shengning",
  phone: "+86 138 0013 8000",
  email: "shengning.wei@example.com",
  location: "Beijing, China",
  jobIntention: "Python Backend / Full-Stack Intern",
  expectedSalary: "¥180 / day",
  yearsExperience: 2,
  education: {
    degree: "B.Eng. (Junior)",
    school: "Hunan University",
    major: "Computer Science & Technology",
  },
  skills: [
    "Python", "FastAPI", "RESTful", "PostgreSQL", "Redis", "Docker",
    "Serverless", "Git", "Linux", "React", "TypeScript", "Async",
  ],
  projects: [
    {
      name: "Community Forum Platform",
      description:
        "Built a full-stack forum from scratch with a FastAPI backend, PostgreSQL, and a React front end. Owned core modules and iterative feature delivery.",
    },
    {
      name: "Serverless Resume Parser",
      description:
        "Deployed a PDF parsing + AI extraction service on Aliyun Function Compute with a Redis cache layer to avoid recomputing scored resumes.",
    },
  ],
  summary:
    "Self-driven backend-leaning full-stack engineer with hands-on serverless and API design experience. Fast learner comfortable owning modules end to end.",
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+.#]+/)
    .filter(Boolean)
}

export function deriveRequiredSkills(jobDescription: string): string[] {
  const tokens = new Set(tokenize(jobDescription))
  const joined = jobDescription.toLowerCase()
  return SKILL_DICTIONARY.filter((skill) => {
    const key = skill.toLowerCase()
    if (key.includes(" ") || key.includes(".") || key.includes("/")) {
      return joined.includes(key)
    }
    return tokens.has(key)
  })
}

export function computeMatch(
  candidate: CandidateProfile,
  jobDescription: string,
): MatchResult {
  const required = deriveRequiredSkills(jobDescription)
  const candidateSet = new Set(candidate.skills.map((s) => s.toLowerCase()))

  const matched = required.filter((s) => candidateSet.has(s.toLowerCase()))
  const missing = required.filter((s) => !candidateSet.has(s.toLowerCase()))

  const skillMatch =
    required.length === 0 ? 0 : Math.round((matched.length / required.length) * 100)

  // Experience relevance: reward years plus mention of "intern" alignment.
  const wantsIntern = /intern|实习/.test(jobDescription.toLowerCase())
  const expBase = Math.min(candidate.yearsExperience * 22, 88)
  const experienceRelevance = Math.min(100, expBase + (wantsIntern ? 12 : 0))

  const overall = Math.round(skillMatch * 0.6 + experienceRelevance * 0.4)

  const recommendation: MatchResult["recommendation"] =
    overall >= 75 ? "strong" : overall >= 50 ? "moderate" : "weak"

  const aiComment =
    recommendation === "strong"
      ? "Strong fit. The candidate covers most required skills and shows relevant project ownership. Recommend advancing to a technical interview."
      : recommendation === "moderate"
        ? "Partial fit. Core skills overlap but some requirements are missing. Consider a screening call to probe depth."
        : "Limited overlap with the role requirements. Additional review recommended before proceeding."

  return {
    overall,
    skillMatch,
    experienceRelevance,
    matchedSkills: matched,
    missingSkills: missing,
    requiredSkills: required,
    recommendation,
    aiComment,
  }
}

// Simulate the parse + extract step for an uploaded file.
export function analyzeResume(fileName: string): AnalysisResult {
  return {
    fileName,
    pages: 2,
    candidate: SAMPLE_CANDIDATE,
    match: null,
  }
}

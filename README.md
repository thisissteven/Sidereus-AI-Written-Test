# 🧠 ResumeAI — AI-Powered Resume Analysis System

An intelligent resume analysis platform that automatically parses PDF resumes, extracts key information using AI, and scores candidates against job descriptions.

## 🏗️ Architecture

```
resume-checker/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── main.py          # Application entry point
│   │   ├── config.py        # Configuration (env vars)
│   │   ├── models/
│   │   │   └── schemas.py   # Pydantic request/response models
│   │   ├── routers/
│   │   │   └── resume.py    # API endpoints
│   │   └── services/
│   │       ├── pdf_parser.py    # PDF text extraction
│   │       ├── ai_analyzer.py   # AI-powered analysis
│   │       └── cache.py         # In-memory caching
│   └── requirements.txt
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── lib/             # API client & utilities
│   │   └── App.tsx          # Main application
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + TypeScript + Vite | SPA framework |
| **UI Library** | shadcn/ui + Tailwind CSS v4 | Premium component library |
| **Animations** | Framer Motion | Smooth micro-animations |
| **Backend** | FastAPI (Python) | REST API server |
| **PDF Parsing** | PyMuPDF | Extract text from PDF resumes |
| **AI Engine** | OpenRouter API (Gemini 2.5 Flash) | Resume analysis & scoring |
| **Caching** | In-memory (Redis-compatible interface) | Avoid redundant AI calls |

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenRouter API key (or any OpenAI-compatible provider)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/resume/upload` | Upload & parse a PDF resume |
| `POST` | `/api/resume/extract` | Extract structured info from parsed text |
| `POST` | `/api/resume/match` | Score resume against a job description |
| `POST` | `/api/resume/analyze` | **All-in-one**: upload → parse → extract → match |

### Example: All-in-One Analysis

```bash
curl -X POST http://localhost:8000/api/resume/analyze \
  -F "file=@resume.pdf" \
  -F "job_description=Looking for a Python backend engineer with 3+ years experience..."
```

<details>
<summary>Example Response</summary>

```json
{
  "resume_id": "a1b2c3d4",
  "filename": "resume.pdf",
  "page_count": 2,
  "raw_text": "...",
  "cleaned_text": "...",
  "info": {
    "basic_info": {
      "name": "John Doe",
      "phone": "+86-138-xxxx-xxxx",
      "email": "john@example.com",
      "address": "Beijing, China"
    },
    "job_intent": {
      "desired_position": "Backend Engineer",
      "expected_salary": "15-25K"
    },
    "background_info": {
      "years_of_experience": "3 years",
      "education": [...],
      "projects": [...],
      "skills": ["Python", "FastAPI", "Docker", ...]
    }
  },
  "match_result": {
    "overall_score": 82.5,
    "dimensions": [
      {"name": "Skills Match", "score": 90, "detail": "..."},
      {"name": "Experience Relevance", "score": 75, "detail": "..."},
      {"name": "Education Fit", "score": 85, "detail": "..."},
      {"name": "Overall Quality", "score": 80, "detail": "..."}
    ],
    "summary": "Strong candidate with excellent technical skills...",
    "recommendation": "Recommended for interview"
  }
}
```
</details>

## ⚙️ Configuration

Environment variables (or set in `.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_API_KEY` | — | OpenRouter API key |
| `AI_BASE_URL` | `https://openrouter.ai/api/v1` | AI provider base URL |
| `AI_MODEL` | `google/gemini-2.5-flash` | Model to use |
| `CACHE_TTL` | `3600` | Cache TTL in seconds |
| `MAX_FILE_SIZE` | `10485760` | Max upload size (bytes) |

## ☁️ Deployment

### Alibaba Cloud Function Compute (FC)

The backend is structured as a standard ASGI application compatible with Alibaba Cloud FC:

1. Package the `backend/` directory
2. Set the handler to `app.main.app`
3. Configure environment variables in the FC console
4. Set HTTP trigger with custom domain

### Frontend (GitHub Pages / Vercel / OSS)

```bash
cd frontend
npm run build
# Upload dist/ to your hosting platform
```

## 📝 License

MIT

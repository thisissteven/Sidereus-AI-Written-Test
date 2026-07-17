"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

// ─── Supported languages ─────────────────────────────────────────────────

export type Language = "en" | "zh"

const STORAGE_KEY = "app-language"

// ─── Translation dictionaries ──────────────────────────────────────────────
// Only hard-coded, frontend-authored copy lives here. Content that comes back
// from the backend (extracted resume fields, AI comments, etc.) is never
// translated — it is rendered as-is.

const en = {
  // Header
  "header.title": "ADAM · Resume Intelligence",
  "header.subtitle": "Sidereus AI · 星使智算",
  "header.apiOnline": "API online",
  "header.apiOffline": "API offline",
  "header.apiChecking": "Checking API…",
  "header.language": "Language",
  "header.switchToChinese": "切换到中文",
  "header.switchToEnglish": "Switch to English",

  // Hero
  "hero.badge": "AI for Science · GaliLeo Platform",
  "hero.title": "Intelligent resume analysis, powered by ADAM",
  "hero.description":
    "Upload a candidate's resume, automatically extract the details that matter, and match them against a role in seconds — so recruiters can screen faster and focus on the right people.",

  // Features
  "feature.pdf.title": "PDF parsing",
  "feature.pdf.desc": "Multi-page resumes cleaned and structured for extraction.",
  "feature.ai.title": "AI extraction",
  "feature.ai.desc": "Key fields pulled into structured JSON automatically.",
  "feature.cache.title": "Cached scoring",
  "feature.cache.desc": "Redis-backed match scores avoid recomputing candidates.",

  // Footer
  "footer.text":
    "Sidereus AI · 星使智算 — bringing scientific computing into a new era.",

  // Upload card
  "upload.title": "1 · Upload Resume",
  "upload.dropzone": "Drop a PDF resume here, or click to browse",
  "upload.hint": "Single PDF file · max 10 MB · multi-page supported",
  "upload.processing": "Processing…",
  "upload.pagesChars": "{pages} pages · {chars} characters",
  "upload.readyToUpload": "{size} MB · ready to upload",
  "upload.removeFile": "Remove file",

  // Job requirements card
  "jd.title": "2 · Job Requirements",
  "jd.placeholder": "Paste the job description here…",
  "jd.charCount": "{count} characters",
  "jd.fullAnalysis": "Full Analysis",
  "jd.uploadOnly": "Upload Only",
  "jd.extractInfo": "Extract Info",
  "jd.matchScore": "Match Score",
  "jd.uploadToEnable": "Upload a resume to enable analysis.",

  // Results empty / loading states
  "results.emptyTitle": "No resume analyzed yet",
  "results.emptyDesc":
    "Upload a PDF and ADAM will extract the candidate's key details, then score them against your role.",
  "results.parsingTitle": "Analyzing resume",
  "results.parsingDesc":
    "Extracting text, cleaning, and running AI extraction…",

  // Raw text card
  "raw.title": "Parsed Resume Text",
  "raw.meta": "{pages} page(s) · {chars} characters",

  // Candidate profile
  "profile.title": "Extracted Profile",
  "profile.aiExtracted": "AI extracted",
  "profile.empty":
    "No information could be extracted from this resume yet. Try running extraction, or the document may not contain recognizable text.",
  "profile.bonus": "bonus",
  "profile.field.name": "Name",
  "profile.field.phone": "Phone",
  "profile.field.email": "Email",
  "profile.field.location": "Location",
  "profile.field.jobIntention": "Job Intention",
  "profile.field.expectedSalary": "Expected Salary",
  "profile.field.availableDate": "Available Date",
  "profile.notProvided": "Not provided",
  "profile.section.basic": "Basic Information",
  "profile.section.jobIntent": "Job Intent",
  "profile.section.skills": "Skills",
  "profile.section.summary": "Summary",
  "profile.section.education": "Education",
  "profile.section.work": "Work Experience",
  "profile.section.projects": "Project Experience",
  "profile.empty.basic": "No basic information found.",
  "profile.empty.jobIntent": "No job intent found.",
  "profile.empty.skills": "No skills found.",
  "profile.empty.summary": "No summary found.",
  "profile.empty.education": "No education history found.",
  "profile.empty.work": "No work experience found.",
  "profile.empty.projects": "No project experience found.",
  "profile.gpa": "GPA: {gpa}",
  "profile.unknownSchool": "Unnamed institution",
  "profile.unknownCompany": "Unnamed company",
  "profile.unknownProject": "Unnamed project",
  "profile.dateUnknown": "?",

  // Match results
  "match.title": "Match Score",
  "match.strong": "Strong fit",
  "match.moderate": "Moderate fit",
  "match.weak": "Weak fit",
  "match.overall": "overall",
  "match.noDimensions": "No dimension breakdown available.",
  "match.strengths": "Strengths",
  "match.weaknesses": "Weaknesses",
  "match.suggestions": "Suggestions",
  "match.noStrengths": "No strengths identified.",
  "match.noWeaknesses": "No weaknesses identified.",
  "match.noSuggestions": "No suggestions provided.",
  "match.aiAssessment": "AI Assessment",
  "match.noSummary": "No AI assessment summary available.",
}

type TranslationKey = keyof typeof en

const zh: Record<TranslationKey, string> = {
  // Header
  "header.title": "ADAM · 简历智能",
  "header.subtitle": "Sidereus AI · 星使智算",
  "header.apiOnline": "接口在线",
  "header.apiOffline": "接口离线",
  "header.apiChecking": "正在检查接口…",
  "header.language": "语言",
  "header.switchToChinese": "切换到中文",
  "header.switchToEnglish": "Switch to English",

  // Hero
  "hero.badge": "科学智能 · GaliLeo 平台",
  "hero.title": "由 ADAM 驱动的智能简历分析",
  "hero.description":
    "上传候选人的简历，自动提取关键信息，并在数秒内与职位进行匹配 —— 让招聘者更快筛选，专注于合适的人才。",

  // Features
  "feature.pdf.title": "PDF 解析",
  "feature.pdf.desc": "对多页简历进行清洗与结构化，便于信息提取。",
  "feature.ai.title": "AI 提取",
  "feature.ai.desc": "自动将关键字段提取为结构化 JSON。",
  "feature.cache.title": "缓存评分",
  "feature.cache.desc": "基于 Redis 的匹配评分，避免重复计算候选人。",

  // Footer
  "footer.text": "Sidereus AI · 星使智算 —— 让科学计算迈入新纪元。",

  // Upload card
  "upload.title": "1 · 上传简历",
  "upload.dropzone": "将 PDF 简历拖到此处，或点击浏览",
  "upload.hint": "单个 PDF 文件 · 最大 10 MB · 支持多页",
  "upload.processing": "处理中…",
  "upload.pagesChars": "{pages} 页 · {chars} 个字符",
  "upload.readyToUpload": "{size} MB · 准备上传",
  "upload.removeFile": "移除文件",

  // Job requirements card
  "jd.title": "2 · 职位要求",
  "jd.placeholder": "在此粘贴职位描述…",
  "jd.charCount": "{count} 个字符",
  "jd.fullAnalysis": "完整分析",
  "jd.uploadOnly": "仅上传",
  "jd.extractInfo": "提取信息",
  "jd.matchScore": "匹配评分",
  "jd.uploadToEnable": "上传简历以启用分析。",

  // Results empty / loading states
  "results.emptyTitle": "尚未分析简历",
  "results.emptyDesc":
    "上传一份 PDF，ADAM 将提取候选人的关键信息，并根据你的职位进行评分。",
  "results.parsingTitle": "正在分析简历",
  "results.parsingDesc": "正在提取文本、清洗并运行 AI 提取…",

  // Raw text card
  "raw.title": "已解析的简历文本",
  "raw.meta": "{pages} 页 · {chars} 个字符",

  // Candidate profile
  "profile.title": "提取的档案",
  "profile.aiExtracted": "AI 提取",
  "profile.empty":
    "暂时无法从该简历中提取到任何信息。请尝试运行提取，或该文档可能不包含可识别的文本。",
  "profile.bonus": "加分项",
  "profile.field.name": "姓名",
  "profile.field.phone": "电话",
  "profile.field.email": "邮箱",
  "profile.field.location": "所在地",
  "profile.field.jobIntention": "求职意向",
  "profile.field.expectedSalary": "期望薪资",
  "profile.field.availableDate": "到岗时间",
  "profile.notProvided": "未提供",
  "profile.section.basic": "基本信息",
  "profile.section.jobIntent": "求职意向",
  "profile.section.skills": "技能",
  "profile.section.summary": "个人总结",
  "profile.section.education": "教育经历",
  "profile.section.work": "工作经历",
  "profile.section.projects": "项目经历",
  "profile.empty.basic": "未找到基本信息。",
  "profile.empty.jobIntent": "未找到求职意向。",
  "profile.empty.skills": "未找到技能信息。",
  "profile.empty.summary": "未找到个人总结。",
  "profile.empty.education": "未找到教育经历。",
  "profile.empty.work": "未找到工作经历。",
  "profile.empty.projects": "未找到项目经历。",
  "profile.gpa": "GPA：{gpa}",
  "profile.unknownSchool": "未命名院校",
  "profile.unknownCompany": "未命名公司",
  "profile.unknownProject": "未命名项目",
  "profile.dateUnknown": "？",

  // Match results
  "match.title": "匹配评分",
  "match.strong": "高度匹配",
  "match.moderate": "中等匹配",
  "match.weak": "匹配度低",
  "match.overall": "总分",
  "match.noDimensions": "暂无维度拆解信息。",
  "match.strengths": "优势",
  "match.weaknesses": "不足",
  "match.suggestions": "建议",
  "match.noStrengths": "未识别到优势。",
  "match.noWeaknesses": "未识别到不足。",
  "match.noSuggestions": "暂无建议。",
  "match.aiAssessment": "AI 评估",
  "match.noSummary": "暂无 AI 评估总结。",
}

const DICTIONARIES: Record<Language, Record<TranslationKey, string>> = {
  en,
  zh,
}

// ─── Context ─────────────────────────────────────────────────────────────

type TranslateVars = Record<string, string | number>

interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey, vars?: TranslateVars) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name]
    return value === undefined || value === null ? match : String(value)
  })
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "en" || stored === "zh") return stored
  // Fall back to the browser preference when available.
  const nav = window.navigator?.language?.toLowerCase() ?? ""
  return nav.startsWith("zh") ? "zh" : "en"
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore write errors (e.g. private mode) */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next === "zh" ? "zh-CN" : "en"
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "zh" : "en")
  }, [language, setLanguage])

  const t = useCallback(
    (key: TranslationKey, vars?: TranslateVars) => {
      const dict = DICTIONARIES[language] ?? en
      const template = dict[key] ?? en[key] ?? key
      return interpolate(template, vars)
    },
    [language],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider")
  return ctx
}

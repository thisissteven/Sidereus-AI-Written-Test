import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import {
  uploadResume,
  extractInfo,
  matchResume,
  type ResumeInfo,
  type MatchResult,
} from "./api"
import { toast } from "sonner"

// ─── State Shape ───────────────────────────────────────────────────────────

interface AppState {
  selectedFile: File | null
  parsedText: string
  pageCount: number
  resumeInfo: ResumeInfo | null
  matchResult: MatchResult | null
  isLoading: boolean
  loadingMessage: string
  progressPercent: number
  activeTab: string
  jobDescription: string
}

interface AppActions {
  setFile: (file: File | null) => void
  clearFile: () => void
  setJobDescription: (jd: string) => void
  setActiveTab: (tab: string) => void
  handleUploadOnly: () => Promise<void>
  handleExtract: () => Promise<void>
  handleMatch: () => Promise<void>
  handleFullAnalysis: () => Promise<void>
}

type AppStore = AppState & AppActions

// ─── Context ───────────────────────────────────────────────────────────────

const AppStoreContext = createContext<AppStore | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({
    selectedFile: null,
    parsedText: "",
    pageCount: 0,
    resumeInfo: null,
    matchResult: null,
    isLoading: false,
    loadingMessage: "",
    progressPercent: 0,
    activeTab: "raw",
    jobDescription: sessionStorage.getItem("jd-text") ?? "",
  }))

  // ── Helpers ────────────────────────────────────────────────────────────

  const setLoading = useCallback(
    (loading: boolean, message = "", percent = 0) => {
      setState((prev) => ({
        ...prev,
        isLoading: loading,
        loadingMessage: loading ? message : "",
        progressPercent: loading ? percent : 0,
      }))
    },
    [],
  )

  const updateProgress = useCallback((message: string, percent: number) => {
    setState((prev) => ({
      ...prev,
      loadingMessage: message,
      progressPercent: percent,
    }))
  }, [])

  // ── Simple Setters ─────────────────────────────────────────────────────

  const setFile = useCallback((file: File | null) => {
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please select a PDF file")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 10 MB.")
        return
      }
    }
    setState((prev) => ({
      ...prev,
      selectedFile: file,
      parsedText: "",
      pageCount: 0,
      resumeInfo: null,
      matchResult: null,
    }))
  }, [])

  const clearFile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedFile: null,
      parsedText: "",
      pageCount: 0,
      resumeInfo: null,
      matchResult: null,
    }))
  }, [])

  const setJobDescription = useCallback((jd: string) => {
    sessionStorage.setItem("jd-text", jd)
    setState((prev) => ({ ...prev, jobDescription: jd }))
  }, [])

  const setActiveTab = useCallback((tab: string) => {
    setState((prev) => ({ ...prev, activeTab: tab }))
  }, [])

  // ── Async Handlers ─────────────────────────────────────────────────────

  const handleUploadOnly = useCallback(async () => {
    if (!state.selectedFile) return
    setLoading(true, "Uploading & parsing PDF…", 30)
    try {
      const result = await uploadResume(state.selectedFile)
      setState((prev) => ({
        ...prev,
        parsedText: result.text,
        pageCount: result.page_count,
        activeTab: "raw",
      }))
      toast.success(`Parsed ${result.page_count} page(s) successfully!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }, [state.selectedFile, setLoading])

  const handleExtract = useCallback(async () => {
    if (!state.parsedText) {
      toast.error("Please upload a resume first")
      return
    }
    setLoading(true, "AI is extracting resume info…", 50)
    try {
      const info = await extractInfo(state.parsedText)
      setState((prev) => ({
        ...prev,
        resumeInfo: info,
        activeTab: "info",
      }))
      toast.success("Resume info extracted!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extraction failed")
    } finally {
      setLoading(false)
    }
  }, [state.parsedText, setLoading])

  const handleMatch = useCallback(async () => {
    if (!state.parsedText) {
      toast.error("Please upload a resume first")
      return
    }
    const jd = state.jobDescription.trim()
    if (!jd) {
      toast.error("Please enter a job description first")
      return
    }
    setLoading(true, "AI is scoring your resume…", 60)
    try {
      const result = await matchResume(state.parsedText, jd)
      setState((prev) => ({
        ...prev,
        matchResult: result,
        activeTab: "match",
      }))
      toast.success(`Match score: ${result.overall_score}/100`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Matching failed")
    } finally {
      setLoading(false)
    }
  }, [state.parsedText, state.jobDescription, setLoading])

  const handleFullAnalysis = useCallback(async () => {
    if (!state.selectedFile) return
    const jd = state.jobDescription.trim()

    setLoading(true, "Starting full analysis pipeline…", 10)

    try {
      // Step 1 — Upload
      updateProgress("Uploading & parsing PDF…", 20)
      const uploadResult = await uploadResume(state.selectedFile)

      let resumeInfo: ResumeInfo | null = null
      let matchResult: MatchResult | null = null

      // Step 2 — Extract
      updateProgress("AI is extracting structured info…", 45)
      try {
        resumeInfo = await extractInfo(uploadResult.text)
      } catch {
        toast.info("Info extraction had issues, continuing…")
      }

      // Step 3 — Match (only if JD provided)
      if (jd) {
        updateProgress("AI is scoring your resume against JD…", 70)
        try {
          matchResult = await matchResume(uploadResult.text, jd)
        } catch {
          toast.info("Matching had issues, continuing…")
        }
      }

      updateProgress("Done!", 100)

      const activeTab = matchResult ? "match" : resumeInfo ? "info" : "raw"

      setState((prev) => ({
        ...prev,
        parsedText: uploadResult.text,
        pageCount: uploadResult.page_count,
        resumeInfo,
        matchResult,
        activeTab,
      }))

      toast.success("Full analysis complete! 🎉")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }, [state.selectedFile, state.jobDescription, setLoading, updateProgress])

  // ── Memoised Store ─────────────────────────────────────────────────────

  const store = useMemo<AppStore>(
    () => ({
      ...state,
      setFile,
      clearFile,
      setJobDescription,
      setActiveTab,
      handleUploadOnly,
      handleExtract,
      handleMatch,
      handleFullAnalysis,
    }),
    [
      state,
      setFile,
      clearFile,
      setJobDescription,
      setActiveTab,
      handleUploadOnly,
      handleExtract,
      handleMatch,
      handleFullAnalysis,
    ],
  )

  return (
    <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAppStore(): AppStore {
  const store = useContext(AppStoreContext)
  if (!store)
    throw new Error("useAppStore must be used within an AppStoreProvider")
  return store
}

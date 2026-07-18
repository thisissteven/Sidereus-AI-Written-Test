"use client"

import { useCallback, useRef, useState } from "react"
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  Briefcase,
  ScanLine,
  Rocket,
  Upload,
  Search,
  BarChart3,
} from "lucide-react"
import { useAppStore } from "@/lib/use-app-store"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CandidateProfileCard } from "./candidate-profile"
import { MatchResults } from "./match-results"
import { cn } from "@/lib/utils"

// Import your custom animated primitives
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const SAMPLE_JD = `Python Backend / Full-Stack Intern

We are looking for a Python backend intern to build RESTful APIs on Serverless (Aliyun Function Compute). Responsibilities include PDF parsing, AI-based information extraction, and a Redis caching layer.

Requirements:
- Solid Python and RESTful API design
- Experience with FastAPI, PostgreSQL, Redis
- Familiar with Docker and Git workflows
- Bonus: React / TypeScript front-end skills`

export function ResumeAnalyzer() {
  const store = useAppStore()
  const { t } = useI18n()
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Tab state: "profile" | "match"
  const [activeTab, setActiveTab] = useState<string>("profile")

  // Use the store's JD state, falling back to sample if empty
  const jobDescription = store.jobDescription || SAMPLE_JD

  const handleFile = useCallback(
    (selected: File | null) => {
      if (!selected) return
      store.setFile(selected)
    },
    [store]
  )

  const reset = () => {
    store.clearFile()
    if (inputRef.current) inputRef.current.value = ""
    setActiveTab("profile") // Reset tab state
  }

  const hasFile = !!store.selectedFile
  const hasResults = !!store.resumeInfo || !!store.matchResult
  const hasParsedText = !!store.parsedText

  // Initialize store JD with sample on first render if empty
  if (!store.jobDescription && SAMPLE_JD) {
    store.setJobDescription(SAMPLE_JD)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* Input column */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              {t("upload.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasFile ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  handleFile(e.dataTransfer.files?.[0] ?? null)
                }}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 px-6 py-10 text-center transition-colors",
                  "hover:border-primary/50 hover:bg-secondary/60",
                  dragging && "border-primary bg-primary/5"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <UploadCloud className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("upload.dropzone")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("upload.hint")}
                  </p>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {store.selectedFile!.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {store.isLoading && !hasParsedText ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2
                          className="h-3 w-3 animate-spin"
                          aria-hidden="true"
                        />
                        {store.loadingMessage || t("upload.processing")}
                      </span>
                    ) : hasParsedText ? (
                      t("upload.pagesChars", {
                        pages: store.pageCount,
                        chars: store.parsedText.length.toLocaleString(),
                      })
                    ) : (
                      t("upload.readyToUpload", {
                        size: (
                          store.selectedFile!.size /
                          (1024 * 1024)
                        ).toFixed(2),
                      })
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={reset}
                  disabled={store.isLoading}
                  aria-label={t("upload.removeFile")}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              {t("jd.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jobDescription}
              onChange={(e) => store.setJobDescription(e.target.value)}
              rows={8}
              placeholder={t("jd.placeholder")}
              className="resize-none text-xs leading-relaxed"
            />
            <p className="text-right text-xs text-muted-foreground">
              {t("jd.charCount", { count: jobDescription.length })}
            </p>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={store.handleFullAnalysis}
                disabled={!hasFile || store.isLoading}
                className="col-span-2"
              >
                {store.isLoading ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    {store.loadingMessage || t("upload.processing")}
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" aria-hidden="true" />
                    {t("jd.fullAnalysis")}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={store.handleUploadOnly}
                disabled={!hasFile || store.isLoading}
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                {t("jd.uploadOnly")}
              </Button>
              <Button
                variant="outline"
                onClick={store.handleExtract}
                disabled={!hasParsedText || store.isLoading}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                {t("jd.extractInfo")}
              </Button>
              <Button
                variant="outline"
                onClick={store.handleMatch}
                disabled={!hasParsedText || store.isLoading}
                className="col-span-2"
              >
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                {t("jd.matchScore")}
              </Button>
            </div>

            {/* Progress bar */}
            {store.isLoading && (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${store.progressPercent}%` }}
                  />
                </div>
                <p className="center text-xs text-muted-foreground">
                  {store.loadingMessage}
                </p>
              </div>
            )}

            {!hasFile && (
              <p className="text-center text-xs text-muted-foreground">
                {t("jd.uploadToEnable")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results column */}
      <div className="space-y-6">
        {!hasFile && !hasResults ? (
          <EmptyState />
        ) : store.isLoading && !hasResults ? (
          <ParsingState message={store.loadingMessage} />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(val) => val && setActiveTab(val)}
            className="w-full space-y-2"
          >
            {/* Functional Primitives list automatically managing tab state widths */}
            {hasResults && (
              <TabsList className="w-full justify-start">
                <TabsTrigger value="profile" disabled={!store.resumeInfo}>
                  <Briefcase className="h-4 w-4" />
                  {t("jd.extractInfo") || "Profile"}
                </TabsTrigger>
                <TabsTrigger value="match" disabled={!store.matchResult}>
                  <ScanLine className="h-4 w-4" />
                  {t("jd.matchScore") || "Match Analysis"}
                </TabsTrigger>
              </TabsList>
            )}

            {/* Hardware-accelerated sliding panels */}
            <TabsContent value="profile">
              {store.resumeInfo && (
                <CandidateProfileCard resumeInfo={store.resumeInfo} />
              )}
            </TabsContent>

            <TabsContent value="match">
              {store.matchResult && <MatchResults match={store.matchResult} />}
            </TabsContent>

            {/* Raw parsed text fallback layout block */}
            {hasParsedText && !store.resumeInfo && !store.matchResult && (
              <RawTextCard
                text={store.parsedText}
                pageCount={store.pageCount}
              />
            )}
          </Tabs>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  const { t } = useI18n()
  return (
    <Card className="flex min-h-[320px] flex-col items-center justify-center border-dashed text-center">
      <CardContent className="flex flex-col items-center gap-3 pt-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">
            {t("results.emptyTitle")}
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t("results.emptyDesc")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ParsingState({ message }: { message?: string }) {
  const { t } = useI18n()
  return (
    <Card className="min-h-80">
      <CardContent className="flex min-h-80 flex-col items-center justify-center gap-4 pt-6 text-center">
        <Loader2
          className="h-8 w-8 animate-spin text-primary"
          aria-hidden="true"
        />
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">
            {t("results.parsingTitle")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {message || t("results.parsingDesc")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function RawTextCard({ text, pageCount }: { text: string; pageCount: number }) {
  const { t } = useI18n()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
          {t("raw.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="scheme-light dark:scheme-dark">
        <p className="mb-3 text-xs text-muted-foreground">
          {t("raw.meta", {
            pages: pageCount,
            chars: text.length.toLocaleString(),
          })}
        </p>
        <div className="max-h-[400px] overflow-auto rounded-lg border border-border bg-secondary/30 p-4 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
          {text}
        </div>
      </CardContent>
    </Card>
  )
}

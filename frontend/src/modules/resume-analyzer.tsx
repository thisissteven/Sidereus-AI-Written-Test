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
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CandidateProfileCard } from "./candidate-profile"
import { MatchResults } from "./match-results"
import { cn } from "@/lib/utils"

const SAMPLE_JD = `Python Backend / Full-Stack Intern

We are looking for a Python backend intern to build RESTful APIs on Serverless (Aliyun Function Compute). Responsibilities include PDF parsing, AI-based information extraction, and a Redis caching layer.

Requirements:
- Solid Python and RESTful API design
- Experience with FastAPI, PostgreSQL, Redis
- Familiar with Docker and Git workflows
- Bonus: React / TypeScript front-end skills`

export function ResumeAnalyzer() {
  const store = useAppStore()
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Use the store's JD state, falling back to sample if empty
  const jobDescription = store.jobDescription || SAMPLE_JD

  const handleFile = useCallback(
    (selected: File | null) => {
      if (!selected) return
      store.setFile(selected)
    },
    [store],
  )

  const reset = () => {
    store.clearFile()
    if (inputRef.current) inputRef.current.value = ""
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
              <ScanLine className="h-4 w-4 text-primary" aria-hidden="true" />1
              · Upload Resume
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
                  dragging && "border-primary bg-primary/5",
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Drop a PDF resume here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Single PDF file · max 10 MB · multi-page supported
                  </p>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                        {store.loadingMessage || "Processing…"}
                      </span>
                    ) : hasParsedText ? (
                      `${store.pageCount} pages · ${store.parsedText.length.toLocaleString()} characters`
                    ) : (
                      `${(store.selectedFile!.size / (1024 * 1024)).toFixed(2)} MB · ready to upload`
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={reset}
                  disabled={store.isLoading}
                  aria-label="Remove file"
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
              <Briefcase className="h-4 w-4 text-primary" aria-hidden="true" />2
              · Job Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jobDescription}
              onChange={(e) => store.setJobDescription(e.target.value)}
              rows={8}
              placeholder="Paste the job description here…"
              className="resize-none text-xs leading-relaxed"
            />
            <p className="text-right text-xs text-muted-foreground">
              {jobDescription.length} characters
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
                    {store.loadingMessage || "Processing…"}
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" aria-hidden="true" />
                    Full Analysis
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={store.handleUploadOnly}
                disabled={!hasFile || store.isLoading}
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload Only
              </Button>
              <Button
                variant="outline"
                onClick={store.handleExtract}
                disabled={!hasParsedText || store.isLoading}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Extract Info
              </Button>
              <Button
                variant="outline"
                onClick={store.handleMatch}
                disabled={!hasParsedText || store.isLoading}
                className="col-span-2"
              >
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                Match Score
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
                <p className="text-center text-xs text-muted-foreground">
                  {store.loadingMessage}
                </p>
              </div>
            )}

            {!hasFile && (
              <p className="text-center text-xs text-muted-foreground">
                Upload a resume to enable analysis.
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
          <>
            {store.resumeInfo && (
              <CandidateProfileCard resumeInfo={store.resumeInfo} />
            )}
            {store.matchResult && (
              <MatchResults match={store.matchResult} />
            )}
            {hasParsedText && !store.resumeInfo && !store.matchResult && (
              <RawTextCard
                text={store.parsedText}
                pageCount={store.pageCount}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="flex min-h-[320px] flex-col items-center justify-center border-dashed text-center">
      <CardContent className="flex flex-col items-center gap-3 pt-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">
            No resume analyzed yet
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Upload a PDF and ADAM will extract the candidate&apos;s key details,
            then score them against your role.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ParsingState({ message }: { message?: string }) {
  return (
    <Card className="min-h-[320px]">
      <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 pt-6 text-center">
        <Loader2
          className="h-8 w-8 animate-spin text-primary"
          aria-hidden="true"
        />
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">
            Analyzing resume
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {message || "Extracting text, cleaning, and running AI extraction…"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function RawTextCard({
  text,
  pageCount,
}: {
  text: string
  pageCount: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
          Parsed Resume Text
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          📄 {pageCount} page(s) · {text.length.toLocaleString()} characters
        </p>
        <div className="max-h-[400px] overflow-auto rounded-lg border border-border bg-secondary/30 p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap font-mono">
          {text}
        </div>
      </CardContent>
    </Card>
  )
}

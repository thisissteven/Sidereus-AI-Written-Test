import {
  Check,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from "lucide-react"
import type { MatchResult } from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScoreRing } from "./score-ring"
import { cn } from "@/lib/utils"

function hasText(value?: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export function MatchResults({ match }: { match: MatchResult }) {
  const { t } = useI18n()

  const score =
    typeof match.overall_score === "number" && !Number.isNaN(match.overall_score)
      ? match.overall_score
      : 0

  const tone: "strong" | "moderate" | "weak" =
    score >= 75 ? "strong" : score >= 50 ? "moderate" : "weak"
  const label =
    tone === "strong"
      ? t("match.strong")
      : tone === "moderate"
        ? t("match.moderate")
        : t("match.weak")

  const toneClass =
    tone === "strong"
      ? "bg-chart-3/15 text-chart-3"
      : tone === "moderate"
        ? "bg-accent/15 text-accent-foreground"
        : "bg-chart-5/15 text-chart-5"

  const dimensions = (match.dimensions ?? []).filter((d) => hasText(d?.name))
  const strengths = (match.strengths ?? []).filter((s) => hasText(s))
  const weaknesses = (match.weaknesses ?? []).filter((s) => hasText(s))
  const suggestions = (match.suggestions ?? []).filter((s) => hasText(s))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="font-heading text-base">
          {t("match.title")}
        </CardTitle>
        <Badge className={cn("gap-1.5 border-0 font-medium", toneClass)}>
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall score ring + dimension bars */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <ScoreRing value={score} label={t("match.overall")} />
          <div className="w-full flex-1 space-y-4">
            {dimensions.length > 0 ? (
              dimensions.map((dim) => (
                <DimensionBar
                  key={dim.name}
                  label={dim.name}
                  value={
                    typeof dim.score === "number" && !Number.isNaN(dim.score)
                      ? dim.score
                      : 0
                  }
                  comment={dim.comment}
                />
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground/80">
                {t("match.noDimensions")}
              </p>
            )}
          </div>
        </div>

        {/* Strengths, Weaknesses */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailList
            title={t("match.strengths")}
            items={strengths}
            emptyLabel={t("match.noStrengths")}
            variant="strength"
          />
          <DetailList
            title={t("match.weaknesses")}
            items={weaknesses}
            emptyLabel={t("match.noWeaknesses")}
            variant="weakness"
          />
        </div>

        {/* Suggestions */}
        <div className="rounded-lg border border-border p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            {t("match.suggestions")} ({suggestions.length})
          </p>
          {suggestions.length > 0 ? (
            <ul className="space-y-1.5">
              {suggestions.map((suggestion, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <Sparkles
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-xs leading-relaxed">{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground/80">
              {t("match.noSuggestions")}
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <Sparkles
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-semibold text-primary">
              {t("match.aiAssessment")}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {hasText(match.summary) ? match.summary : t("match.noSummary")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DimensionBar({
  label,
  value,
  comment,
}: {
  label: string
  value: number
  comment?: string
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground tabular-nums">
          {value}%
        </span>
      </div>
      <Progress value={value} />
      {comment && comment.trim().length > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">{comment}</p>
      )}
    </div>
  )
}

function DetailList({
  title,
  items,
  emptyLabel,
  variant,
}: {
  title: string
  items: string[]
  emptyLabel: string
  variant: "strength" | "weakness"
}) {
  const Icon = variant === "strength" ? Check : AlertTriangle
  const iconTone = variant === "strength" ? "text-chart-3" : "text-chart-5"

  return (
    <div className="rounded-lg border border-border p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {title} ({items.length})
      </p>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <Icon
                className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", iconTone)}
                aria-hidden="true"
              />
              <span className="text-xs leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground/80">{emptyLabel}</p>
      )}
    </div>
  )
}

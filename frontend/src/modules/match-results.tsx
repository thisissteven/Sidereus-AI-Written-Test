import { Check, X, Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"
import type { MatchResult } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScoreRing } from "./score-ring"
import { cn } from "@/lib/utils"

function getRecommendation(score: number): {
  label: string
  tone: "strong" | "moderate" | "weak"
} {
  if (score >= 75) return { label: "Strong fit", tone: "strong" }
  if (score >= 50) return { label: "Moderate fit", tone: "moderate" }
  return { label: "Weak fit", tone: "weak" }
}

export function MatchResults({ match }: { match: MatchResult }) {
  const { label, tone } = getRecommendation(match.overall_score)

  const toneClass =
    tone === "strong"
      ? "bg-chart-3/15 text-chart-3"
      : tone === "moderate"
        ? "bg-accent/15 text-accent-foreground"
        : "bg-chart-5/15 text-chart-5"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="font-heading text-base">Match Score</CardTitle>
        <Badge className={cn("gap-1.5 border-0 font-medium", toneClass)}>
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall score ring + dimension bars */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <ScoreRing value={match.overall_score} label="overall" />
          {match.dimensions && match.dimensions.length > 0 && (
            <div className="w-full flex-1 space-y-4">
              {match.dimensions.map((dim) => (
                <DimensionBar
                  key={dim.name}
                  label={dim.name}
                  value={dim.score}
                  comment={dim.comment}
                />
              ))}
            </div>
          )}
        </div>

        {/* Strengths, Weaknesses, Suggestions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {match.strengths && match.strengths.length > 0 && (
            <DetailList
              title="Strengths"
              items={match.strengths}
              variant="strength"
            />
          )}
          {match.weaknesses && match.weaknesses.length > 0 && (
            <DetailList
              title="Weaknesses"
              items={match.weaknesses}
              variant="weakness"
            />
          )}
        </div>

        {match.suggestions && match.suggestions.length > 0 && (
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
              Suggestions ({match.suggestions.length})
            </p>
            <ul className="space-y-1.5">
              {match.suggestions.map((suggestion, i) => (
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
          </div>
        )}

        {/* Summary */}
        {match.summary && (
          <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <Sparkles
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold text-primary">
                AI Assessment
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {match.summary}
              </p>
            </div>
          </div>
        )}
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
      {comment && (
        <p className="mt-1 text-xs text-muted-foreground">{comment}</p>
      )}
    </div>
  )
}

function DetailList({
  title,
  items,
  variant,
}: {
  title: string
  items: string[]
  variant: "strength" | "weakness"
}) {
  const Icon = variant === "strength" ? Check : AlertTriangle
  const iconTone =
    variant === "strength" ? "text-chart-3" : "text-chart-5"

  return (
    <div className="rounded-lg border border-border p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {title} ({items.length})
      </p>
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
    </div>
  )
}

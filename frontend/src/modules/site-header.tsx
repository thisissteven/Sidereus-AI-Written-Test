import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="font-heading text-sm font-bold text-foreground">
              ADAM · Resume Intelligence
            </p>
            <p className="text-xs text-muted-foreground">
              Sidereus AI · 星使智算
            </p>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="hidden gap-1.5 font-mono text-[11px] sm:inline-flex"
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-chart-3"
            aria-hidden="true"
          />
          API online
        </Badge>
      </div>
    </header>
  )
}

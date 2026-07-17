import { useEffect, useState } from "react"
import { Sparkles, Languages } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { checkHealth } from "@/lib/api"
import { cn } from "@/lib/utils"

type HealthStatus = "checking" | "online" | "offline"

const POLL_INTERVAL_MS = 30_000

export function SiteHeader() {
  const { t, language, toggleLanguage } = useI18n()
  const [status, setStatus] = useState<HealthStatus>("checking")

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    const ping = async () => {
      const ok = await checkHealth(controller.signal)
      if (active) setStatus(ok ? "online" : "offline")
    }

    ping()
    const id = window.setInterval(ping, POLL_INTERVAL_MS)

    return () => {
      active = false
      controller.abort()
      window.clearInterval(id)
    }
  }, [])

  const statusLabel =
    status === "online"
      ? t("header.apiOnline")
      : status === "offline"
        ? t("header.apiOffline")
        : t("header.apiChecking")

  const dotClass =
    status === "online"
      ? "bg-chart-3"
      : status === "offline"
        ? "bg-destructive"
        : "bg-muted-foreground animate-pulse"

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="font-heading text-sm font-bold text-foreground">
              {t("header.title")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("header.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge
            variant="secondary"
            className="hidden gap-1.5 font-mono text-[11px] sm:inline-flex"
            role="status"
            aria-live="polite"
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", dotClass)}
              aria-hidden="true"
            />
            {statusLabel}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="gap-1.5"
            aria-label={
              language === "en"
                ? t("header.switchToChinese")
                : t("header.switchToEnglish")
            }
            title={
              language === "en"
                ? t("header.switchToChinese")
                : t("header.switchToEnglish")
            }
          >
            <Languages className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium tabular-nums">
              {language === "en" ? "EN" : "中文"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}

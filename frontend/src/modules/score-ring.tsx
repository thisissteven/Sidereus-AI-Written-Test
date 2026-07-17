import { cn } from "@/lib/utils"

interface ScoreRingProps {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

export function ScoreRing({
  value,
  size = 132,
  strokeWidth = 10,
  label,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

  const tone =
    value >= 75 ? "text-chart-3" : value >= 50 ? "text-accent" : "text-chart-5"

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", tone)}
          style={{ stroke: "currentColor" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-3xl font-bold tabular-nums text-foreground">
          {value}
        </span>
        {label ? (
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        ) : null}
      </div>
    </div>
  )
}

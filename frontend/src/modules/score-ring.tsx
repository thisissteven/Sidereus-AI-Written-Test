"use client"

import { useEffect, useState } from "react"
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
  const [isMounted, setIsMounted] = useState(false)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Guard values between 0 and 100
  const cleanValue = Math.min(100, Math.max(0, value))
  const targetOffset = circumference - (cleanValue / 100) * circumference

  // Initial offset is full circumference (0% visible) until mounted
  const animatedOffset = isMounted ? targetOffset : circumference

  useEffect(() => {
    // A microtask timeout ensures the DOM renders the initial 0% position first
    const timer = setTimeout(() => setIsMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const tone =
    value >= 75
      ? "text-blue-400"
      : value >= 50
        ? "text-blue-500"
        : "text-blue-600"

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
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
          strokeDashoffset={animatedOffset}
          className={cn(
            "transition-[stroke-dashoffset] duration-1000 ease-out",
            tone
          )}
          style={{ stroke: "currentColor" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-3xl font-bold text-foreground tabular-nums">
          {value}
        </span>
        {label ? (
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}

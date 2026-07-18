"use client"

import { useEffect, useState } from "react"

import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
} from "@/components/ui/progress"

export function DimensionBar({
  label,
  value,
  comment,
}: {
  label: string
  value: number
  comment?: string
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const tone =
    value >= 75 ? "bg-blue-400" : value >= 50 ? "bg-blue-500" : "bg-blue-600"

  // Render 0 initially, then slide cleanly to target value
  const animatedValue = isMounted ? Math.min(100, Math.max(0, value)) : 0

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">{value}%</span>
      </div>

      {/* If your custom UI components read the standard value attribute */}
      <Progress value={animatedValue}>
        <ProgressTrack>
          <ProgressIndicator
            className={`${tone} transition-all duration-1000 ease-out`}
            style={{ width: `${animatedValue}%` }} // Inline styling fallback if indicator lacks internal sync
          />
        </ProgressTrack>
      </Progress>

      {comment && comment.trim().length > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">{comment}</p>
      )}
    </div>
  )
}

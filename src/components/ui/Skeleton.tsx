import React from "react"

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 6, style }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
    />
  )
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <Skeleton height={20} width="50%" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={14} width={`${100 - i * 10}%`} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "12px",
            padding: "12px 16px",
            background: i === 0 ? "var(--bg-elevated)" : undefined,
            borderBottom: i < rows ? "1px solid var(--border-default)" : undefined,
          }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} height={i === 0 ? 12 : 14} width={j === 0 ? "80%" : "60%"} />
          ))}
        </div>
      ))}
    </div>
  )
}

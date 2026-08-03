import React from "react"

interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  glow?: boolean
  onClick?: () => void
}

export function Card({ children, style, className, glow, onClick }: CardProps) {
  const interactive = Boolean(onClick)
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${glow ? "var(--border-accent)" : "var(--border-default)"}`,
        borderRadius: "16px",
        padding: "20px",
        boxShadow: glow ? "var(--glow-cyan), var(--shadow-card)" : "var(--shadow-card)",
        cursor: interactive ? "pointer" : undefined,
        transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!interactive) return
        const el = e.currentTarget
        el.style.transform = "translateY(-2px)"
        el.style.boxShadow = "var(--glow-cyan), var(--shadow-card)"
        el.style.borderColor = "var(--border-accent)"
      }}
      onMouseLeave={(e) => {
        if (!interactive) return
        const el = e.currentTarget
        el.style.transform = "translateY(0)"
        el.style.boxShadow = glow ? "var(--glow-cyan), var(--shadow-card)" : "var(--shadow-card)"
        el.style.borderColor = glow ? "var(--border-accent)" : "var(--border-default)"
      }}
    >
      {children}
    </div>
  )
}

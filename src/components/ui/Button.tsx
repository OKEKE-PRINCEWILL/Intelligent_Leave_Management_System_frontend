import React from "react"

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "warning"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

/**
 * Variants are driven by the blue/violet design tokens in globals.css so the
 * buttons stay consistent with the rest of the (light) app. Each variant also
 * declares the hover shadow it lifts into.
 */
const variantStyles: Record<Variant, React.CSSProperties & { "--hover-shadow"?: string }> = {
  primary: {
    background: "linear-gradient(135deg, #8B5A2B, #6F451F)",
    color: "#FFFFFF",
    border: "1px solid rgba(139,90,43,0.55)",
    fontWeight: 600,
    "--hover-shadow": "0 6px 18px rgba(139,90,43,0.35)",
  },
  secondary: {
    background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
    color: "#FFFFFF",
    border: "1px solid rgba(124,58,237,0.55)",
    fontWeight: 600,
    "--hover-shadow": "0 6px 18px rgba(124,58,237,0.32)",
  },
  ghost: {
    // Must be readable on the white/blue-tinted surfaces of the app.
    background: "var(--bg-surface)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-default)",
    fontWeight: 500,
    "--hover-shadow": "var(--shadow-card)",
  },
  danger: {
    background: "linear-gradient(135deg, #EF4444, #DC2626)",
    color: "#FFFFFF",
    border: "1px solid rgba(220,38,38,0.55)",
    fontWeight: 600,
    "--hover-shadow": "0 6px 18px rgba(220,38,38,0.32)",
  },
  success: {
    background: "linear-gradient(135deg, #10B981, #059669)",
    color: "#FFFFFF",
    border: "1px solid rgba(5,150,105,0.55)",
    fontWeight: 600,
    "--hover-shadow": "0 6px 18px rgba(5,150,105,0.3)",
  },
  warning: {
    background: "linear-gradient(135deg, #F59E0B, #D97706)",
    color: "#FFFFFF",
    border: "1px solid rgba(217,119,6,0.55)",
    fontWeight: 600,
    "--hover-shadow": "0 6px 18px rgba(217,119,6,0.3)",
  },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: "12px", borderRadius: "8px" },
  md: { padding: "10px 18px", fontSize: "14px", borderRadius: "10px" },
  lg: { padding: "14px 24px", fontSize: "15px", borderRadius: "12px" },
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading
  const { "--hover-shadow": hoverShadow, ...variantStyle } = variantStyles[variant]

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.55 : 1,
        transition: "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.2px",
        whiteSpace: "nowrap",
        ...variantStyle,
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          const el = e.currentTarget
          el.style.transform = "translateY(-1px)"
          el.style.boxShadow = hoverShadow ?? "none"
          if (variant === "ghost") el.style.borderColor = "var(--border-accent)"
        }
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          const el = e.currentTarget
          el.style.transform = "translateY(0)"
          el.style.boxShadow = "none"
          if (variant === "ghost") el.style.borderColor = "var(--border-default)"
        }
        props.onMouseLeave?.(e)
      }}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  )
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
      <path d="M7 2A5 5 0 0 1 12 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

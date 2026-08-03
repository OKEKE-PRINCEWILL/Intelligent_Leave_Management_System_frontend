import React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  color: "var(--text-primary)",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  fontFamily: "var(--font-body)",
}

export function Input({ label, error, icon, style, ...props }: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
        )}
        <input
          {...props}
          style={{
            ...inputBase,
            paddingLeft: icon ? "38px" : "14px",
            borderColor: error ? "var(--status-rejected)" : undefined,
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error
              ? "var(--status-rejected)"
              : "var(--border-accent)"
            e.currentTarget.style.boxShadow = error
              ? "0 0 0 3px rgba(220,38,38,0.12)"
              : "0 0 0 3px var(--accent-primary-bg)"
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? "var(--status-rejected)"
              : "var(--border-default)"
            e.currentTarget.style.boxShadow = "none"
            props.onBlur?.(e)
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: "12px", color: "var(--status-rejected)" }}>{error}</span>
      )}
    </div>
  )
}

export function Textarea({ label, error, style, ...props }: TextareaProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        style={{
          ...inputBase,
          resize: "vertical",
          minHeight: "80px",
          borderColor: error ? "var(--status-rejected)" : undefined,
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error
            ? "var(--status-rejected)"
            : "var(--border-accent)"
          e.currentTarget.style.boxShadow = error
            ? "0 0 0 3px rgba(220,38,38,0.12)"
            : "0 0 0 3px var(--accent-primary-bg)"
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? "var(--status-rejected)"
            : "var(--border-default)"
          e.currentTarget.style.boxShadow = "none"
          props.onBlur?.(e)
        }}
      />
      {error && (
        <span style={{ fontSize: "12px", color: "var(--status-rejected)" }}>{error}</span>
      )}
    </div>
  )
}

export function Select({ label, error, options, placeholder, style, ...props }: SelectProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
          {label}
        </label>
      )}
      <select
        {...props}
        style={{
          ...inputBase,
          appearance: "none",
          cursor: "pointer",
          borderColor: error ? "var(--status-rejected)" : undefined,
          ...style,
        }}
      >
        {placeholder && (
          <option value="" style={{ background: "var(--bg-elevated)" }}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: "12px", color: "var(--status-rejected)" }}>{error}</span>
      )}
    </div>
  )
}

import React, { useEffect, useRef } from "react"
import type { LeaveBalance } from "../../types/api.types"

interface LeaveBalanceArcProps {
  balance: LeaveBalance
}

export function LeaveBalanceArc({ balance }: LeaveBalanceArcProps) {
  const isOpenEnded = balance.openEnded || balance.entitled >= 999
  const total = balance.entitled + balance.carried
  const pct = isOpenEnded ? 1 : total > 0 ? balance.remaining / total : 0
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - pct * circumference

  const color =
    pct > 0.5
      ? "var(--accent-primary)"
      : pct > 0.25
      ? "var(--accent-tertiary)"
      : "var(--status-rejected)"

  const strokeRef = useRef<SVGCircleElement>(null)
  useEffect(() => {
    if (strokeRef.current) {
      strokeRef.current.style.strokeDashoffset = `${circumference}`
      requestAnimationFrame(() => {
        if (strokeRef.current) {
          strokeRef.current.style.transition = "stroke-dashoffset 1.2s ease"
          strokeRef.current.style.strokeDashoffset = `${offset}`
        }
      })
    }
  }, [offset, circumference])

  const isLow = !isOpenEnded && balance.remaining < 3

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "16px",
        background: "var(--bg-surface)",
        border: `1px solid ${isLow ? "rgba(239,68,68,0.3)" : "var(--border-default)"}`,
        borderRadius: "16px",
        boxShadow: isLow ? "var(--glow-red)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Arc */}
      <div style={{ position: "relative", width: "110px", height: "110px" }}>
        <svg viewBox="0 0 110 110" style={{ width: "100%", height: "100%" }}>
          {/* Track */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="9"
          />
          {/* Progress */}
          <circle
            ref={strokeRef}
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform="rotate(-90 55 55)"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        {/* Center text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color,
            }}
          >
            {isOpenEnded ? "Flex" : balance.remaining}
          </span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            {isOpenEnded ? "duration" : "left"}
          </span>
        </div>
      </div>

      {/* Label */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
          {balance.leaveTypeName}
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "6px",
            justifyContent: "center",
            fontSize: "11px",
            color: "var(--text-secondary)",
          }}
        >
          <span>Used: {balance.used}</span>
          <span>·</span>
          {balance.carried > 0 && <><span>Carried: {balance.carried}</span><span>·</span></>}
          <span>Total: {isOpenEnded ? "As needed" : total}</span>
        </div>

        {isOpenEnded && (
          <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--accent-primary)" }}>
            No fixed day limit
          </div>
        )}

        {isLow && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "var(--status-rejected)",
              animation: "pulse-opacity 2s infinite",
            }}
          >
            ⚠ Low Balance
          </div>
        )}
      </div>
    </div>
  )
}

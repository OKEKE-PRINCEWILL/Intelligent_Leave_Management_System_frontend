import { motion } from "framer-motion"
import { Infinity, AlertTriangle, CheckCircle } from "lucide-react"
import type { LeaveBalance } from "../../types/api.types"

const OPEN_ENDED_CODES = ["SICK", "COMPASSIONATE"]

const leaveTypeColors: Record<string, { main: string; bg: string }> = {
  ANNUAL:        { main: "#8B5A2B", bg: "rgba(139,90,43,0.08)" },
  CASUAL:        { main: "#059669", bg: "rgba(5,150,105,0.08)" },
  SICK:          { main: "#D97706", bg: "rgba(217,119,6,0.08)" },
  COMPASSIONATE: { main: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  MATERNITY:     { main: "#DB2777", bg: "rgba(219,39,119,0.08)" },
  STUDY:         { main: "#0891B2", bg: "rgba(8,145,178,0.08)" },
}

export function LeaveBalanceCard({ b, index = 0 }: { b: LeaveBalance; index?: number }) {
  const isOE = b.openEnded || OPEN_ENDED_CODES.includes(b.code)
  const total = b.entitled + b.carried
  const pct = isOE ? 1 : total > 0 ? Math.min(b.remaining / total, 1) : 0
  const isLow = !isOE && b.remaining < 3
  const palette = leaveTypeColors[b.code] || { main: "var(--accent-primary)", bg: "var(--accent-primary-bg)" }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{
        background: "var(--bg-surface)",
        border: `1.5px solid ${isLow ? "rgba(220,38,38,0.35)" : "var(--border-default)"}`,
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: isLow ? "0 0 0 3px rgba(220,38,38,0.08)" : "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{b.leaveTypeName}</div>
          {isOE && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>No fixed period</div>
          )}
        </div>
        {isLow && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--status-rejected)", fontWeight: 600 }}>
            <AlertTriangle size={12} />
            Low
          </div>
        )}
        {!isLow && !isOE && b.remaining > 0 && (
          <CheckCircle size={16} color="var(--status-approved)" style={{ opacity: 0.5 }} />
        )}
      </div>

      {/* Balance display */}
      {isOE ? (
        <div style={{
          padding: "14px",
          background: palette.bg,
          border: `1px solid ${palette.main}25`,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <Infinity size={22} color={palette.main} />
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: palette.main }}>Open-ended</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Apply for the duration you need</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Big number */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <span style={{ fontSize: "40px", fontWeight: 800, color: palette.main, lineHeight: 1 }}>
              {b.remaining}
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>/ {total} days left</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.07 + 0.2 }}
              style={{
                height: "100%",
                background: isLow ? "var(--status-rejected)" : pct > 0.5 ? palette.main : "var(--status-pending)",
                borderRadius: "3px",
              }}
            />
          </div>
        </div>
      )}

      {/* Breakdown row */}
      {!isOE && (
        <div style={{ display: "flex", gap: "16px", paddingTop: "8px", borderTop: "1px solid var(--border-default)" }}>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{b.entitled}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Entitled</div>
          </div>
          {b.carried > 0 && (
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-primary)" }}>{b.carried}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Carried</div>
            </div>
          )}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-tertiary)" }}>{b.used}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Used</div>
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{
              fontSize: "14px", fontWeight: 700,
              color: isLow ? "var(--status-rejected)" : "var(--status-approved)",
            }}>{b.remaining}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Left</div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

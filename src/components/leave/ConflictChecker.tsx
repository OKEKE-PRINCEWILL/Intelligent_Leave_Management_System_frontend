import React from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Users, AlertTriangle } from "lucide-react"
import type { ConflictCheckResult } from "../../types/api.types"

interface ConflictCheckerProps {
  result: ConflictCheckResult | null
  loading?: boolean
}

export function ConflictChecker({ result, loading }: ConflictCheckerProps) {
  if (loading) {
    return (
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "12px",
          padding: "16px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ color: "var(--accent-primary)", marginBottom: "8px" }}>
          RUNNING CONFLICT CHECK...
        </div>
        <div
          style={{
            height: "3px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "60%",
              background: "var(--accent-primary)",
              animation: "pulse-opacity 1s infinite",
            }}
          />
        </div>
      </div>
    )
  }

  if (!result) return null

  const rows = [
    {
      label: "Staff Available",
      value: `${result.staffAvailable} / ${result.staffAvailable + result.overlappingCount}`,
      ok: result.safe,
    },
    { label: "Min Required", value: result.minRequired, ok: true },
    { label: "Overlapping Colleagues", value: result.overlappingCount, ok: result.overlappingCount === 0 },
    { label: "Max Concurrent Allowed", value: result.maxConcurrent, ok: true },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${result.safe ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      {/* Terminal header */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-muted)",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        ━━ CONFLICT CHECK RESULTS ━━━━━━━━━━━━━━━━━━━━━
      </div>

      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "4px 0",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>
            {row.ok ? "✓" : "⚠"} &nbsp;{row.label}
          </span>
          <span
            style={{
              color: row.ok ? "var(--status-approved)" : "var(--accent-tertiary)",
              fontWeight: 600,
            }}
          >
            {row.value}
          </span>
        </div>
      ))}

      {/* Status */}
      <div
        style={{
          marginTop: "12px",
          padding: "10px",
          background: result.safe ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${result.safe ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          fontWeight: 600,
          color: result.safe ? "var(--status-approved)" : "var(--status-rejected)",
        }}
      >
        {result.safe ? (
          <CheckCircle size={16} />
        ) : (
          <XCircle size={16} />
        )}
        STATUS: {result.safe ? "✅ SAFE TO PROCEED" : "⚠️ UNSAFE — CONFLICT DETECTED"}
      </div>

      {result.overlappingEmployees && result.overlappingEmployees.length > 0 && (
        <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--text-secondary)" }}>
          <Users size={11} style={{ display: "inline", marginRight: 4 }} />
          Colleagues on leave: {result.overlappingEmployees.join(", ")}
        </div>
      )}

      {!result.safe && result.message && (
        <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--accent-tertiary)" }}>
          <AlertTriangle size={11} style={{ display: "inline", marginRight: 4 }} />
          {result.message}
        </div>
      )}
    </motion.div>
  )
}

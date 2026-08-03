import React, { useState } from "react"
import { Shield, CheckCircle, AlertTriangle } from "lucide-react"
import type { AuditEntry } from "../../types/api.types"

interface AuditHashNodeProps {
  entry: AuditEntry
}

function truncateHash(hash: string): string {
  if (!hash || hash.length < 16) return hash || "—"
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`
}

export function AuditHashNode({ entry }: AuditHashNodeProps) {
  const [showFull, setShowFull] = useState(false)

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${entry.verified ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.3)"}`,
        borderRadius: "8px",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        transition: "border-color 0.15s ease",
      }}
      title="Click to toggle full hash"
      onClick={() => setShowFull((p) => !p)}
    >
      {entry.verified ? (
        <Shield size={13} color="var(--status-approved)" style={{ flexShrink: 0 }} />
      ) : (
        <AlertTriangle size={13} color="var(--status-rejected)" style={{ flexShrink: 0 }} />
      )}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: entry.verified ? "var(--text-secondary)" : "var(--status-rejected)",
          wordBreak: "break-all",
        }}
      >
        {showFull ? entry.currentHash : truncateHash(entry.currentHash)}
      </span>
      {entry.verified ? (
        <CheckCircle size={11} color="var(--status-approved)" style={{ flexShrink: 0, marginLeft: "auto" }} />
      ) : (
        <AlertTriangle size={11} color="var(--status-rejected)" style={{ flexShrink: 0, marginLeft: "auto" }} />
      )}
    </div>
  )
}

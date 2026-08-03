import React from "react"
import type { LeaveStatus } from "../../types/api.types"

interface StatusBadgeProps {
  status: LeaveStatus
  pulse?: boolean
}

const statusConfig: Record<
  LeaveStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "rgba(245,158,11,0.15)",
    color: "#F59E0B",
    border: "rgba(245,158,11,0.3)",
  },
  HOD_APPROVED: {
    label: "HOD Approved",
    bg: "rgba(169,100,42,0.15)",
    color: "#A9642A",
    border: "rgba(169,100,42,0.3)",
  },
  APPROVED: {
    label: "Approved",
    bg: "rgba(16,185,129,0.15)",
    color: "#10B981",
    border: "rgba(16,185,129,0.3)",
  },
  REJECTED: {
    label: "Rejected",
    bg: "rgba(239,68,68,0.15)",
    color: "#EF4444",
    border: "rgba(239,68,68,0.3)",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "rgba(107,114,128,0.15)",
    color: "#6B7280",
    border: "rgba(107,114,128,0.3)",
  },
  RETURNED: {
    label: "Returned",
    bg: "rgba(139,92,246,0.15)",
    color: "#8B5CF6",
    border: "rgba(139,92,246,0.3)",
  },
}

export function StatusBadge({ status, pulse = false }: StatusBadgeProps) {
  const cfg = statusConfig[status]
  const isPending = status === "PENDING"

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: "999px",
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        animation: isPending || pulse ? "pulse-opacity 2s infinite" : undefined,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: cfg.color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  )
}

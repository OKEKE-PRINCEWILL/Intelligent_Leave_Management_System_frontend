import React from "react"
import { motion } from "framer-motion"
import { Check, X, RotateCcw, Clock } from "lucide-react"
import { format, parseISO } from "date-fns"
import type { LeaveRequest, LeaveStatus } from "../../types/api.types"

type StepState = "completed" | "active" | "pending" | "error" | "cancelled"

interface Step {
  label: string
  sublabel?: string
  actor?: string
  timestamp?: string
  comment?: string
}

function getStepStates(req: LeaveRequest): [StepState, StepState, StepState, StepState] {
  switch (req.status) {
    case "PENDING":
      return ["completed", "active", "pending", "pending"]
    case "HOD_APPROVED":
      return ["completed", "completed", "active", "pending"]
    case "APPROVED":
      return ["completed", "completed", "completed", "completed"]
    case "REJECTED":
      if (req.hrActionedAt) return ["completed", "completed", "error", "pending"]
      return ["completed", "error", "pending", "pending"]
    case "RETURNED":
      if (req.hrActionedAt) return ["completed", "completed", "error", "pending"]
      return ["completed", "error", "pending", "pending"]
    case "CANCELLED":
      return ["completed", "cancelled", "cancelled", "cancelled"]
    default:
      return ["completed", "pending", "pending", "pending"]
  }
}

function getSteps(req: LeaveRequest): Step[] {
  return [
    {
      label: "Submitted",
      sublabel: "Application filed",
      actor: req.employeeName,
      timestamp: req.createdAt,
    },
    {
      label: "HOD Review",
      sublabel: "Head of Department",
      actor: req.hodActorName,
      timestamp: req.hodActionedAt,
      comment: req.hodComment,
    },
    {
      label: "HR Review",
      sublabel: "Human Resources",
      actor: req.hrActorName,
      timestamp: req.hrActionedAt,
      comment: req.hrComment,
    },
    {
      label: "Resolved",
      sublabel: "Final Decision",
      timestamp: req.hrActionedAt || req.hodActionedAt,
    },
  ]
}

function fmtTimestamp(ts?: string) {
  if (!ts) return null
  try {
    return format(parseISO(ts), "MMM d, HH:mm")
  } catch {
    return ts
  }
}

function StepIcon({ state }: { state: StepState }) {
  if (state === "completed") return <Check size={14} strokeWidth={3} />
  if (state === "error") return <X size={14} strokeWidth={3} />
  if (state === "cancelled") return <X size={14} strokeWidth={3} />
  if (state === "active") return <Clock size={14} />
  return null
}

function stepColor(state: StepState) {
  if (state === "completed") return "var(--status-approved)"
  if (state === "active") return "var(--accent-primary)"
  if (state === "error") return "var(--status-rejected)"
  if (state === "cancelled") return "var(--status-cancelled)"
  return "var(--text-muted)"
}

function lineColor(from: StepState, to: StepState) {
  if (from === "completed" && (to === "completed" || to === "active"))
    return "linear-gradient(90deg, var(--status-approved), var(--accent-primary))"
  if (from === "completed" && to === "error")
    return "linear-gradient(90deg, var(--status-approved), var(--status-rejected))"
  return "rgba(255,255,255,0.08)"
}

export function LeaveProgressTracker({ leaveRequest }: { leaveRequest: LeaveRequest }) {
  const states = getStepStates(leaveRequest)
  const steps = getSteps(leaveRequest)

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Horizontal tracker */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 0,
          overflowX: "auto",
          paddingBottom: "8px",
        }}
      >
        {steps.map((step, i) => {
          const state = states[i]
          const color = stepColor(state)
          const isLast = i === steps.length - 1

          return (
            <React.Fragment key={i}>
              {/* Step node + label */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "100px",
                  flexShrink: 0,
                }}
              >
                {/* Node */}
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: `2px solid ${color}`,
                    background:
                      state === "pending"
                        ? "transparent"
                        : state === "active"
                        ? "rgba(139,90,43,0.15)"
                        : `${color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color,
                    boxShadow:
                      state === "active"
                        ? "0 0 0 6px rgba(139,90,43,0.15)"
                        : state === "error"
                        ? "0 0 0 6px rgba(239,68,68,0.15)"
                        : "none",
                    animation: state === "active" ? "pulse-ring 2s infinite" : "none",
                    flexShrink: 0,
                  }}
                >
                  <StepIcon state={state} />
                </motion.div>

                {/* Label */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: state === "pending" ? "var(--text-muted)" : "var(--text-primary)",
                    }}
                  >
                    {step.label}
                  </div>
                  {step.timestamp && state !== "pending" ? (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {fmtTimestamp(step.timestamp)}
                    </div>
                  ) : (
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {state === "active" ? "Awaiting..." : state === "pending" ? "—" : ""}
                    </div>
                  )}
                  {step.actor && state !== "pending" && (
                    <div style={{ fontSize: "10px", color, marginTop: "2px" }}>
                      {step.actor}
                    </div>
                  )}
                </div>

                {/* Comment bubble */}
                {step.comment && state !== "pending" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      fontSize: "11px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      color: "var(--text-secondary)",
                      maxWidth: "120px",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    "{step.comment}"
                  </motion.div>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: "3px",
                    alignSelf: "flex-start",
                    marginTop: "16px",
                    background: lineColor(states[i], states[i + 1]),
                    minWidth: "24px",
                    borderRadius: "2px",
                    transition: "background 0.5s ease",
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Status summary */}
      {leaveRequest.status === "APPROVED" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "12px",
            padding: "10px 14px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "10px",
            color: "var(--status-approved)",
            fontSize: "13px",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          ✓ Leave Approved — Your leave request has been fully approved
        </motion.div>
      )}
      {(leaveRequest.status === "REJECTED" || leaveRequest.status === "RETURNED") && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "12px",
            padding: "10px 14px",
            background:
              leaveRequest.status === "REJECTED"
                ? "rgba(239,68,68,0.1)"
                : "rgba(139,92,246,0.1)",
            border: `1px solid ${leaveRequest.status === "REJECTED" ? "rgba(239,68,68,0.3)" : "rgba(139,92,246,0.3)"}`,
            borderRadius: "10px",
            color:
              leaveRequest.status === "REJECTED"
                ? "var(--status-rejected)"
                : "var(--status-returned)",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          {leaveRequest.status === "REJECTED" ? (
            <>✗ Request Rejected — {leaveRequest.hrComment || leaveRequest.hodComment || "No reason provided"}</>
          ) : (
            <><RotateCcw size={13} style={{ display: "inline", marginRight: 4 }} />Request Returned for clarification</>
          )}
        </motion.div>
      )}
    </div>
  )
}

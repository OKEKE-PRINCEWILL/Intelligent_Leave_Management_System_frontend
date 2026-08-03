import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"
import { Button } from "../ui/Button"
import type { ScoreResponse } from "../../types/api.types"

interface HeuristicScorePanelProps {
  leaveRequestId: number
  onScore: (id: number) => Promise<ScoreResponse>
  initialScore?: ScoreResponse
}

const factorOrder = ["staffing", "urgency", "criticality", "overlap", "duration"] as const
const factorLabels: Record<string, string> = {
  staffing: "Staff available",
  urgency: "Timing",
  criticality: "Ease of cover",
  overlap: "Other leave clashes",
  duration: "Number of days",
}

const computingSteps = [
  "Checking staff availability",
  "Checking the requested dates",
  "Checking how easy the role is to cover",
  "Checking other leave requests",
  "Checking the number of days",
  "Preparing the score",
  "Writing a clear recommendation",
]

function scoreColor(total: number) {
  if (total >= 75) return "var(--status-approved)"
  if (total >= 50) return "var(--accent-tertiary)"
  return "var(--status-rejected)"
}

function recommendationText(rec: string) {
  if (rec === "APPROVE") return "Looks good to approve"
  if (rec === "REVIEW") return "Review carefully"
  return "Not advised"
}

export function HeuristicScorePanel({ leaveRequestId, onScore, initialScore }: HeuristicScorePanelProps) {
  const [score, setScore] = useState<ScoreResponse | null>(initialScore || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [visibleSteps, setVisibleSteps] = useState(0)

  const runScore = async () => {
    setLoading(true)
    setError("")
    setScore(null)
    setVisibleSteps(0)

    for (let i = 0; i < computingSteps.length; i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 260))
      setVisibleSteps(i + 1)
    }

    try {
      setScore(await onScore(leaveRequestId))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to compute score")
    } finally {
      setLoading(false)
      setVisibleSteps(0)
    }
  }

  const color = score ? scoreColor(score.total) : "var(--accent-primary)"
  const reasons = score ? [...(score.primaryDrivers || []), ...(score.counterBalance || [])].slice(0, 6) : []

  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-accent)",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "var(--glow-cyan)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Zap size={18} color="var(--accent-primary)" />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--text-accent)", letterSpacing: "1px" }}>
            LEAVE REVIEW SCORE
          </span>
        </div>
        <Button size="sm" variant="primary" onClick={runScore} loading={loading}>
          {score ? "Run Again" : "Get Score"}
        </Button>
      </div>

      {loading && (
        <div style={{ background: "var(--bg-base)", borderRadius: "10px", padding: "16px", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
          <div style={{ color: "var(--accent-primary)", marginBottom: "8px" }}>
            Reviewing leave request #{leaveRequestId}...
          </div>
          {computingSteps.slice(0, visibleSteps).map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ marginBottom: "4px", display: "flex", gap: "8px", alignItems: "center" }}
            >
              <span style={{ color: index < visibleSteps - 1 ? "var(--status-approved)" : "var(--accent-tertiary)" }}>
                {index < visibleSteps - 1 ? "Done" : "..."}
              </span>
              <span>{step}</span>
            </motion.div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "var(--status-rejected)", fontSize: "13px", marginBottom: "12px" }}>
          {error}
        </div>
      )}

      <AnimatePresence>
        {score && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              padding: "16px",
              background: `${color}12`,
              border: `1px solid ${color}40`,
              borderRadius: "12px",
              marginBottom: "14px",
            }}>
              <div style={{ width: "74px", height: "74px", borderRadius: "50%", border: `8px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-display)", flexShrink: 0 }}>
                {score.total}
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>SCORE OUT OF 100</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color }}>
                  {recommendationText(score.recommendation)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
              {factorOrder.map((key, index) => {
                const factor = score.factors?.[key]
                if (!factor) return null
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>{factorLabels[key]}</span>
                      <span style={{ color: "var(--text-muted)" }}>{factor.score}/100</span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.score}%` }}
                        transition={{ duration: 0.7, delay: index * 0.06 }}
                        style={{ height: "100%", background: factor.score >= 70 ? "var(--status-approved)" : factor.score >= 40 ? "var(--accent-tertiary)" : "var(--status-rejected)" }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {reasons.length > 0 && (
              <div style={{ padding: "14px", border: "1px solid var(--border-default)", borderRadius: "10px", background: "var(--bg-base)", fontSize: "12px", color: "var(--text-secondary)" }}>
                <div style={{ fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Why this score?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {reasons.map((reason, index) => (
                    <div key={`${reason}-${index}`} style={{ display: "flex", gap: "8px", lineHeight: 1.45 }}>
                      <span style={{ color: "var(--accent-primary)", fontWeight: 800 }}>•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!score && !loading && (
        <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)", fontSize: "13px" }}>
          Click "Get Score" to see a simple recommendation and reason.
        </div>
      )}
    </div>
  )
}

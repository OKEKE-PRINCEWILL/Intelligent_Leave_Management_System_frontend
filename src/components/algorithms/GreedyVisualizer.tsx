import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, CheckCircle, XCircle } from "lucide-react"
import { Button } from "../ui/Button"
import type { GreedyResult } from "../../types/api.types"

interface GreedyVisualizerProps {
  result: GreedyResult | null
  loading: boolean
  onRun: () => void
  compact?: boolean
}

export function GreedyVisualizer({ result, loading, onRun, compact }: GreedyVisualizerProps) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid rgba(139,90,43,0.3)",
        borderRadius: "16px",
        padding: compact ? "14px" : "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Zap size={16} color="var(--algo-greedy)" />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "12px",
              color: "var(--algo-greedy)",
              letterSpacing: "1px",
            }}
          >
            GREEDY SCHEDULING ENGINE
          </span>
        </div>
        <Button size="sm" variant="primary" onClick={onRun} loading={loading}>
          {result ? "Re-run" : "Find Best Window"}
        </Button>
      </div>

      {loading && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            padding: "8px",
          }}
        >
          <span>Searching for optimal leave window</span>
          <span style={{ animation: "terminal-cursor 1s infinite" }}> ▋</span>
        </div>
      )}

      {/* Steps list */}
      {result && result.steps.length > 0 && (
        <div
          style={{
            background: "var(--bg-base)",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "14px",
            maxHeight: compact ? "160px" : "240px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            Searching for optimal leave window...
          </div>
          {result.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 0",
                borderBottom:
                  i < result.steps.length - 1 ? "1px solid var(--border-default)" : undefined,
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
              }}
            >
              {step.safe ? (
                <CheckCircle size={12} color="var(--status-approved)" />
              ) : (
                <XCircle size={12} color="var(--status-rejected)" />
              )}
              <span style={{ color: "var(--text-muted)" }}>Attempt {step.attempt}</span>
              <span style={{ color: "var(--text-primary)" }}>
                {step.date} → {step.endDate}
              </span>
              <span style={{ color: "var(--text-muted)" }}>
                On Leave: {step.onLeave} | Available: {step.available} | Min: {step.minRequired}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  color: step.safe ? "var(--status-approved)" : "var(--status-rejected)",
                  fontWeight: 700,
                }}
              >
                {step.safe ? "✅ SAFE" : "❌ UNSAFE"}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recommendation */}
      <AnimatePresence>
        {result?.recommendation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: "14px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--status-approved)",
                marginBottom: "8px",
              }}
            >
              ✅ RECOMMENDED WINDOW FOUND
            </div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "8px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Start</div>
                <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-display)" }}>
                  {result.recommendation.start}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>End</div>
                <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-display)" }}>
                  {result.recommendation.end}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Iterations</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--accent-primary)" }}>
                  {result.recommendation.iterations} attempts
                </div>
              </div>
            </div>
            {result.recommendation.reason && (
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                "{result.recommendation.reason}"
              </div>
            )}
          </motion.div>
        )}

        {result && !result.recommendation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "14px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "10px",
              color: "var(--status-rejected)",
              fontSize: "13px",
            }}
          >
            No safe window found. All available slots are fully booked or below minimum staffing.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

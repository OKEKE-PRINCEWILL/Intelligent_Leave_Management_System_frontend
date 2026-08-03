import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { GreedyVisualizer } from "../../components/algorithms/GreedyVisualizer"
import { leaveApi } from "../../api/leave.api"
import { useAuthStore } from "../../store/auth.store"
import type { GreedyResult } from "../../types/api.types"

export function GreedyRecommender() {
  const { user } = useAuthStore()
  const [startDate, setStartDate] = useState("")
  const [duration, setDuration] = useState("5")
  const [result, setResult] = useState<GreedyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRun = async () => {
    if (!user || !startDate) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const data = await leaveApi.greedyRecommend({
        departmentId: user.departmentId,
        employeeId: user.id,
        requestedStart: startDate,
        duration: parseInt(duration, 10) || 5,
      })
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to run scheduler")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Smart Leave Recommender</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          The Greedy Scheduling Engine finds the safest leave window while maintaining minimum staffing.
        </p>
      </div>

      <Card>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--accent-primary)", marginBottom: "20px", letterSpacing: "1px" }}>
          ⚡ GREEDY SCHEDULER CONFIGURATION
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <Input
            label="Desired Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Duration (working days)"
            type="number"
            min="1"
            max="30"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div style={{ padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Your Department</div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{user?.departmentName || "—"}</div>
          </div>
          <div style={{ padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Employee ID</div>
            <div style={{ fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-mono)" }}>{user?.staffId || "—"}</div>
          </div>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "10px 12px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              color: "var(--status-rejected)",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            {error}
          </motion.div>
        )}
        <Button
          variant="primary"
          loading={loading}
          disabled={!startDate || loading}
          onClick={handleRun}
        >
          Find Best Window
        </Button>
      </Card>

      {/* Algorithm visualization */}
      <GreedyVisualizer result={result} loading={loading} onRun={handleRun} />
    </div>
  )
}

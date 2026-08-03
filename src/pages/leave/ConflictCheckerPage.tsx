import React, { useState } from "react"
import { motion } from "framer-motion"
import { useMutation } from "@tanstack/react-query"
import { ShieldAlert, Calendar, Users } from "lucide-react"
import toast from "react-hot-toast"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { ConflictChecker } from "../../components/leave/ConflictChecker"
import { leaveApi } from "../../api/leave.api"
import { getApiErrorMessage } from "../../api/axios"
import type { ConflictCheckResult } from "../../types/api.types"

export function ConflictCheckerPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [result, setResult] = useState<ConflictCheckResult | null>(null)

  const checkMutation = useMutation({
    mutationFn: () => leaveApi.checkConflict({ startDate, endDate }),
    onSuccess: (data) => {
      setResult(data)
      if (data.hasConflict) {
        toast.error("Conflicts detected for the selected dates.")
      } else {
        toast.success("No conflicts found — dates are clear.")
      }
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const canCheck = startDate && endDate && startDate <= endDate

  const workingDays = (() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    let count = 0
    const cur = new Date(start)
    while (cur <= end) {
      const day = cur.getDay()
      if (day !== 0 && day !== 6) count++
      cur.setDate(cur.getDate() + 1)
    }
    return count
  })()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Conflict Checker</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Check for scheduling conflicts with your department team before submitting a leave request.
        </p>
      </div>

      {/* Date selection */}
      <Card>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--accent-primary)", marginBottom: "16px", letterSpacing: "1px" }}>
          CONFLICT ANALYSIS ENGINE
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", alignItems: "end" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setResult(null) }}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
                colorScheme: "dark",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => { setEndDate(e.target.value); setResult(null) }}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
                colorScheme: "dark",
              }}
            />
          </div>
          <Button
            variant="primary"
            icon={<ShieldAlert size={15} />}
            disabled={!canCheck}
            loading={checkMutation.isPending}
            onClick={() => checkMutation.mutate()}
          >
            Check Conflicts
          </Button>
        </div>

        {workingDays > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: "14px", display: "flex", gap: "16px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
              <Calendar size={12} color="var(--accent-primary)" />
              <span><strong style={{ color: "var(--accent-primary)" }}>{workingDays}</strong> working days</span>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <ConflictChecker result={result} />
        </motion.div>
      )}

      {/* Team on leave info */}
      {result && result.conflictingEmployees && result.conflictingEmployees.length > 0 && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Users size={15} color="var(--accent-tertiary)" />
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>
              TEAM ON LEAVE DURING THIS PERIOD
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.conflictingEmployees.map((emp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: "var(--bg-elevated)",
                  borderRadius: "8px",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--status-rejected)", flexShrink: 0 }}>
                  {emp.name?.[0] || "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{emp.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{emp.leaveType} · {emp.startDate} – {emp.endDate}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px", fontSize: "12px", color: "var(--accent-tertiary)" }}>
            ⚠ The greedy scheduler on your leave application will attempt to find alternative dates if these conflicts block approval.
          </div>
        </Card>
      )}

      {!result && (
        <Card>
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <ShieldAlert size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <div style={{ fontSize: "14px", fontWeight: 600 }}>Select dates and click "Check Conflicts"</div>
            <div style={{ fontSize: "12px", marginTop: "6px" }}>
              The system will analyze your department's leave schedule for the selected period.
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

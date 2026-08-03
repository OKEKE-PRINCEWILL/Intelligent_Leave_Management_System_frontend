import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import {
  TrendingUp, Table2, List, Lightbulb, Building2, Info,
  ArrowUp, ArrowDown, Minus, ChevronDown, ChevronRight,
  User, Calendar, Clock,
} from "lucide-react"
import { format, subMonths, parseISO, differenceInDays, addDays } from "date-fns"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { analyticsApi } from "../../api/analytics.api"
import { adminApi } from "../../api/admin.api"
import { approvalsApi } from "../../api/approvals.api"
import { getApiErrorMessage } from "../../api/axios"
import { useAuthStore } from "../../store/auth.store"
import type { ForecastResponse, ApprovalRequest } from "../../types/api.types"

const TABS = [
  { id: "historical", label: "Past Leave Data",   icon: <Table2 size={14} /> },
  { id: "forecast",   label: "Upcoming Forecast", icon: <TrendingUp size={14} /> },
  { id: "trace",      label: "Month Detail",       icon: <List size={14} /> },
  { id: "insights",   label: "Key Findings",       icon: <Lightbulb size={14} /> },
]

const animSteps = [
  "Reading historical leave data...    ✓",
  "Calculating rolling average...      ✓",
  "Projecting {h} months ahead...      ⟳",
  "Identifying peak and safe periods... ⟳",
]

function trendColor(t?: string) {
  if (!t) return "var(--text-muted)"
  if (t.toLowerCase().includes("above")) return "var(--status-rejected)"
  if (t.toLowerCase().includes("below")) return "var(--status-approved)"
  return "var(--accent-primary)"
}

function predictNextLeave(leaves: ApprovalRequest[]): { label: string; confidence: "high" | "medium" | "low" } | null {
  const approved = leaves
    .filter((l) => l.status === "APPROVED" || l.status === "HOD_APPROVED")
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  if (approved.length === 0) return null

  const last = approved[0]
  const lastEnd = parseISO(String(last.endDate))

  if (approved.length === 1) {
    // Only one data point — same month next year as a rough guess
    return { label: format(addDays(lastEnd, 365), "MMM yyyy"), confidence: "low" }
  }

  // Average gap between consecutive leaves (days between end of one and start of next)
  const gaps: number[] = []
  for (let i = 0; i < approved.length - 1; i++) {
    const gap = differenceInDays(
      parseISO(String(approved[i].startDate)),
      parseISO(String(approved[i + 1].endDate))
    )
    if (gap > 0) gaps.push(gap)
  }

  if (gaps.length === 0) return null

  const avgGap = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
  const predicted = addDays(lastEnd, avgGap)
  const confidence = gaps.length >= 3 ? "high" : gaps.length >= 2 ? "medium" : "low"
  return { label: format(predicted, "MMM yyyy"), confidence }
}

function confidenceColor(c: "high" | "medium" | "low") {
  return c === "high" ? "var(--status-approved)" : c === "medium" ? "var(--status-pending)" : "var(--text-muted)"
}

// ── Per-employee row inside the drill-down ────────────────────────────────────
function EmployeeLeaveRow({
  employeeId,
  employeeName,
  staffId,
  roleTitle,
  windowMonths,
}: {
  employeeId: number
  employeeName: string
  staffId?: string
  roleTitle?: string
  windowMonths: number
}) {
  const windowStart = subMonths(new Date(), windowMonths)

  const { data: leaves, isLoading, isError } = useQuery({
    queryKey: ["emp-leaves", employeeId],
    queryFn: () => approvalsApi.getEmployeeLeaves(employeeId),
    retry: false,
  })

  const recentLeaves = (leaves || [])
    .filter((l) => new Date(String(l.startDate)) >= windowStart)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 3)

  const prediction = leaves ? predictNextLeave(leaves) : null

  return (
    <div style={{
      padding: "14px 16px",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-default)",
      borderRadius: "10px",
    }}>
      {/* Employee header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
          background: "var(--accent-primary-bg)", border: "1px solid var(--border-accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "12px", color: "var(--accent-primary)",
        }}>
          {employeeName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>{employeeName}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {staffId && `${staffId} · `}{roleTitle || "Staff"}
          </div>
        </div>
        {/* Predicted next leave */}
        {prediction && (
          <div style={{
            textAlign: "right", flexShrink: 0,
            padding: "6px 12px",
            background: `${confidenceColor(prediction.confidence)}10`,
            border: `1px solid ${confidenceColor(prediction.confidence)}30`,
            borderRadius: "8px",
          }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "2px" }}>Next leave est.</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: confidenceColor(prediction.confidence) }}>
              {prediction.label}
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "1px" }}>
              {prediction.confidence} confidence
            </div>
          </div>
        )}
      </div>

      {/* Recent leaves */}
      {isLoading ? (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "6px 0" }}>Loading leave history...</div>
      ) : isError ? (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "6px 0" }}>Leave history not available.</div>
      ) : recentLeaves.length === 0 ? (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "6px 0" }}>
          No leave taken in the last {windowMonths} month{windowMonths !== 1 ? "s" : ""}.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.4px", marginBottom: "2px" }}>
            LEAVES IN PAST {windowMonths} MONTH{windowMonths !== 1 ? "S" : ""}
          </div>
          {recentLeaves.map((leave) => (
            <div
              key={leave.id}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "7px 10px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <Calendar size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {format(parseISO(String(leave.startDate)), "dd MMM")} – {format(parseISO(String(leave.endDate)), "dd MMM yyyy")}
              </span>
              <span style={{ color: "var(--text-muted)" }}>·</span>
              <span style={{ color: "var(--accent-tertiary)" }}>{leave.leaveType}</span>
              <span style={{ color: "var(--text-muted)" }}>·</span>
              <span style={{ color: "var(--text-secondary)" }}>{leave.workingDays}d</span>
              <span style={{
                marginLeft: "auto", fontSize: "10px", fontWeight: 700,
                color: leave.status === "APPROVED" ? "var(--status-approved)" : "var(--status-pending)",
              }}>
                {leave.status === "APPROVED" ? "Approved" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Drill-down panel shown when a forecast month is clicked ───────────────────
function MonthDrilldown({
  month,
  predictedCount,
  windowMonths,
  selectedDeptId,
  isHOD,
}: {
  month: string
  predictedCount: number
  windowMonths: number
  selectedDeptId: string
  isHOD: boolean
}) {
  // HOD uses department employee endpoint; HR Admin uses admin employees filtered by dept
  const { data: hodEmployees, isLoading: hodLoading } = useQuery({
    queryKey: ["dept-employees"],
    queryFn: approvalsApi.getDepartmentEmployees,
    enabled: isHOD,
  })

  const { data: allEmployees, isLoading: adminLoading } = useQuery({
    queryKey: ["admin-employees"],
    queryFn: adminApi.getEmployees,
    enabled: !isHOD,
  })

  // Normalise to a common shape
  const employees = isHOD
    ? (hodEmployees || []).map((e: any) => ({
        employeeId: e.employeeId ?? e.id,
        employeeName: e.fullName ?? e.employeeName ?? `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim(),
        staffId: e.staffId,
        roleTitle: e.roleTitle,
      }))
    : (allEmployees || [])
        .filter((e: any) => !selectedDeptId || String(e.departmentId) === selectedDeptId)
        .map((e: any) => ({
          employeeId: e.id,
          employeeName: `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || e.fullName,
          staffId: e.staffId,
          roleTitle: e.roleTitle,
        }))

  const isLoading = isHOD ? hodLoading : adminLoading

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{ marginTop: "4px" }}
    >
      <Card style={{ borderColor: "var(--border-accent)", background: "var(--bg-elevated)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{
            padding: "8px 14px",
            background: "var(--accent-primary-bg)",
            border: "1px solid var(--border-accent)",
            borderRadius: "8px",
          }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Predicted leaves</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-primary)" }}>{predictedCount}</div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{month}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Showing each staff member's recent leave history and predicted next leave.
            </div>
          </div>
        </div>

        {isLoading ? (
          <SkeletonCard rows={4} />
        ) : employees.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
            <User size={28} style={{ marginBottom: "8px", opacity: 0.4 }} />
            <p style={{ margin: 0 }}>No staff found. Select a department to see employee details.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {employees.map((emp) => (
              <EmployeeLeaveRow
                key={emp.employeeId}
                employeeId={emp.employeeId}
                employeeName={emp.employeeName}
                staffId={emp.staffId}
                roleTitle={emp.roleTitle}
                windowMonths={windowMonths}
              />
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ForecastPage() {
  const { user } = useAuthStore()
  const isHOD     = user?.role === "HOD"
  const isHRAdmin = user?.role === "HR_ADMIN" || user?.role === "AUDITOR"

  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    isHOD ? String(user?.departmentId ?? "") : ""
  )
  const [windowSize, setWindowSize] = useState(3)
  const [horizon, setHorizon] = useState(4)
  const [activeTab, setActiveTab] = useState("historical")
  const [forecast, setForecast] = useState<ForecastResponse | null>(null)
  const [steps, setSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  const { data: departments } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: adminApi.getDepartments,
    enabled: isHRAdmin,
  })

  const runForecast = async () => {
    setLoading(true)
    setError("")
    setForecast(null)
    setSteps([])
    setExpandedMonth(null)

    const stepsToShow = animSteps.map((s) => s.replace("{h}", String(horizon)))
    for (const step of stepsToShow) {
      await new Promise<void>((r) => setTimeout(r, 450))
      setSteps((prev) => [...prev, step])
    }

    try {
      const deptId = selectedDeptId ? Number(selectedDeptId) : undefined
      const data = await analyticsApi.forecast({ window: windowSize, horizon, departmentId: deptId })
      setForecast(data)
      setActiveTab("historical")
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const scopeLabel = isHOD
    ? user?.departmentName || "Your Department"
    : selectedDeptId
    ? departments?.find((d) => String(d.id) === selectedDeptId)?.name ?? "Selected Department"
    : "All Departments"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Leave Demand Forecast</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {isHOD
            ? `Predict upcoming leave demand for ${user?.departmentName || "your department"} and see individual staff patterns.`
            : "Predict upcoming leave demand by department. Click any forecast month to see staff-level breakdown."}
        </p>
      </div>

      {isHOD && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 14px",
          background: "var(--accent-primary-bg)", border: "1px solid var(--border-accent)",
          borderRadius: "10px", fontSize: "13px", color: "var(--text-secondary)",
        }}>
          <Building2 size={15} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          Forecast scoped to <strong style={{ color: "var(--accent-primary)", marginLeft: 4 }}>{user?.departmentName}</strong>
        </div>
      )}

      {/* Controls */}
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {isHRAdmin && (
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px", fontWeight: 500 }}>
                Department
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => { setSelectedDeptId(e.target.value); setForecast(null); setExpandedMonth(null) }}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                  borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none",
                }}
              >
                <option value="">All Departments (Organisation-wide)</option>
                {(departments || []).map((d) => (
                  <option key={d.id} value={String(d.id)}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px", fontWeight: 500 }}>
                Smoothing Period — {windowSize} month{windowSize !== 1 ? "s" : ""}
              </label>
              <input type="range" min="2" max="6" value={windowSize}
                onChange={(e) => setWindowSize(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-primary)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "3px" }}>
                <span>More responsive</span><span>Smoother</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px", fontWeight: 500 }}>
                Forecast Period — {horizon} month{horizon !== 1 ? "s" : ""} ahead
              </label>
              <input type="range" min="2" max="6" value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-secondary)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "3px" }}>
                <span>2 months</span><span>6 months</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--text-muted)", alignItems: "flex-start" }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: "1px", color: "var(--accent-primary)" }} />
            <span>
              Uses historical leave patterns to estimate upcoming demand. Click any forecast month to see
              each staff member's recent leave history and predicted next leave date.
            </span>
          </div>

          <Button variant="primary" loading={loading} onClick={runForecast}
            icon={<TrendingUp size={14} />} style={{ alignSelf: "flex-start" }}>
            Generate Forecast for {scopeLabel}
          </Button>
        </div>

        {loading && steps.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ marginTop: "16px", background: "var(--bg-elevated)", borderRadius: "10px", padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: "12px", border: "1px solid var(--border-default)" }}>
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                style={{ marginBottom: "6px", color: "var(--text-secondary)" }}>{s}
              </motion.div>
            ))}
            {loading && <span style={{ color: "var(--accent-primary)" }}>▋</span>}
          </motion.div>
        )}
        {error && (
          <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "var(--status-rejected)", fontSize: "13px" }}>
            {error}
          </div>
        )}
      </Card>

      {/* Results */}
      {forecast && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--border-default)" }}>
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", background: "none", border: "none",
                  borderBottom: activeTab === tab.id ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  color: activeTab === tab.id ? "var(--accent-primary)" : "var(--text-muted)",
                  fontSize: "13px", fontWeight: activeTab === tab.id ? 600 : 400,
                  cursor: "pointer", transition: "all 0.15s ease", marginBottom: "-1px",
                }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <Card>
              {/* ── Past Leave Data ───────────────────────────────────── */}
              {activeTab === "historical" && (
                <>
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>Past Leave Data</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Actual monthly leave requests with rolling average — {scopeLabel}
                    </p>
                  </div>
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: "8px", padding: "9px 14px", background: "var(--bg-elevated)", borderRadius: "8px", marginBottom: "4px", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.6px" }}>
                      <span>MONTH</span><span style={{ textAlign: "center" }}>REQUESTS</span><span style={{ textAlign: "center" }}>ROLLING AVG</span><span style={{ textAlign: "center" }}>VS AVERAGE</span>
                    </div>
                    {(forecast.historical ?? []).map((row: any, i: number) => {
                      const actual = row.requests ?? row.total ?? 0
                      const avg = row.movingAverage
                      const diff = avg != null ? actual - avg : null
                      const isAbove = diff != null && diff > 0.5
                      const isBelow = diff != null && diff < -0.5
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: "8px", padding: "11px 14px", borderBottom: i < (forecast.historical?.length ?? 0) - 1 ? "1px solid var(--border-default)" : undefined, alignItems: "center", fontSize: "13px" }}>
                          <span style={{ fontWeight: 600 }}>{row.month}</span>
                          <span style={{ textAlign: "center", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-primary)", fontSize: "15px" }}>{actual}</span>
                          <span style={{ textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{avg != null ? avg.toFixed(1) : "—"}</span>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                            {diff == null ? <Minus size={13} color="var(--text-muted)" />
                              : isAbove ? <><ArrowUp size={13} color="var(--status-rejected)" /><span style={{ fontSize: "12px", fontWeight: 600, color: "var(--status-rejected)" }}>+{diff.toFixed(1)} above</span></>
                              : isBelow ? <><ArrowDown size={13} color="var(--status-approved)" /><span style={{ fontSize: "12px", fontWeight: 600, color: "var(--status-approved)" }}>{diff.toFixed(1)} below</span></>
                              : <><Minus size={13} color="var(--text-muted)" /><span style={{ fontSize: "12px", color: "var(--text-muted)" }}>On track</span></>}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* ── Upcoming Forecast — clickable rows ───────────────── */}
              {activeTab === "forecast" && (
                <>
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>Predicted Leave Demand</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Next {horizon} months for {scopeLabel}.{" "}
                      <strong style={{ color: "var(--accent-primary)" }}>Click any row</strong> to see staff-level history and next-leave predictions.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {(forecast.forecast ?? []).map((row: any, i: number) => {
                      const isFcast = row.isForecast ?? true
                      const value = Math.round(row.forecast ?? row.total ?? 0)
                      const isExpanded = expandedMonth === row.month
                      return (
                        <div key={i}>
                          {/* Clickable row */}
                          <button
                            onClick={() => setExpandedMonth(isExpanded ? null : row.month)}
                            style={{
                              width: "100%", textAlign: "left", cursor: "pointer",
                              display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr auto",
                              gap: "8px", padding: "13px 16px",
                              background: isExpanded ? "var(--accent-primary-bg)" : "var(--bg-elevated)",
                              border: `1px solid ${isExpanded ? "var(--border-accent)" : "var(--border-default)"}`,
                              borderRadius: "10px",
                              alignItems: "center", fontSize: "13px",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isExpanded) {
                                e.currentTarget.style.borderColor = "var(--border-accent)"
                                e.currentTarget.style.background = "var(--accent-primary-bg)"
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isExpanded) {
                                e.currentTarget.style.borderColor = "var(--border-default)"
                                e.currentTarget.style.background = "var(--bg-elevated)"
                              }
                            }}
                          >
                            <span style={{ fontWeight: 700, color: isExpanded ? "var(--accent-primary)" : "var(--text-primary)" }}>
                              {row.month}
                            </span>
                            <span style={{ fontWeight: 800, fontFamily: "var(--font-mono)", fontSize: "18px", color: isFcast ? "var(--accent-secondary)" : "var(--accent-primary)" }}>
                              {value}
                            </span>
                            <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, padding: "2px 10px", borderRadius: "999px", color: isFcast ? "var(--accent-secondary)" : "var(--accent-primary)", background: isFcast ? "rgba(124,58,237,0.08)" : "var(--accent-primary-bg)", border: `1px solid ${isFcast ? "rgba(124,58,237,0.25)" : "var(--border-accent)"}` }}>
                              {isFcast ? "Projected" : "Historical"}
                            </span>
                            {isExpanded
                              ? <ChevronDown size={16} color="var(--accent-primary)" />
                              : <ChevronRight size={16} color="var(--text-muted)" />}
                          </button>

                          {/* Drill-down panel */}
                          <AnimatePresence>
                            {isExpanded && (
                              <MonthDrilldown
                                month={row.month}
                                predictedCount={value}
                                windowMonths={windowSize}
                                selectedDeptId={selectedDeptId}
                                isHOD={isHOD}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* ── Month Detail trace ────────────────────────────────── */}
              {activeTab === "trace" && (
                <>
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>Month-by-Month Breakdown</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Actual vs rolling average with trend signal for each month.
                    </p>
                  </div>
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 0.7fr 0.8fr 0.7fr 0.9fr", gap: "8px", padding: "8px 12px", background: "var(--bg-elevated)", borderRadius: "8px", marginBottom: "4px", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                      <span>MONTH</span><span>ACTUAL</span><span>ROLLING AVG</span><span>DEVIATION</span><span>TREND</span>
                    </div>
                    {forecast.trace.map((row, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        style={{ display: "grid", gridTemplateColumns: "1fr 0.7fr 0.8fr 0.7fr 0.9fr", gap: "8px", padding: "10px 12px", borderBottom: i < forecast.trace.length - 1 ? "1px solid var(--border-default)" : undefined, fontSize: "12px", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{row.month}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{row.actual}</span>
                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-tertiary)" }}>{row.movingAverage?.toFixed(1) ?? "—"}</span>
                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{row.deviation != null ? (row.deviation > 0 ? "+" : "") + row.deviation.toFixed(1) : "—"}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: trendColor(row.trendSignal) }}>{row.trendSignal || "—"}</span>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Key Findings ──────────────────────────────────────── */}
              {activeTab === "insights" && forecast.insights && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>Key Findings</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Summary of what the forecast suggests for leave planning.</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                    {[
                      { label: "Busiest Month", value: forecast.insights.peakMonth, color: "var(--status-rejected)", desc: "Highest predicted demand" },
                      { label: "Peak Requests", value: forecast.insights.peakValue != null ? `~${Math.round(forecast.insights.peakValue)}` : "—", color: "var(--accent-primary)", desc: "Expected leave requests" },
                      { label: "Risk Area", value: (forecast.insights as any).riskDepartment || scopeLabel, color: "var(--accent-tertiary)", desc: "Needs most attention" },
                    ].map((item) => (
                      <div key={item.label} style={{ padding: "16px", background: "var(--bg-elevated)", borderRadius: "12px", border: `1px solid ${item.color}25` }}>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>{item.label}</div>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: item.color, marginBottom: "4px" }}>{item.value || "—"}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                  {(forecast.insights as any).safeWindows?.length > 0 && (
                    <div style={{ padding: "14px 16px", background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.25)", borderRadius: "10px" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>Good Times to Approve Leave (Lower Demand)</div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {(forecast.insights as any).safeWindows.map((w: string) => (
                          <span key={w} style={{ fontSize: "12px", fontWeight: 700, color: "var(--status-approved)", background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.3)", borderRadius: "999px", padding: "4px 12px" }}>{w}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {((forecast.insights as any).aiCommentary || (forecast.insights as any).insightExplanation) && (
                    <div style={{ padding: "16px", background: "var(--bg-elevated)", borderRadius: "10px", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>Planning Notes</div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                        {(forecast.insights as any).aiCommentary || (forecast.insights as any).insightExplanation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {!forecast && !loading && (
        <Card>
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <TrendingUp size={40} style={{ marginBottom: "12px", opacity: 0.35 }} />
            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>No forecast generated yet</div>
            <div style={{ fontSize: "13px" }}>
              {isHOD ? "Set your parameters and click Generate." : "Select a department, set parameters, and click Generate."}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

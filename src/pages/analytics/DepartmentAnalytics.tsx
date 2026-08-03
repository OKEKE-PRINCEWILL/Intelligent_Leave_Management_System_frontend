import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Building2, ChevronRight, ArrowLeft, Search, ChevronLeft, TrendingUp } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { analyticsApi } from "../../api/analytics.api"
import { useAuthStore } from "../../store/auth.store"
import type { DepartmentAnalytics } from "../../types/api.types"

const tooltipStyle = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border-default)",
  borderRadius: "8px",
  fontSize: "12px",
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      flex: 1,
      padding: "12px 14px",
      background: `${color}08`,
      border: `1px solid ${color}25`,
      borderRadius: "10px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "22px", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{label}</div>
    </div>
  )
}

function DepartmentDetail({ dept, onBack }: { dept: DepartmentAnalytics; onBack?: () => void }) {
  const { data: monthly, isLoading } = useQuery({
    queryKey: ["monthly-analytics", dept.departmentId],
    queryFn: () => analyticsApi.getMonthly({ departmentId: dept.departmentId, months: 6 }),
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "13px",
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            background: "var(--accent-primary-bg)",
            border: "1px solid var(--border-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Building2 size={16} color="var(--accent-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", margin: 0 }}>{dept.departmentName}</h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
              {dept.totalStaff} staff · {dept.currentOnLeave} currently on leave
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "10px" }}>
        <StatPill label="Total Requests" value={dept.totalRequests} color="var(--accent-primary)" />
        <StatPill label="Approved" value={dept.approvedCount} color="var(--status-approved)" />
        <StatPill label="Pending" value={dept.pendingCount} color="var(--status-pending)" />
        <StatPill label="Rejected" value={dept.rejectedCount ?? 0} color="var(--status-rejected)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        {[
          { title: "Currently On Leave", rows: dept.currentLeaves, empty: "No employees are currently on approved leave." },
          { title: "Upcoming Approved Leave", rows: dept.upcomingLeaves, empty: "No upcoming approved leave is scheduled." },
        ].map((section) => (
          <Card key={section.title}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>{section.title}</h3>
            {section.rows.length === 0 ? (
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{section.empty}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {section.rows.map((leave) => (
                  <div key={leave.leaveRequestId} style={{ padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{leave.employeeName}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                      {leave.leaveType} · {leave.startDate} → {leave.endDate} · {leave.workingDays} working day(s)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Monthly trend */}
      <Card>
        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "16px" }}>
          Monthly Leave Trend — Last 6 Months
        </h3>
        {isLoading ? (
          <SkeletonCard rows={3} />
        ) : monthly && monthly.length > 0 && monthly.some((m) => m.total > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="deptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5A2B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8B5A2B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="total" name="Requests" stroke="var(--accent-primary)" strokeWidth={2} fill="url(#deptGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
            <TrendingUp size={28} style={{ marginBottom: "8px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: "13px" }}>No leave history recorded for this department yet.</p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

export function DepartmentAnalytics() {
  const [selected, setSelected] = useState<DepartmentAnalytics | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const { user } = useAuthStore()
  const isHOD = user?.role === "HOD"
  const pageSize = 8

  const { data: deptData, isLoading } = useQuery({
    queryKey: ["dept-analytics"],
    queryFn: analyticsApi.getByDepartment,
  })

  React.useEffect(() => {
    setPage(0)
  }, [search])

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Department Analytics</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Click any department to view its details and leave trend.</p>
        </div>
        <SkeletonCard rows={5} />
      </div>
    )
  }

  const filteredDepartments = (deptData || []).filter((dept) => {
    const q = search.toLowerCase()
    return !q
      || dept.departmentName?.toLowerCase().includes(q)
      || String(dept.totalStaff ?? "").includes(q)
      || String(dept.currentOnLeave ?? "").includes(q)
  })
  const pageCount = Math.max(1, Math.ceil(filteredDepartments.length / pageSize))
  const pagedDepartments = filteredDepartments.slice(page * pageSize, page * pageSize + pageSize)
  const hodDepartment = isHOD ? filteredDepartments[0] : null

  if (isHOD) {
    return hodDepartment ? (
      <DepartmentDetail dept={hodDepartment} />
    ) : (
      <Card>
        <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
          <Building2 size={36} style={{ marginBottom: "12px", opacity: 0.4 }} />
          <p style={{ margin: 0 }}>No department data available yet.</p>
        </div>
      </Card>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <AnimatePresence mode="wait">
        {selected ? (
          <DepartmentDetail key="detail" dept={selected} onBack={() => setSelected(null)} />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div>
              <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Department Analytics</h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Click any department to view its leave requests and monthly trend.
              </p>
            </div>

            <Card>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by department, staff count, or on-leave count..."
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "10px", padding: "10px 12px 10px 36px", fontSize: "13px", color: "var(--text-primary)", outline: "none" }}
                />
              </div>
            </Card>

            {filteredDepartments.length === 0 ? (
              <Card>
                <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                  <Building2 size={36} style={{ marginBottom: "12px", opacity: 0.4 }} />
                  <p style={{ margin: 0 }}>No department data available yet.</p>
                </div>
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {pagedDepartments.map((dept, i) => {
                  const approvalRate = dept.totalRequests > 0
                    ? Math.round((dept.approvedCount / dept.totalRequests) * 100)
                    : 0
                  const rateColor = approvalRate >= 70 ? "var(--status-approved)" : approvalRate >= 40 ? "var(--status-pending)" : "var(--status-rejected)"

                  return (
                    <motion.div
                      key={dept.departmentId ?? i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <button
                        onClick={() => setSelected(dept)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "12px",
                          padding: "16px 20px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          transition: "border-color 0.15s, box-shadow 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--border-accent)"
                          e.currentTarget.style.boxShadow = "0 2px 12px rgba(139,90,43,0.08)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--border-default)"
                          e.currentTarget.style.boxShadow = "none"
                        }}
                      >
                        {/* Icon */}
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                          background: "var(--accent-primary-bg)", border: "1px solid var(--border-accent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Building2 size={17} color="var(--accent-primary)" />
                        </div>

                        {/* Name + staff */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: "2px" }}>
                            {dept.departmentName}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {dept.totalStaff} staff &middot; {dept.currentOnLeave} on leave
                          </div>
                        </div>

                        {/* Mini stats */}
                        <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-primary)" }}>{dept.totalRequests}</div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Total</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--status-approved)" }}>{dept.approvedCount}</div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Approved</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "16px", fontWeight: 700, color: rateColor }}>{approvalRate}%</div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Rate</div>
                          </div>
                        </div>

                        <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      </button>
                    </motion.div>
                  )
                })}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>Page {page + 1} of {pageCount} - {filteredDepartments.length} department{filteredDepartments.length === 1 ? "" : "s"}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 10px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-secondary)", opacity: page === 0 ? 0.45 : 1, cursor: page === 0 ? "not-allowed" : "pointer" }}
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <button
                      disabled={page >= pageCount - 1}
                      onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 10px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-secondary)", opacity: page >= pageCount - 1 ? 0.45 : 1, cursor: page >= pageCount - 1 ? "not-allowed" : "pointer" }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

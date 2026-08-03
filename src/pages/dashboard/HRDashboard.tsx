import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Users, AlertTriangle, CheckSquare, BarChart2, TrendingUp } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { dashboardApi } from "../../api/dashboard.api"
import { analyticsApi } from "../../api/analytics.api"
import { anomalyApi } from "../../api/anomaly.api"
import { useCountUp } from "../../hooks/useCountUp"

function KpiCard({
  label, value, sub, icon, color, urgent, to,
}: {
  label: string; value: number | string; sub?: string; icon: React.ReactNode; color: string; urgent?: boolean; to?: string
}) {
  const num = typeof value === "number" ? value : 0
  const displayed = useCountUp(num)
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: urgent ? `${color}08` : "var(--bg-surface)",
        border: `1px solid ${urgent ? color + "40" : "var(--border-default)"}`,
        borderRadius: "14px",
        padding: "18px",
        boxShadow: "var(--shadow-card)",
        cursor: to ? "pointer" : undefined,
        transition: "box-shadow 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color }}>
            {typeof value === "number" ? displayed : value}
          </div>
          {sub && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{sub}</div>}
        </div>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
  return to ? <Link to={to} style={{ textDecoration: "none" }}>{content}</Link> : content
}

export function HRDashboard() {
  const { data: summary } = useQuery({ queryKey: ["dashboard-summary"], queryFn: dashboardApi.getSummary, refetchInterval: 30_000 })
  const { data: deptStats, isLoading: deptLoading } = useQuery({ queryKey: ["dept-analytics"], queryFn: analyticsApi.getByDepartment })
  const { data: flags } = useQuery({ queryKey: ["anomaly-flags"], queryFn: anomalyApi.getFlags })

  const highFlags = flags?.filter((f) => f.riskLevel === "HIGH" && f.status === "ACTIVE") || []
  const approvalPct = Math.round(summary?.approvalRate || 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Alert banner for urgent flags */}
      {highFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "12px 20px",
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.25)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--status-rejected)", fontWeight: 600, fontSize: "14px" }}>
            <AlertTriangle size={18} />
            {highFlags.length} leave request{highFlags.length > 1 ? "s" : ""} flagged as high risk — review needed
          </div>
          <Link to="/anomaly/scan"><Button size="sm" variant="danger">Review Now</Button></Link>
        </motion.div>
      )}

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px" }}>
        <KpiCard
          label="Total Employees"
          value={summary?.totalEmployees || 0}
          icon={<Users size={18} />}
          color="var(--accent-primary)"
          to="/admin/employees"
        />
        <KpiCard
          label="Active Leave"
          value={summary?.activeLeaveRequests || 0}
          sub="currently away"
          icon={<CheckSquare size={18} />}
          color="var(--accent-tertiary)"
        />
        <KpiCard
          label="Awaiting Approval"
          value={summary?.pendingApprovals || 0}
          sub="need your action"
          icon={<CheckSquare size={18} />}
          color="var(--status-pending)"
          urgent={(summary?.pendingApprovals || 0) > 5}
          to="/approvals/hr-pending"
        />
        <KpiCard
          label="Risk Flags"
          value={highFlags.length}
          sub="high-risk open"
          icon={<AlertTriangle size={18} />}
          color="var(--status-rejected)"
          urgent={highFlags.length > 0}
          to="/anomaly/scan"
        />
        <KpiCard
          label="Approval Rate"
          value={`${approvalPct}%`}
          sub="of all requests"
          icon={<TrendingUp size={18} />}
          color="var(--status-approved)"
        />
      </div>

      {/* Department staffing overview */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Department Staffing Overview
          </h3>
          <Link to="/analytics/departments"><Button size="sm" variant="ghost" icon={<BarChart2 size={13} />}>Full Report</Button></Link>
        </div>
        {deptLoading ? (
          <SkeletonCard rows={4} />
        ) : (deptStats || []).length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px", padding: "12px 0" }}>No department data yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(deptStats || []).slice(0, 6).map((d) => {
              const ratio = d.staffingRatio ?? 0
              const available = d.totalStaff - (d.currentOnLeave ?? 0)
              const pct = Math.round(ratio * 100)
              const color = pct < 50 ? "var(--status-rejected)" : pct < 70 ? "var(--status-pending)" : "var(--status-approved)"
              return (
                <div key={d.departmentId ?? d.departmentName}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                    <span style={{ fontWeight: 500 }}>{d.departmentName}</span>
                    <span style={{ color, fontWeight: 600, fontSize: "12px" }}>
                      {available}/{d.totalStaff} available
                    </span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      style={{ height: "100%", background: color, borderRadius: "3px" }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

    </div>
  )
}

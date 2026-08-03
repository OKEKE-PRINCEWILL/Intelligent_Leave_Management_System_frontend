import React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"
import { CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { analyticsApi } from "../../api/analytics.api"
import { useCountUp } from "../../hooks/useCountUp"

const tooltipStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: "8px",
  color: "var(--text-primary)",
  fontSize: "12px",
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const displayed = useCountUp(value, 1200)
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.5px" }}>{label}</div>
          <div style={{ fontSize: "32px", fontWeight: 700, fontFamily: "var(--font-display)", color }}>{displayed}</div>
        </div>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

export function ApprovalRateStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["approval-rate-stats"],
    queryFn: analyticsApi.getApprovalRate,
  })

  const pieData = stats ? [
    { name: "Approved", value: stats.approved, color: "#10B981" },
    { name: "Rejected", value: stats.rejected, color: "#EF4444" },
    { name: "Pending", value: stats.pending, color: "#F59E0B" },
    { name: "Returned", value: stats.returned ?? 0, color: "#6366F1" },
  ].filter((d) => d.value > 0) : []

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Approval Rate Statistics</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>System-wide approval performance and decision breakdown.</p>
      </div>

      {isLoading ? (
        <SkeletonCard rows={4} />
      ) : stats ? (
        <>
          {/* KPI grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <StatCard label="TOTAL REQUESTS" value={stats.total ?? stats.totalRequests} icon={<TrendingUp size={16} color="var(--accent-primary)" />} color="var(--accent-primary)" />
            <StatCard label="APPROVED" value={stats.approved} icon={<CheckCircle size={16} color="var(--status-approved)" />} color="var(--status-approved)" />
            <StatCard label="REJECTED" value={stats.rejected} icon={<XCircle size={16} color="var(--status-rejected)" />} color="var(--status-rejected)" />
            <StatCard label="PENDING" value={stats.pending} icon={<Clock size={16} color="var(--accent-tertiary)" />} color="var(--accent-tertiary)" />
          </div>

          {/* Approval rate gauge card */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "16px" }}>OVERALL APPROVAL RATE</h3>
                <div style={{ fontSize: "56px", fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--status-approved)", lineHeight: 1 }}>
                  {stats.approvalRate?.toFixed(1) ?? "—"}%
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>
                  {stats.approved} approved out of {stats.total} total requests
                </div>
                <div style={{ marginTop: "16px", width: "100%", height: "8px", background: "var(--bg-elevated)", borderRadius: "4px" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.approvalRate ?? 0}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ height: "100%", background: "linear-gradient(90deg, var(--status-approved), var(--accent-primary))", borderRadius: "4px" }}
                  />
                </div>
              </div>

              {/* Pie chart */}
              <div style={{ width: "200px", flexShrink: 0 }}>
                {pieData.length > 0 && (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-default)" }}>
              {pieData.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: d.color }} />
                  <span style={{ color: "var(--text-muted)" }}>{d.name}</span>
                  <span style={{ fontWeight: 600, color: d.color }}>{d.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* By leave type if available */}
          {stats.byLeaveType && stats.byLeaveType.length > 0 && (
            <Card>
              <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "16px" }}>
                APPROVAL RATE BY LEAVE TYPE
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.byLeaveType.map((t) => ({ name: t.leaveType, rate: t.approvalRate, total: t.total }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Approval Rate"]} />
                  <Bar dataKey="rate" name="Approval Rate" radius={[4, 4, 0, 0]}>
                    {stats.byLeaveType.map((_, i) => (
                      <Cell key={i} fill={`hsl(${160 + i * 30}, 70%, 50%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* HOD vs HR breakdown */}
          {stats.hodApprovalRate !== undefined && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "HOD Approval Rate", value: stats.hodApprovalRate, color: "var(--accent-primary)" },
                { label: "HR Final Approval Rate", value: stats.hrApprovalRate, color: "var(--accent-secondary)" },
              ].map((item) => (
                <Card key={item.label}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>{item.label}</div>
                  <div style={{ fontSize: "36px", fontWeight: 700, fontFamily: "var(--font-display)", color: item.color, marginBottom: "10px" }}>
                    {item.value?.toFixed(1)}%
                  </div>
                  <div style={{ width: "100%", height: "5px", background: "var(--bg-elevated)", borderRadius: "3px" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value ?? 0}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ height: "100%", background: item.color, borderRadius: "3px" }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card>
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <TrendingUp size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <div>No approval rate data available.</div>
          </div>
        </Card>
      )}
    </div>
  )
}

import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Users, CheckSquare, Calendar } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { StatusBadge } from "../../components/ui/StatusBadge"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { approvalsApi } from "../../api/approvals.api"
import { analyticsApi } from "../../api/analytics.api"
import { useAuthStore } from "../../store/auth.store"

export function HODDashboard() {
  const { user } = useAuthStore()
  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ["approvals-department"],
    queryFn: approvalsApi.getPendingDepartment,
    refetchInterval: 30_000,
  })
  const { data: deptStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dept-analytics"],
    queryFn: analyticsApi.getByDepartment,
  })
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["dept-employees"],
    queryFn: approvalsApi.getDepartmentEmployees,
  })

  const myDept = deptStats?.find((d) => d.departmentName === user?.departmentName)
  const availableStaff = myDept
    ? myDept.totalStaff - myDept.currentOnLeave
    : null
  const isUnderstaffed = myDept && myDept.staffingRatio < 0.5

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>
          HOD Dashboard — {user?.departmentName}
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Manage your team's leave requests and monitor department coverage.
        </p>
      </motion.div>

      {/* Team Coverage Panel */}
      <Card glow={!!isUnderstaffed}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={15} />
            TEAM COVERAGE
          </h3>
          {myDept && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: isUnderstaffed ? "var(--status-rejected)" : "var(--status-approved)",
                background: isUnderstaffed ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                border: `1px solid ${isUnderstaffed ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
                padding: "4px 10px",
                borderRadius: "999px",
              }}
            >
              {isUnderstaffed ? "⚠ Understaffed" : "✓ Staffing Healthy"}
            </span>
          )}
        </div>

        {statsLoading ? (
          <SkeletonCard rows={2} />
        ) : myDept ? (
          <div>
            <div style={{ display: "flex", gap: "24px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[
                { label: "Total Staff", value: myDept.totalStaff, color: "var(--text-primary)" },
                { label: "On Leave", value: myDept.currentOnLeave, color: "var(--status-pending)" },
                { label: "Available", value: availableStaff || 0, color: "var(--status-approved)" },
                { label: "Pending Requests", value: myDept.pendingCount, color: "var(--accent-primary)" },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: 700, fontFamily: "var(--font-display)", color: item.color }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.label}</div>
                </div>
              ))}
            </div>
            {/* Staffing bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                <span>Staffing Ratio</span>
                <span>{Math.round((myDept.staffingRatio || 0) * 100)}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(myDept.staffingRatio || 0) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: isUnderstaffed
                      ? "var(--status-rejected)"
                      : myDept.staffingRatio < 0.7
                      ? "var(--accent-tertiary)"
                      : "var(--status-approved)",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No department data available.</p>
        )}
      </Card>

      {myDept && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {[
            { title: "CURRENTLY ON APPROVED LEAVE", rows: myDept.currentLeaves, empty: "No employee is currently on leave." },
            { title: "UPCOMING APPROVED LEAVE", rows: myDept.upcomingLeaves, empty: "No upcoming approved leave." },
          ].map((section) => (
            <Card key={section.title}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px" }}>{section.title}</h3>
              {section.rows.length === 0 ? (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{section.empty}</p>
              ) : section.rows.slice(0, 5).map((leave) => (
                <div key={leave.leaveRequestId} style={{ padding: "9px 0", borderBottom: "1px solid var(--border-default)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{leave.employeeName}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                    {leave.leaveType} · {leave.startDate} → {leave.endDate}
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={15} />
          TEAM COVERAGE TABLE
        </h3>
        {employeesLoading ? (
          <SkeletonCard rows={5} />
        ) : !employees || employees.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No staff found in your department.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px", fontSize: "13px" }}>
              <thead>
                <tr style={{ color: "var(--text-muted)", textAlign: "left", borderBottom: "1px solid var(--border-default)" }}>
                  <th style={{ padding: "10px" }}>Staff</th>
                  <th style={{ padding: "10px" }}>Role</th>
                  <th style={{ padding: "10px" }}>Status</th>
                  <th style={{ padding: "10px" }}>Leave Period</th>
                  <th style={{ padding: "10px" }}>Duration Left</th>
                  <th style={{ padding: "10px" }}>Pending</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const onLeave = !!emp.currentLeaveType
                  const upcoming = !onLeave && !!emp.upcomingLeaveType
                  return (
                    <tr key={emp.employeeId} style={{ borderBottom: "1px solid var(--border-default)" }}>
                      <td style={{ padding: "12px 10px", fontWeight: 600 }}>{emp.fullName}<div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>{emp.staffId}</div></td>
                      <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>{emp.roleTitle || "Staff"}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ color: onLeave ? "var(--accent-tertiary)" : upcoming ? "var(--status-pending)" : "var(--status-approved)", fontWeight: 700 }}>
                          {onLeave ? `On ${emp.currentLeaveType}` : upcoming ? `Upcoming ${emp.upcomingLeaveType}` : "In Office"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>
                        {onLeave
                          ? `${emp.currentLeaveStartDate} -> ${emp.currentLeaveEndDate}`
                          : upcoming
                          ? `${emp.upcomingLeaveStartDate} -> ${emp.upcomingLeaveEndDate}`
                          : "-"}
                      </td>
                      <td style={{ padding: "12px 10px", fontWeight: 700 }}>
                        {onLeave
                          ? `${Math.max(emp.currentLeaveDaysRemaining || 0, 0)} day(s)`
                          : upcoming
                          ? `${emp.upcomingLeaveWorkingDays || 0} working day(s)`
                          : "-"}
                      </td>
                      <td style={{ padding: "12px 10px" }}>{emp.pendingRequests}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Leave calendar moved to Analytics → Leave Overview (interactive) */}

      {/* Pending Approvals */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckSquare size={15} />
            PENDING APPROVALS
            {pending && pending.length > 0 && (
              <span style={{
                background: "var(--status-rejected)",
                color: "#fff",
                borderRadius: "999px",
                padding: "1px 7px",
                fontSize: "11px",
                fontWeight: 700,
              }}>
                {pending.length}
              </span>
            )}
          </h3>
          <Link to="/approvals/pending">
            <Button size="sm" variant="ghost">View All</Button>
          </Link>
        </div>

        {pendingLoading ? (
          <SkeletonCard rows={3} />
        ) : !pending || pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)", fontSize: "13px" }}>
            <CheckSquare size={32} style={{ marginBottom: "8px", opacity: 0.4 }} />
            <div>You're all caught up ✓</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {pending.slice(0, 4).map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "10px",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {req.employeeName?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {req.employeeName}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {req.leaveType} · {req.startDate} → {req.endDate} · {req.workingDays}d
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <StatusBadge status={req.status} />
                  <Link to={`/approvals/${req.id}`}>
                    <Button size="sm" variant="primary">Review</Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px" }}>
          QUICK ACTIONS
        </h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/approvals/pending"><Button variant="primary" icon={<CheckSquare size={15} />}>Review Approvals</Button></Link>
          <Link to="/approvals/team"><Button variant="ghost" icon={<Users size={15} />}>Team Coverage</Button></Link>
          <Link to="/analytics/departments"><Button variant="ghost" icon={<Calendar size={15} />}>Analytics</Button></Link>
        </div>
      </Card>
    </div>
  )
}

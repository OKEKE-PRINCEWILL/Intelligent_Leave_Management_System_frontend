import React from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { approvalsApi } from "../../api/approvals.api"
import { analyticsApi } from "../../api/analytics.api"
import { useAuthStore } from "../../store/auth.store"

export function TeamLeaveInsights() {
  const { user } = useAuthStore()
  const [search, setSearch] = React.useState("")
  const [departmentFilter, setDepartmentFilter] = React.useState("")
  const [page, setPage] = React.useState(0)
  const pageSize = 8
  const isAuditor = user?.role === "AUDITOR"
  const { data: employees, isLoading } = useQuery({
    queryKey: ["team-coverage", user?.role],
    queryFn: isAuditor ? approvalsApi.getAllDepartmentCoverage : approvalsApi.getDepartmentEmployees,
  })
  const { data: deptStats } = useQuery({
    queryKey: ["dept-analytics"],
    queryFn: analyticsApi.getByDepartment,
  })

  const departments = Array.from(new Set((employees || []).map((emp) => emp.department).filter(Boolean))).sort()
  const visibleEmployees = (employees || []).filter((emp) => {
    const q = search.toLowerCase()
    const matchDepartment = !departmentFilter || emp.department === departmentFilter
    const matchSearch = !q
      || emp.fullName?.toLowerCase().includes(q)
      || emp.staffId?.toLowerCase().includes(q)
      || emp.department?.toLowerCase().includes(q)
      || emp.roleTitle?.toLowerCase().includes(q)
      || emp.currentLeaveType?.toLowerCase().includes(q)
    return matchDepartment && matchSearch
  })
  const pageCount = Math.max(1, Math.ceil(visibleEmployees.length / pageSize))
  const pagedEmployees = visibleEmployees.slice(page * pageSize, page * pageSize + pageSize)
  const selectedDeptName = departmentFilter || user?.departmentName
  const myDept = deptStats?.find((d) => d.departmentName === selectedDeptName)

  React.useEffect(() => {
    setPage(0)
  }, [departmentFilter, search])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Team Leave Insights</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {isAuditor ? "Department-wide coverage across all departments." : "Department coverage and team leave overview."}
        </p>
      </div>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, staff ID, department, role, or leave type..."
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px 10px 36px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
            />
          </div>
          {isAuditor && (
            <>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>DEPARTMENT</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
                minWidth: "220px",
              }}
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
            </>
          )}
        </div>
      </Card>

      {myDept && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
          {[
            { label: "Total Staff", value: myDept.totalStaff, color: "var(--accent-primary)" },
            { label: "Currently On Leave", value: myDept.currentOnLeave, color: "var(--accent-tertiary)" },
            { label: "Available", value: myDept.totalStaff - myDept.currentOnLeave, color: "var(--status-approved)" },
            { label: "Pending", value: myDept.pendingCount, color: "var(--status-pending)" },
          ].map((item) => (
            <Card key={item.label}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>{item.label}</div>
              <div style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-display)", color: item.color }}>
                {item.value}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={15} />
          TEAM MEMBERS
        </h3>
        {isLoading ? (
          <SkeletonCard rows={5} />
        ) : !employees || employees.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px" }}>
            No team members found.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px", fontSize: "13px" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-muted)", borderBottom: "1px solid var(--border-default)" }}>
                  <th style={{ padding: "10px" }}>Staff</th>
                  <th style={{ padding: "10px" }}>Role</th>
                  <th style={{ padding: "10px" }}>Coverage Status</th>
                  <th style={{ padding: "10px" }}>Leave Period</th>
                  <th style={{ padding: "10px" }}>Duration Left</th>
                  <th style={{ padding: "10px" }}>Requests</th>
                </tr>
              </thead>
              <tbody>
                {pagedEmployees.map((emp, i) => (
                  <motion.tr
                    key={emp.employeeId}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: "1px solid var(--border-default)" }}
                  >
                    <td style={{ padding: "12px 10px", fontWeight: 600 }}>
                      {emp.fullName}
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>{emp.staffId} {isAuditor ? `- ${emp.department}` : ""}</div>
                    </td>
                    <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>{emp.roleTitle || "Staff"}</td>
                    <td style={{ padding: "12px 10px", color: emp.currentLeaveType ? "var(--accent-tertiary)" : emp.upcomingLeaveType ? "var(--status-pending)" : "var(--status-approved)", fontWeight: 700 }}>
                      {emp.currentLeaveType ? `On ${emp.currentLeaveType}` : emp.upcomingLeaveType ? `Upcoming ${emp.upcomingLeaveType}` : "In Office"}
                    </td>
                    <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>
                      {emp.currentLeaveType
                        ? `${emp.currentLeaveStartDate} -> ${emp.currentLeaveEndDate}`
                        : emp.upcomingLeaveType
                        ? `${emp.upcomingLeaveStartDate} -> ${emp.upcomingLeaveEndDate}`
                        : "-"}
                    </td>
                    <td style={{ padding: "12px 10px", fontWeight: 700 }}>
                      {emp.currentLeaveType
                        ? `${Math.max(emp.currentLeaveDaysRemaining || 0, 0)} day(s)`
                        : emp.upcomingLeaveType
                        ? `${emp.upcomingLeaveWorkingDays || 0} working day(s)`
                        : "-"}
                    </td>
                    <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>
                      {emp.pendingRequests} pending / {emp.approvedRequests} approved
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", fontSize: "12px", color: "var(--text-muted)" }}>
              <span>Page {page + 1} of {pageCount} - {visibleEmployees.length} staff</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button size="sm" variant="ghost" icon={<ChevronLeft size={14} />} disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
                <Button size="sm" variant="ghost" icon={<ChevronRight size={14} />} disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>Next</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { CheckSquare, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { StatusBadge } from "../../components/ui/StatusBadge"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { approvalsApi } from "../../api/approvals.api"

export function HRPendingApprovals() {
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [page, setPage] = useState(0)
  const pageSize = 8
  const { data: pending, isLoading } = useQuery({
    queryKey: ["approvals-hr"],
    queryFn: approvalsApi.getPendingHR,
    refetchInterval: 30_000,
  })

  const getDepartment = (req: typeof pending extends Array<infer T> ? T : any) =>
    req.departmentName || (req as unknown as { department?: string }).department || ""
  const getStaffId = (req: typeof pending extends Array<infer T> ? T : any) =>
    (req as unknown as { employeeStaffId?: string }).employeeStaffId || ""
  const departments = Array.from(new Set((pending || []).map((req) => getDepartment(req)).filter(Boolean))).sort()
  const filtered = (pending || []).filter((req) => {
    const q = search.toLowerCase()
    const department = getDepartment(req)
    const staffId = getStaffId(req)
    const matchDepartment = !departmentFilter || department === departmentFilter
    const matchSearch = !q
      || req.employeeName?.toLowerCase().includes(q)
      || staffId.toLowerCase().includes(q)
      || req.leaveType?.toLowerCase().includes(q)
      || req.reference?.toLowerCase().includes(q)
      || department.toLowerCase().includes(q)
    return matchDepartment && matchSearch
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize)

  useEffect(() => {
    setPage(0)
  }, [search, departmentFilter])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>HR Pending Approvals</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          HOD-approved requests awaiting final HR review.
        </p>
      </div>
      <Card>
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee, department, staff ID, or leave type..."
              style={{ width: "100%", boxSizing: "border-box", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "10px", padding: "10px 12px 10px 36px", fontSize: "13px", color: "var(--text-primary)", outline: "none" }}
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ padding: "10px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "10px", color: departmentFilter ? "var(--text-primary)" : "var(--text-muted)", fontSize: "13px", outline: "none", minWidth: "190px" }}
          >
            <option value="">All Departments</option>
            {departments.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
        </div>
        {isLoading ? (
          <SkeletonCard rows={5} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <CheckSquare size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <div style={{ fontSize: "14px", fontWeight: 600 }}>You're all caught up ✓</div>
            <div style={{ fontSize: "13px", marginTop: "6px" }}>No pending requests require HR review.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {paged.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--status-hod), var(--accent-secondary))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {req.employeeName?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{req.employeeName}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {req.departmentName} · {req.leaveType} · {req.startDate} → {req.endDate} · {req.workingDays}d
                  </div>
                  {req.hodComment && (
                    <div style={{ fontSize: "11px", color: "var(--status-hod)", marginTop: "4px" }}>
                      HOD: "{req.hodComment}"
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <StatusBadge status={req.status} />
                  <Link to={`/approvals/${req.id}`}>
                    <Button size="sm" variant="primary">Final Review</Button>
                  </Link>
                </div>
              </motion.div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--text-muted)" }}>
              <span>Page {page + 1} of {pageCount} - {filtered.length} request{filtered.length === 1 ? "" : "s"}</span>
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

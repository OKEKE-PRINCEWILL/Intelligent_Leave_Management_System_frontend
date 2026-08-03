import React, { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Search, Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { StatusBadge } from "../../components/ui/StatusBadge"
import { SkeletonTable } from "../../components/ui/Skeleton"
import { leaveApi } from "../../api/leave.api"
import type { LeaveStatus } from "../../types/api.types"

const STATUS_FILTERS: { label: string; value: LeaveStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "HOD Approved", value: "HOD_APPROVED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Returned", value: "RETURNED" },
]

export function LeaveHistory() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("ALL")
  const [page, setPage] = useState(0)
  const pageSize = 8

  const { data: history, isLoading } = useQuery({
    queryKey: ["leave-history"],
    queryFn: leaveApi.getHistory,
  })

  const filtered = (history || []).filter((item) => {
    const matchStatus = statusFilter === "ALL" || item.status === statusFilter
    const matchSearch =
      !search ||
      item.reference?.toLowerCase().includes(search.toLowerCase()) ||
      item.leaveType?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize)

  React.useEffect(() => {
    setPage(0)
  }, [search, statusFilter])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Leave History</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            All your leave applications and their current status.
          </p>
        </div>
        <Link to="/leave/apply">
          <Button variant="primary" icon={<Plus size={15} />}>Apply Leave</Button>
        </Link>
      </div>

      <Card>
        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference or type..."
              style={{
                width: "100%",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "10px",
                padding: "9px 12px 9px 36px",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: `1px solid ${statusFilter === f.value ? "var(--border-accent)" : "var(--border-default)"}`,
                  background: statusFilter === f.value ? "rgba(139,90,43,0.1)" : "transparent",
                  color: statusFilter === f.value ? "var(--accent-primary)" : "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: statusFilter === f.value ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Calendar size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <div style={{ fontSize: "14px", fontWeight: 600 }}>Your leave journey begins here</div>
            <div style={{ fontSize: "13px", marginTop: "6px" }}>No leave applications found.</div>
            <Link to="/leave/apply" style={{ display: "inline-block", marginTop: "16px" }}>
              <Button variant="primary">Apply for Leave</Button>
            </Link>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1.5fr 0.6fr 0.8fr 0.5fr",
                gap: "8px",
                padding: "8px 12px",
                background: "var(--bg-elevated)",
                borderRadius: "8px",
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: "4px",
                letterSpacing: "0.8px",
              }}
            >
              <span>REFERENCE</span><span>TYPE</span><span>DATES</span>
              <span>DAYS</span><span>STATUS</span><span></span>
            </div>
            {paged.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1.5fr 0.6fr 0.8fr 0.5fr",
                  gap: "8px",
                  padding: "11px 12px",
                  alignItems: "center",
                  borderRadius: "8px",
                  borderBottom: i < paged.length - 1 ? "1px solid var(--border-default)" : undefined,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent-primary)" }}>
                  {item.reference}
                </span>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.leaveType}</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {item.startDate} → {item.endDate}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>{item.workingDays}d</span>
                <StatusBadge status={item.status} />
                <Link to={`/leave/${item.id}`}>
                  <Button size="sm" variant="ghost">View</Button>
                </Link>
              </motion.div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", fontSize: "12px", color: "var(--text-muted)" }}>
              <span>Page {page + 1} of {pageCount} - {filtered.length} leave request{filtered.length === 1 ? "" : "s"}</span>
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

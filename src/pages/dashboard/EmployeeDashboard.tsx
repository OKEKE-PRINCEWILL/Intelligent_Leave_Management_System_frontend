import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { FileText, Zap, AlertTriangle, Calendar, TimerReset } from "lucide-react"
import { format, parseISO } from "date-fns"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { StatusBadge } from "../../components/ui/StatusBadge"
import { LeaveBalanceCard } from "../../components/leave/LeaveBalanceCard"
import { LeaveProgressTracker } from "../../components/leave/LeaveProgressTracker"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { leaveApi } from "../../api/leave.api"
import { useAuthStore } from "../../store/auth.store"
import type { LeaveRequest } from "../../types/api.types"

function ActiveLeaveCountdown({ leave }: { leave: LeaveRequest }) {
  const today = new Date()
  const end = parseISO(leave.endDate)
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86_400_000))
  const startLabel = format(parseISO(leave.startDate), "d MMM yyyy")
  const endLabel = format(end, "d MMM yyyy")

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "8px",
        padding: "18px 20px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <TimerReset size={14} />
            CURRENTLY ON LEAVE
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
            {leave.leaveType}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            {startLabel} to {endLabel} · {leave.reference}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "32px", fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--accent-primary)" }}>
            {daysRemaining}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>
            {daysRemaining === 1 ? "DAY LEFT" : "DAYS LEFT"}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function EmployeeDashboard() {
  const { user } = useAuthStore()
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["leave-history"],
    queryFn: leaveApi.getHistory,
  })
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ["leave-balance"],
    queryFn: leaveApi.getBalance,
  })

  const recentLeaves = history?.slice(0, 5) || []
  const latestPending = history?.find((h) => h.status === "PENDING" || h.status === "HOD_APPROVED")
  const currentLeave = history?.find((h) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = parseISO(h.startDate)
    const end = parseISO(h.endDate)
    return h.status === "APPROVED" && start <= today && end >= today
  })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>
          Welcome back, {user?.firstName}
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {format(new Date(), "EEEE, d MMMM yyyy")} — Your leave summary is ready.
        </p>
      </motion.div>

      {currentLeave && <ActiveLeaveCountdown leave={currentLeave} />}

      {/* Leave balance */}
      <div>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "var(--text-secondary)" }}>
          MY LEAVE BALANCE
        </h3>
        {balancesLoading ? (
          <SkeletonCard rows={2} />
        ) : balances && balances.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {balances.map((b, i) => <LeaveBalanceCard key={b.leaveTypeId || b.code} b={b} index={i} />)}
          </div>
        ) : (
          <Card>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "24px" }}>
              No balance data available.
            </p>
          </Card>
        )}
      </div>

      {/* Active application tracker */}
      {latestPending && (
        <Card>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "var(--text-secondary)" }}>
            ACTIVE APPLICATION — {latestPending.reference}
          </h3>
          <LeaveProgressTracker leaveRequest={latestPending} />
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
            <Link to={`/leave/${latestPending.id}`}>
              <Button size="sm" variant="ghost">View Details →</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "var(--text-secondary)" }}>
          QUICK ACTIONS
        </h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/leave/apply">
            <Button variant="primary" icon={<FileText size={15} />}>
              Apply for Leave
            </Button>
          </Link>
          <Link to="/leave/conflict-check">
            <Button variant="ghost" icon={<AlertTriangle size={15} />}>
              Check Conflict
            </Button>
          </Link>
          <Link to="/leave/recommend">
            <Button variant="secondary" icon={<Zap size={15} />}>
              Smart Recommend
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent leave history */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>
            RECENT LEAVE HISTORY
          </h3>
          <Link to="/leave/history">
            <Button size="sm" variant="ghost">View All</Button>
          </Link>
        </div>
        {historyLoading ? (
          <SkeletonCard rows={4} />
        ) : recentLeaves.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
            <Calendar size={32} style={{ marginBottom: "8px", opacity: 0.4 }} />
            <div>Your leave journey begins here</div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1.5fr 0.8fr 0.5fr",
                gap: "8px",
                padding: "8px 12px",
                background: "var(--bg-elevated)",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: "4px",
                letterSpacing: "0.5px",
              }}
            >
              <span>REFERENCE</span><span>TYPE</span><span>DATE RANGE</span>
              <span>DAYS</span><span>STATUS</span>
            </div>
            {recentLeaves.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/leave/${item.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 1.5fr 0.8fr 0.5fr",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    alignItems: "center",
                    textDecoration: "none",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-subtle)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent-primary)" }}>
                    {item.reference}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>{item.leaveType}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {item.startDate} → {item.endDate}
                  </span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {item.workingDays}d
                  </span>
                  <StatusBadge status={item.status} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

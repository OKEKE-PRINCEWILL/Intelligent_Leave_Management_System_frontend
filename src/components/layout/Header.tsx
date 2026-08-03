import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Bell } from "lucide-react"
import { format } from "date-fns"
import { useNotificationsStore } from "../../store/notifications.store"
import { useAuthStore } from "../../store/auth.store"

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leave/apply": "Apply for Leave",
  "/leave/history": "Leave History",
  "/leave/conflict-check": "Conflict Check",
  "/leave/recommend": "Smart Recommender",
  "/approvals/pending": "Pending Approvals",
  "/approvals/hr-pending": "HR Approvals",
  "/approvals/team": "Team Coverage",
  "/analytics/departments": "Department Analytics",
  "/analytics/forecast": "Forecast",
  "/analytics/approval-rate": "Approval Rate",
  "/anomaly/scan": "Weekly Anomaly Review",
  "/anomaly/flags": "Anomaly Flags",
  "/audit/trail": "Audit Trail",
  "/audit/verify": "Chain Verification",
  "/admin/employees": "Employee Management",
  "/admin/departments": "Department Management",
  "/admin/settings": "System Settings",
  "/notifications": "Notifications",
  "/profile": "My Profile",
}

export function Header() {
  const location = useLocation()
  const { unreadCount } = useNotificationsStore()
  const { user } = useAuthStore()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const title = breadcrumbMap[location.pathname] || "ILMS"

  return (
    <header
      style={{
        height: "60px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            marginBottom: "2px",
          }}
        >
          ILMS / {title}
        </div>
        <h1 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{title}</h1>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Live clock */}
        <div
          style={{
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
          }}
        >
          {format(now, "EEE, dd MMM yyyy HH:mm:ss")}
        </div>

        {/* Notifications bell */}
        <Link
          to="/notifications"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
          style={{
            position: "relative",
            color: unreadCount > 0 ? "var(--status-rejected)" : "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "34px",
            height: "34px",
            boxSizing: "border-box",
            borderRadius: "8px",
            background: unreadCount > 0 ? "rgba(239,68,68,0.08)" : "transparent",
            transition: "color 0.15s ease",
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                background: "var(--status-rejected)",
                color: "#fff",
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                fontSize: "10px",
                border: "2px solid var(--bg-surface)",
                boxSizing: "content-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                animation: "badge-bounce 0.3s ease",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Live indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "999px",
            padding: "4px 10px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--status-approved)",
              display: "inline-block",
              animation: "pulse-opacity 2s infinite",
            }}
          />
          <span style={{ fontSize: "11px", color: "var(--status-approved)", fontWeight: 600 }}>
            Live
          </span>
        </div>

        {/* User avatar */}
        {user && (
          <Link
            to="/profile"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
              textDecoration: "none",
            }}
            title={user.fullName}
          >
            {user.firstName[0]}{user.lastName[0]}
          </Link>
        )}
      </div>
    </header>
  )
}

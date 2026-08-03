import React, { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  BarChart2,
  AlertTriangle,
  Shield,
  Users,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Settings,
  Building2,
  ClipboardList,
  TrendingUp,
} from "lucide-react"
import { useAuthStore } from "../../store/auth.store"
import { useNotificationsStore } from "../../store/notifications.store"
import { authApi } from "../../api/auth.api"
import { approvalsApi } from "../../api/approvals.api"
import type { UserRole } from "../../types/api.types"

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  roles: UserRole[]
  badge?: "hodPending"
}

interface NavSection {
  label?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, roles: ["EMPLOYEE", "HOD", "HR_ADMIN", "AUDITOR"] },
    ],
  },
  {
    label: "My Leave",
    items: [
      { path: "/leave/apply", label: "Apply Leave", icon: <FileText size={18} />, roles: ["EMPLOYEE"] },
      { path: "/leave/history", label: "My Leaves", icon: <ClipboardList size={18} />, roles: ["EMPLOYEE"] },
      { path: "/leave/recommend", label: "Smart Recommend", icon: <Zap size={18} />, roles: ["EMPLOYEE"] },
    ],
  },
  {
    label: "Approvals",
    items: [
      { path: "/approvals/pending", label: "Pending Approvals", icon: <CheckSquare size={18} />, roles: ["HOD"], badge: "hodPending" },
      { path: "/approvals/hr-pending", label: "Leave Approvals", icon: <CheckSquare size={18} />, roles: ["HR_ADMIN"] },
      { path: "/approvals/team", label: "Team Coverage", icon: <Users size={18} />, roles: ["HOD"] },
    ],
  },
  {
    label: "Reports",
    items: [
      { path: "/analytics/departments", label: "Department Analytics", icon: <BarChart2 size={18} />, roles: ["HR_ADMIN", "HOD", "AUDITOR"] },
      { path: "/analytics/forecast", label: "Leave Forecast", icon: <TrendingUp size={18} />, roles: ["HOD", "HR_ADMIN"] },
      { path: "/anomaly/scan", label: "Anomaly Review", icon: <AlertTriangle size={18} />, roles: ["HOD", "HR_ADMIN"] },
      { path: "/audit/trail", label: "Audit Trail", icon: <Shield size={18} />, roles: ["AUDITOR"] },
      { path: "/audit/settings", label: "System Settings", icon: <Settings size={18} />, roles: ["AUDITOR"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { path: "/admin/employees", label: "Employees", icon: <Users size={18} />, roles: ["HR_ADMIN", "AUDITOR"] },
      { path: "/admin/departments", label: "Departments", icon: <Building2 size={18} />, roles: ["HR_ADMIN", "AUDITOR"] },
      { path: "/admin/bulk-roster", label: "Bulk Leave Roster", icon: <ClipboardList size={18} />, roles: ["HR_ADMIN"] },
    ],
  },
  {
    items: [
      { path: "/notifications", label: "Notifications", icon: <Bell size={18} />, roles: ["EMPLOYEE", "HOD", "HR_ADMIN", "AUDITOR"] },
      { path: "/profile", label: "My Profile", icon: <User size={18} />, roles: ["EMPLOYEE", "HOD", "HR_ADMIN", "AUDITOR"] },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const { unreadCount } = useNotificationsStore()
  const navigate = useNavigate()

  const role = user?.role || "EMPLOYEE"
  const { data: hodPending } = useQuery({
    queryKey: ["approvals-department"],
    queryFn: approvalsApi.getPendingDepartment,
    enabled: role === "HOD",
    refetchInterval: 30_000,
  })
  const hodPendingCount = hodPending?.length || 0

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    clearAuth()
    navigate("/login")
  }

  const width = collapsed ? 72 : 240

  return (
    <aside
      style={{
        width,
        minHeight: "100vh",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "20px 0" : "20px 16px",
          borderBottom: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--accent-primary)",
                letterSpacing: "1px",
              }}
            >
              ILMS
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>
              NIMASA Workforce
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "8px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        {navSections.map((section, si) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(role))
          if (visibleItems.length === 0) return null

          return (
            <div key={si}>
              {/* Section label — hidden when collapsed */}
              {section.label && !collapsed && (
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    letterSpacing: "0.8px",
                    padding: "12px 12px 4px",
                    textTransform: "uppercase",
                  }}
                >
                  {section.label}
                </div>
              )}
              {collapsed && section.label && (
                <div style={{ height: "8px" }} />
              )}

              {visibleItems.map((item) => (
                (() => {
                  const badgeCount = item.badge === "hodPending" ? hodPendingCount : 0
                  return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: collapsed ? "10px" : "9px 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "8px",
                    color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                    background: isActive ? "var(--accent-primary-bg)" : "transparent",
                    borderLeft: isActive ? "3px solid var(--accent-primary)" : "3px solid transparent",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 400,
                    transition: "all 0.15s ease",
                    position: "relative",
                    whiteSpace: "nowrap",
                    marginBottom: "1px",
                  })}
                  title={collapsed ? item.label : undefined}
                >
                  <span style={{ flexShrink: 0, position: "relative" }}>
                    {item.icon}
                    {item.path === "/notifications" && unreadCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-4px",
                          background: "var(--status-rejected)",
                          color: "#fff",
                          borderRadius: "50%",
                          width: "14px",
                          height: "14px",
                          fontSize: "9px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    {badgeCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-7px",
                          background: "var(--status-rejected)",
                          color: "#fff",
                          borderRadius: "50%",
                          width: "9px",
                          height: "9px",
                          border: "2px solid var(--bg-surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxSizing: "border-box",
                        }}
                      />
                    )}
                  </span>
                  {!collapsed && (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                      <span>{item.label}</span>
                      {badgeCount > 0 && (
                        <span
                          title={`${badgeCount} pending approval${badgeCount === 1 ? "" : "s"}`}
                          style={{
                            background: "var(--status-rejected)",
                            borderRadius: "50%",
                            width: "8px",
                            height: "8px",
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </span>
                  )}
                </NavLink>
                  )
                })()
              ))}

              {/* Spacer between sections */}
              {si < navSections.length - 1 && !collapsed && section.label && (
                <div style={{ height: "4px" }} />
              )}
            </div>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid var(--border-default)",
          flexShrink: 0,
        }}
      >
        {!collapsed && user && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              background: "var(--bg-elevated)",
              marginBottom: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
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
                {(user.firstName?.[0] || user.fullName?.[0] || "U").toUpperCase()}
                {(user.lastName?.[0] || "").toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.fullName || user.firstName || "User"}
                </div>
                {user.departmentName && (
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "1px" }}>
                    {user.departmentName}
                  </div>
                )}
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--accent-primary)",
                    fontWeight: 600,
                    background: "var(--accent-primary-bg)",
                    borderRadius: "4px",
                    padding: "1px 6px",
                    display: "inline-block",
                    marginTop: "3px",
                  }}
                >
                  {user.role === "HR_ADMIN" ? "HR Admin" : user.role === "HOD" ? "Head of Dept" : user.role === "AUDITOR" ? "Administrator" : "Employee"}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: collapsed ? "10px" : "9px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: "8px",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "13px",
            cursor: "pointer",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(220,38,38,0.06)"
            e.currentTarget.style.color = "var(--status-rejected)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none"
            e.currentTarget.style.color = "var(--text-muted)"
          }}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}

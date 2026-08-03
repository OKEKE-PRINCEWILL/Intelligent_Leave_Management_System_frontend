import React, { useState } from "react"
import { motion } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCheck, AlertTriangle, Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { notificationsApi } from "../../api/notifications.api"
import { useNotificationsStore } from "../../store/notifications.store"
import { useAuthStore } from "../../store/auth.store"
import { getApiErrorMessage } from "../../api/axios"
import type { Notification } from "../../types/api.types"

type Tab = "ALL" | "UNREAD" | "LEAVE" | "ANOMALY"

const TABS: { id: Tab; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "UNREAD", label: "Unread" },
  { id: "LEAVE", label: "Leave" },
  { id: "ANOMALY", label: "Anomaly" },
]

function notifIcon(type: string) {
  if (type?.includes("ANOMALY")) return <AlertTriangle size={16} color="var(--risk-high)" />
  if (type?.includes("LEAVE") || type?.includes("APPROVAL")) return <Calendar size={16} color="var(--accent-primary)" />
  return <Bell size={16} color="var(--text-muted)" />
}

function notifRoute(n: Notification, role?: string): string | null {
  if (n.entityType === "LEAVE_REQUEST" && n.entityId) {
    return role === "HOD" || role === "HR_ADMIN" ? `/approvals/${n.entityId}` : `/leave/${n.entityId}`
  }
  if (n.entityType === "ANOMALY_FLAG") return "/anomaly/flags"
  return null
}

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ALL")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const pageSize = 8
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { markAllRead: storeMarkAll } = useNotificationsStore()
  const { user } = useAuthStore()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.getAll,
  })

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      storeMarkAll()
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("All notifications marked as read.")
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const handleClick = (n: Notification) => {
    if (!n.read) markReadMutation.mutate(n.id)
    const route = notifRoute(n, user?.role)
    if (route) navigate(route)
  }

  const filtered = (notifications || []).filter((n) => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || n.title?.toLowerCase().includes(q)
      || n.message?.toLowerCase().includes(q)
      || n.type?.toLowerCase().includes(q)
      || n.entityType?.toLowerCase().includes(q)
    if (!matchSearch) return false
    if (activeTab === "UNREAD") return !n.read
    if (activeTab === "LEAVE") return n.type?.includes("LEAVE") || n.type?.includes("APPROVAL")
    if (activeTab === "ANOMALY") return n.type?.includes("ANOMALY")
    return true
  })

  const unreadCount = (notifications || []).filter((n) => !n.read).length
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pagedNotifications = filtered.slice(page * pageSize, page * pageSize + pageSize)

  React.useEffect(() => {
    setPage(0)
  }, [activeTab, search])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Notifications</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon={<CheckCheck size={14} />}
            loading={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--border-default)" }}>
        {TABS.map((tab) => {
          const count = tab.id === "UNREAD" ? unreadCount : tab.id === "ALL" ? (notifications || []).length : (notifications || []).filter((n) => {
            if (tab.id === "LEAVE") return n.type?.includes("LEAVE") || n.type?.includes("APPROVAL")
            if (tab.id === "ANOMALY") return n.type?.includes("ANOMALY")
            return false
          }).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--accent-primary)" : "2px solid transparent",
                color: activeTab === tab.id ? "var(--accent-primary)" : "var(--text-muted)",
                fontSize: "13px",
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: "pointer",
                marginBottom: "-1px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {tab.label}
              {count > 0 && (
                <span style={{
                  fontSize: "10px",
                  background: tab.id === "UNREAD" ? "var(--accent-primary)" : "var(--bg-elevated)",
                  color: tab.id === "UNREAD" ? "var(--bg-base)" : "var(--text-muted)",
                  borderRadius: "999px",
                  padding: "1px 6px",
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <Card>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications by title, message, or type..."
            style={{ width: "100%", boxSizing: "border-box", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "10px", padding: "10px 12px 10px 36px", fontSize: "13px", color: "var(--text-primary)", outline: "none" }}
          />
        </div>
      </Card>

      {/* List */}
      <Card>
        {isLoading ? (
          <SkeletonCard rows={5} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
            <Bell size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <div style={{ fontSize: "14px", fontWeight: 600 }}>No notifications here</div>
          </div>
        ) : (
          <div>
            {pagedNotifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleClick(n)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "14px 12px",
                  borderBottom: i < pagedNotifications.length - 1 ? "1px solid var(--border-default)" : undefined,
                  cursor: notifRoute(n, user?.role) ? "pointer" : "default",
                  background: !n.read ? "rgba(139,90,43,0.03)" : undefined,
                  borderLeft: !n.read ? "3px solid var(--accent-primary)" : "3px solid transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = !n.read ? "rgba(139,90,43,0.03)" : "transparent" }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {notifIcon(n.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: n.read ? 400 : 600, marginBottom: "4px", color: "var(--text-primary)" }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px", lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                {!n.read && (
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-primary)", flexShrink: 0, marginTop: "4px" }} />
                )}
              </motion.div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", fontSize: "12px", color: "var(--text-muted)" }}>
              <span>Page {page + 1} of {pageCount} - {filtered.length} notifications</span>
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

import React, { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronLeft, ChevronRight, Search, ShieldCheck } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { SkeletonTable } from "../../components/ui/Skeleton"
import { auditApi } from "../../api/audit.api"
import type { AuditEntry } from "../../types/api.types"

type RangeFilter = "LAST_7_DAYS" | "ALL_TIME" | "LAST_24_HOURS"

const rangeOptions: { id: RangeFilter; label: string }[] = [
  { id: "LAST_7_DAYS", label: "Last 7 Days" },
  { id: "ALL_TIME", label: "All Time" },
  { id: "LAST_24_HOURS", label: "Last 24 Hours" },
]

function entryDate(entry: AuditEntry) {
  return new Date((entry as AuditEntry & { timestamp?: string }).timestamp || entry.createdAt)
}

function sameDayLabel(date: Date) {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

function timeLabel(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

function humanAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function eventText(entry: AuditEntry) {
  const action = humanAction(entry.action)
  const actor = entry.userLabel || "System"
  const target = entry.entityLabel || entry.entityType || "record"
  return `${action}: ${actor} changed ${target}`
}

function eventId(entry: AuditEntry) {
  const hash = entry.currentHash || String(entry.id)
  return `evt_${hash.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18)}${entry.id}`
}

export function AuditTrail() {
  const [range, setRange] = useState<RangeFilter>("LAST_7_DAYS")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const pageSize = 10

  const { data: audit, isLoading } = useQuery({
    queryKey: ["audit-trail", page],
    queryFn: () => auditApi.getTrail({ page, size: pageSize }),
    refetchInterval: 60_000,
  })

  const entries = useMemo(() => {
    const now = Date.now()
    const rows = audit?.entries || []
    const q = search.toLowerCase()
    const dateFiltered = range === "ALL_TIME" ? rows : rows.filter((entry) => now - entryDate(entry).getTime() <= (range === "LAST_24_HOURS" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000))
    if (!q) return dateFiltered
    return dateFiltered.filter((entry) =>
      eventText(entry).toLowerCase().includes(q)
      || eventId(entry).toLowerCase().includes(q)
      || entry.userLabel?.toLowerCase().includes(q)
      || entry.entityLabel?.toLowerCase().includes(q)
      || entry.action?.toLowerCase().includes(q)
    )
  }, [audit?.entries, range, search])

  React.useEffect(() => {
    setPage(0)
  }, [search])

  const canGoNext = (audit?.entries || []).length === pageSize

  return (
    <div style={{ minHeight: "calc(100vh - 112px)", background: "#fff", color: "#2A1E12", padding: "8px 0 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "38px" }}>
        <h2 style={{ fontSize: "28px", color: "#8EA0B3", fontWeight: 800, margin: 0 }}>Events</h2>

        <div style={{ display: "flex", alignItems: "center", border: "2px solid #2F6FEB", borderRadius: "5px", overflow: "hidden" }}>
          {rangeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setRange(option.id)
                setPage(0)
              }}
              style={{
                height: "40px",
                padding: "0 20px",
                border: "none",
                borderRight: "2px solid #2F6FEB",
                background: range === option.id ? "#2F6FEB" : "#fff",
                color: range === option.id ? "#fff" : "#8B5A2B",
                fontSize: "18px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          ))}
          <button
            aria-label="More filters"
            style={{
              height: "40px",
              width: "58px",
              border: "none",
              background: "#fff",
              color: "#8B5A2B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronDown size={26} />
          </button>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "18px" }}>
        <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#8EA0B3" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events by name, action, entity, or event ID..."
          style={{ width: "100%", boxSizing: "border-box", background: "#fff", border: "2px solid #EFE7DD", borderRadius: "12px", padding: "13px 16px 13px 44px", color: "#2A1E12", fontSize: "15px", outline: "none" }}
        />
      </div>

      <div
        style={{
          border: "2px solid #EFE7DD",
          borderRadius: "14px",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr 280px",
            alignItems: "center",
            background: "#F8FAFD",
            borderBottom: "2px solid #EFE7DD",
            padding: "24px 26px",
            color: "#606A8A",
            fontSize: "18px",
            fontWeight: 500,
          }}
        >
          <span>Timestamp</span>
          <span>Event</span>
          <span style={{ textAlign: "right" }}>Event ID</span>
        </div>

        {isLoading ? (
          <div style={{ padding: "20px" }}>
            <SkeletonTable rows={5} cols={3} />
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: "42px 26px", color: "#9AA4B5", display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={20} />
            No events found for this period.
          </div>
        ) : (
          entries.map((entry) => {
            const date = entryDate(entry)
            return (
              <div
                key={entry.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "240px 1fr 280px",
                  gap: "20px",
                  alignItems: "start",
                  padding: "26px 24px",
                  borderBottom: "2px solid #EEF3F9",
                }}
              >
                <div style={{ display: "flex", gap: "18px", alignItems: "baseline", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: "19px", fontWeight: 800, color: "#2A1E12" }}>{sameDayLabel(date)}</span>
                  <span style={{ fontSize: "18px", color: "#A3ADBD", fontWeight: 700 }}>{timeLabel(date)}</span>
                </div>
                <div style={{ fontSize: "19px", lineHeight: 1.45, color: "#2A1E12", fontWeight: 700 }}>
                  {eventText(entry)}
                </div>
                <div style={{ textAlign: "right", color: "#A3ADBD", fontSize: "18px", lineHeight: 1.45, fontWeight: 700, overflowWrap: "anywhere" }}>
                  {eventId(entry)}
                </div>
              </div>
            )
          })
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 24px", color: "#2A1E12", fontWeight: 800, fontSize: "18px" }}>
          <span>{entries.length} action{entries.length === 1 ? "" : "s"}</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button size="sm" variant="ghost" icon={<ChevronLeft size={14} />} disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
            <Button size="sm" variant="ghost" icon={<ChevronRight size={14} />} disabled={!canGoNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

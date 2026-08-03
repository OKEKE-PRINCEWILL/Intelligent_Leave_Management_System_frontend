import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns"
import { ChevronLeft, ChevronRight, CalendarDays, Users } from "lucide-react"
import { Card } from "../ui/Card"
import { StatusBadge } from "../ui/StatusBadge"
import type { ApprovalRequest } from "../../types/api.types"

interface LeaveCalendarProps {
  schedule: ApprovalRequest[]
  title?: string
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function leavesOnDay(schedule: ApprovalRequest[], day: Date): ApprovalRequest[] {
  return schedule.filter((item) => {
    try {
      const start = startOfDay(parseISO(String(item.startDate)))
      const end = startOfDay(parseISO(String(item.endDate)))
      return isWithinInterval(startOfDay(day), { start, end })
    } catch {
      return false
    }
  })
}

export function LeaveCalendar({ schedule, title = "Leave Calendar" }: LeaveCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const today = startOfDay(new Date())
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const leadingBlanks = (monthStart.getDay() + 6) % 7 // Monday-first
  const days = useMemo(
    () => Array.from({ length: monthEnd.getDate() }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
    [month, monthEnd]
  )

  const upcoming = useMemo(() => {
    return [...schedule]
      .filter((item) => {
        try {
          return startOfDay(parseISO(String(item.endDate))) >= today
        } catch {
          return false
        }
      })
      .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)))
  }, [schedule, today])

  const selectedLeaves = selectedDate ? leavesOnDay(schedule, selectedDate) : []

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarDays size={15} />
            {title.toUpperCase()}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Previous month"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: "13px", fontWeight: 700, minWidth: "120px", textAlign: "center" }}>{format(month, "MMMM yyyy")}</span>
            <button onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 1.3fr) minmax(260px, 1fr)", gap: "18px" }}>
          {/* Calendar grid */}
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "6px" }}>
              {WEEKDAYS.map((d) => (
                <div key={d} style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center", fontWeight: 600 }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
              {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`blank-${i}`} />)}
              {days.map((day) => {
                const dayLeaves = leavesOnDay(schedule, day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isToday = isSameDay(day, today)
                const hasLeaves = dayLeaves.length > 0
                return (
                  <button
                    key={day.toISOString()}
                    onMouseEnter={() => setSelectedDate(day)}
                    onClick={() => setSelectedDate(day)}
                    style={{
                      minHeight: "46px",
                      border: isSelected ? "1.5px solid var(--accent-primary)" : isToday ? "1px solid var(--border-accent)" : "1px solid var(--border-default)",
                      borderRadius: "8px",
                      padding: "5px",
                      cursor: "pointer",
                      textAlign: "left",
                      background: isSelected ? "var(--accent-primary-bg)" : hasLeaves ? "rgba(139,90,43,0.06)" : "var(--bg-elevated)",
                      transition: "border-color 0.12s, background 0.12s",
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: isToday ? 800 : 500, color: isToday ? "var(--accent-primary)" : "var(--text-secondary)" }}>
                      {format(day, "d")}
                    </span>
                    {hasLeaves && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontWeight: 700, color: "var(--accent-primary)" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent-primary)" }} />
                        {dayLeaves.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected-day detail panel */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
              {selectedDate ? "On leave on" : "Hover or click a date"}
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>
              {selectedDate ? format(selectedDate, "EEE, dd MMM yyyy") : "—"}
            </div>
            {selectedLeaves.length === 0 ? (
              <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "12px 0" }}>
                {selectedDate ? "No one is on leave on this date." : "Select a date to see who is away."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedLeaves.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "8px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--accent-primary-bg)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "var(--accent-primary)", flexShrink: 0 }}>
                      {(item.employeeName ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.employeeName}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{item.leaveType}</div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Separate Upcoming Leave table */}
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={15} />
          UPCOMING LEAVE
          <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)", background: "var(--accent-primary-bg)", border: "1px solid var(--border-accent)", borderRadius: "999px", padding: "2px 10px" }}>
            {upcoming.length} scheduled
          </span>
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px", fontSize: "13px" }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", textAlign: "left", borderBottom: "1px solid var(--border-default)" }}>
                <th style={{ padding: "9px 10px" }}>Employee</th>
                <th style={{ padding: "9px 10px" }}>Type</th>
                <th style={{ padding: "9px 10px" }}>Schedule</th>
                <th style={{ padding: "9px 10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No upcoming leave scheduled.</td></tr>
              ) : (
                upcoming.map((item) => (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderBottom: "1px solid var(--border-default)" }}>
                    <td style={{ padding: "11px 10px", fontWeight: 600 }}>{item.employeeName}</td>
                    <td style={{ padding: "11px 10px", color: "var(--text-secondary)" }}>{item.leaveType}</td>
                    <td style={{ padding: "11px 10px", color: "var(--text-secondary)" }}>
                      {item.startDate} {"->"} {item.endDate} ({differenceInCalendarDays(parseISO(String(item.endDate)), parseISO(String(item.startDate))) + 1}d)
                    </td>
                    <td style={{ padding: "11px 10px" }}><StatusBadge status={item.status} /></td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

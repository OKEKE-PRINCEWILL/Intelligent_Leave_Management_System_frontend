import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, Bell, CheckCircle, ChevronLeft, ChevronRight, Search, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { anomalyApi } from "../../api/anomaly.api"
import { getApiErrorMessage } from "../../api/axios"
import { useAuthStore } from "../../store/auth.store"

function urgencyLabel(level: string) {
  if (level === "HIGH") return "Needs urgent review"
  if (level === "MEDIUM") return "Needs review"
  return "For awareness"
}

function urgencyColor(level: string) {
  if (level === "HIGH") return "var(--status-rejected)"
  if (level === "MEDIUM") return "var(--status-pending)"
  return "var(--text-muted)"
}

function plainExplanation(pattern: string | undefined, hrNotes: string | undefined, issueSummary: string | undefined, employeeName: string | undefined): string {
  const firstName = (employeeName ?? "This employee").split(" ")[0]

  // If the backend has already written a meaningful non-boilerplate note, use it
  const stored = hrNotes || issueSummary || ""
  const isBoilerplate = !stored
    || stored.includes("Monitor for medical")
    || stored.includes("Discuss recurring")
    || stored.includes("Flagged for team")
    || stored.includes("Needs contextual")
    || stored.includes("Observe further")
    || stored.includes("pattern observed")

  if (!isBoilerplate) return stored

  // Derive from pattern code
  switch ((pattern ?? "").toUpperCase()) {
    case "MONDAY_SICK":
      return `${firstName} has had a noticeable number of sick or emergency leave requests falling on Mondays. This has been flagged for a compassionate review — it may reflect a genuine recurring health issue, or it may be worth a brief conversation to understand the pattern better.`
    case "SHORT_BURST":
      return `${firstName} tends to take several short leave spells in quick succession rather than longer planned periods. While this is not a policy breach, it can make team planning difficult. A supportive conversation about leave scheduling may help.`
    case "HOLIDAY_CLUSTER":
      return `${firstName}'s leave requests frequently land just before or after weekends and public holidays, effectively extending those rest periods. This has been flagged so the HOD can confirm that coverage is being properly managed during these times.`
    case "APPRAISAL_AVOIDANCE":
      return `${firstName}'s leave history shows a pattern of taking leave around key appraisal or performance review periods. This may be coincidental, but it is helpful for HR to be aware when planning review schedules and ensuring fair participation.`
    case "OVERLAP_PATTERN":
      return `${firstName} has been on leave more frequently than most colleagues in the same department over the recent period. This has been flagged to ensure team coverage is adequate and that workload is being fairly managed.`
    default:
      return `${firstName}'s recent leave pattern has been flagged for review because it differs noticeably from the rest of the department. This is an advisory flag to prompt a fair, human-led conversation — it does not reflect any breach of policy.`
  }
}

export function AnomalyScanPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [page, setPage] = useState(0)
  const pageSize = 8
  const isAdmin = user?.role === "HR_ADMIN"

  const { data: flags, isLoading } = useQuery({
    queryKey: ["anomaly-flags"],
    queryFn: anomalyApi.getFlags,
  })

  const dismissMutation = useMutation({
    mutationFn: anomalyApi.dismissFlag,
    onSuccess: () => {
      toast.success("Review item dismissed.")
      queryClient.invalidateQueries({ queryKey: ["anomaly-flags"] })
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const resolveMutation = useMutation({
    mutationFn: anomalyApi.resolveFlag,
    onSuccess: () => {
      toast.success("Review item resolved.")
      queryClient.invalidateQueries({ queryKey: ["anomaly-flags"] })
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const openFlags = (flags || []).filter((f) => f.status === "ACTIVE" || f.status === "OPEN")
  const departments = Array.from(new Set(openFlags.map((f) => f.departmentName).filter(Boolean))).sort()

  const filteredFlags = openFlags.filter((flag) => {
    const q = search.toLowerCase()
    const matchDept = !departmentFilter || flag.departmentName === departmentFilter
    const matchSearch = !q
      || flag.employeeName?.toLowerCase().includes(q)
      || flag.staffId?.toLowerCase().includes(q)
      || flag.departmentName?.toLowerCase().includes(q)
    return matchDept && matchSearch
  })

  const pageCount = Math.max(1, Math.ceil(filteredFlags.length / pageSize))
  const pagedFlags = filteredFlags.slice(page * pageSize, page * pageSize + pageSize)

  useEffect(() => { setPage(0) }, [search, departmentFilter])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Weekly Leave Review</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          The system checks leave patterns every week and raises items for human review.
          These are not automatic decisions — each one is a prompt for a fair conversation.
        </p>
      </div>

      <Card>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.6 }}>
          <Bell size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            {user?.role === "HOD"
              ? `You are seeing review items for ${user.departmentName || "your department"} only. `
              : "HR Admin can see review items across all departments. "}
            New findings are sent to your notification box each Monday.
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee name or staff ID..."
              style={{
                width: "100%", boxSizing: "border-box",
                background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                borderRadius: "10px", padding: "10px 12px 10px 36px",
                fontSize: "13px", color: "var(--text-primary)", outline: "none",
              }}
            />
          </div>
          {isAdmin && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                borderRadius: "10px", color: departmentFilter ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: "13px", outline: "none", minWidth: "190px",
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </div>
      </Card>

      {isLoading ? (
        <SkeletonCard rows={5} />
      ) : filteredFlags.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "48px", color: "var(--status-approved)" }}>
            <CheckCircle size={40} style={{ marginBottom: "12px" }} />
            <div style={{ fontSize: "14px", fontWeight: 700 }}>No open review items</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              New weekly findings will appear here and in your notifications.
            </div>
          </div>
        </Card>
      ) : (
        <>
          {pagedFlags.map((flag) => {
            const explanation = plainExplanation(flag.pattern, flag.hrNotes, flag.issueSummary, flag.employeeName)
            const color = urgencyColor(flag.riskLevel)
            return (
              <Card key={flag.id} style={{ borderColor: `${color}35` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Urgency badge — no scores, no pattern codes */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <AlertTriangle size={14} color={color} />
                      <span style={{
                        fontSize: "11px", fontWeight: 800, color,
                        background: `${color}12`, border: `1px solid ${color}35`,
                        borderRadius: "999px", padding: "3px 10px",
                      }}>
                        {urgencyLabel(flag.riskLevel)}
                      </span>
                    </div>

                    <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {flag.employeeName}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px", marginBottom: "12px" }}>
                      {flag.staffId}{flag.departmentName ? ` · ${flag.departmentName}` : ""}
                    </div>

                    {/* Plain-language explanation */}
                    <div style={{
                      fontSize: "13px", color: "var(--text-secondary)",
                      lineHeight: 1.65,
                      padding: "12px 14px",
                      background: "var(--bg-elevated)",
                      borderRadius: "8px",
                      border: "1px solid var(--border-default)",
                    }}>
                      {explanation}
                    </div>

                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "10px" }}>
                      Flagged: {flag.createdAt ? new Date(flag.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                    <Button
                      size="sm"
                      variant="success"
                      icon={<CheckCircle size={13} />}
                      loading={resolveMutation.isPending}
                      onClick={() => resolveMutation.mutate(flag.id)}
                    >
                      Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<XCircle size={13} />}
                      loading={dismissMutation.isPending}
                      onClick={() => dismissMutation.mutate(flag.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--text-muted)" }}>
            <span>
              Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filteredFlags.length)} of {filteredFlags.length} item{filteredFlags.length !== 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button size="sm" variant="ghost" icon={<ChevronLeft size={14} />} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button size="sm" variant="ghost" icon={<ChevronRight size={14} />} disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowLeft, User, Calendar, FileText, Zap } from "lucide-react"
import toast from "react-hot-toast"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { StatusBadge } from "../../components/ui/StatusBadge"
import { LeaveProgressTracker } from "../../components/leave/LeaveProgressTracker"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { leaveApi } from "../../api/leave.api"
import { getApiErrorMessage } from "../../api/axios"

export function LeaveDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: leave, isLoading } = useQuery({
    queryKey: ["leave", id],
    queryFn: () => leaveApi.getById(Number(id)),
    enabled: !!id,
  })

  const cancelMutation = useMutation({
    mutationFn: () => leaveApi.cancel(Number(id)),
    onSuccess: () => {
      toast.success("Leave cancelled successfully.")
      queryClient.invalidateQueries({ queryKey: ["leave-history"] })
      queryClient.invalidateQueries({ queryKey: ["leave", id] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  if (isLoading) return <SkeletonCard rows={8} />
  if (!leave) return <p style={{ color: "var(--text-muted)" }}>Leave request not found.</p>

  const canCancel = leave.status === "PENDING" || leave.status === "HOD_APPROVED"
  const appliedAt = leave.createdAt || (leave as unknown as { submittedAt?: string }).submittedAt
  const department = leave.departmentName || (leave as unknown as { department?: string }).department

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "13px", width: "fit-content" }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent-primary)", marginBottom: "4px" }}>{leave.reference}</div>
          <h2 style={{ fontSize: "20px", marginBottom: "6px" }}>{leave.leaveType}</h2>
          <StatusBadge status={leave.status} />
        </div>
        {canCancel && (
          <Button variant="danger" size="sm" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
            Cancel Request
          </Button>
        )}
      </motion.div>

      {/* Progress tracker */}
      <Card>
        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Zap size={14} />
          APPLICATION PROGRESS
        </h3>
        <LeaveProgressTracker leaveRequest={leave} />
      </Card>

      {/* Details */}
      <Card>
        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={14} />
          LEAVE DETAILS
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { label: "Employee", value: leave.employeeName, icon: <User size={12} /> },
            { label: "Department", value: department },
            { label: "Leave Type", value: leave.leaveType },
            { label: "Working Days", value: `${leave.workingDays} days` },
            { label: "Start Date", value: leave.startDate, icon: <Calendar size={12} /> },
            { label: "End Date", value: leave.endDate, icon: <Calendar size={12} /> },
            { label: "Relief Officer", value: leave.reliefOfficerName || "None" },
            { label: "Applied On", value: appliedAt ? new Date(appliedAt).toLocaleDateString() : "-" },
          ].map((row) => (
            <div key={row.label} style={{ padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                {row.icon}
                {row.label}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>{row.value || "—"}</div>
            </div>
          ))}
        </div>
        {leave.reason && (
          <div style={{ marginTop: "12px", padding: "12px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Reason</div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{leave.reason}</div>
          </div>
        )}
      </Card>

      {leave.status === "REJECTED" && leave.suggestedStartDate && leave.suggestedEndDate && (
        <Card>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={14} />
            SUGGESTED NEW DATES
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Start Date</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--accent-primary)" }}>{leave.suggestedStartDate}</div>
            </div>
            <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>End Date</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--accent-primary)" }}>{leave.suggestedEndDate}</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {leave.suggestedDateReason || "These dates were selected by the greedy recommendation algorithm for better department coverage."}
          </p>
        </Card>
      )}

      {/* AI Score display */}
      {leave.aiScore !== undefined && leave.aiScore !== null && (
        <Card>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px" }}>
            AI HEURISTIC SCORE
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                color:
                  leave.aiScore >= 75
                    ? "var(--status-approved)"
                    : leave.aiScore >= 50
                    ? "var(--accent-tertiary)"
                    : "var(--status-rejected)",
              }}
            >
              {leave.aiScore}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                {leave.aiRecommendation || "Scored"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ 100 total score</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

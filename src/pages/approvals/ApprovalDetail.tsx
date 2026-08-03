import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowLeft, User, CheckCircle, XCircle, RotateCcw } from "lucide-react"
import toast from "react-hot-toast"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { StatusBadge } from "../../components/ui/StatusBadge"
import { Modal } from "../../components/ui/Modal"
import { LeaveProgressTracker } from "../../components/leave/LeaveProgressTracker"
import { HeuristicScorePanel } from "../../components/algorithms/HeuristicScorePanel"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { approvalsApi } from "../../api/approvals.api"
import { getApiErrorMessage } from "../../api/axios"
import { useAuthStore } from "../../store/auth.store"

type ActionType = "approve" | "reject" | "return"

export function ApprovalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  // The HOD runs the full heuristic decision-support panel. HR/others don't re-run
  // it — they see the score that was already computed at the HOD stage (read-only).
  const isHod = user?.role === "HOD"

  const [actionModal, setActionModal] = useState<ActionType | null>(null)
  const [comment, setComment] = useState("")

  const { data: leave, isLoading } = useQuery({
    queryKey: ["approval-request", id],
    queryFn: () => approvalsApi.getById(Number(id)),
    enabled: !!id,
  })

  const actionMutation = useMutation({
    mutationFn: async (type: ActionType) => {
      const numId = Number(id)
      if (type === "approve") return approvalsApi.approve(numId, comment)
      if (type === "reject") return approvalsApi.reject(numId, comment)
      return approvalsApi.return(numId, comment)
    },
    onSuccess: (result, type) => {
      const messages = {
        approve: "✅ Leave request approved!",
        reject: "Request rejected.",
        return: "Request returned for clarification.",
      }
      const suggestion = result?.suggestedStartDate && result?.suggestedEndDate
        ? ` Suggested dates: ${result.suggestedStartDate} to ${result.suggestedEndDate}.`
        : ""
      toast.success(`${messages[type]}${type === "approve" ? "" : suggestion}`)
      queryClient.invalidateQueries({ queryKey: ["approvals-department"] })
      queryClient.invalidateQueries({ queryKey: ["approvals-hr"] })
      queryClient.invalidateQueries({ queryKey: ["approval-request", id] })
      setActionModal(null)
      navigate(-1)
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  if (isLoading) return <SkeletonCard rows={10} />
  if (!leave) return <p style={{ color: "var(--text-muted)" }}>Request not found.</p>
  const appliedAt = leave.createdAt || (leave as unknown as { submittedAt?: string }).submittedAt

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "13px", marginBottom: "20px" }}
      >
        <ArrowLeft size={14} /> Back to Approvals
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
        {/* Left — Request Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Employee card */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: 700, color: "#fff",
              }}>
                {leave.employeeName?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>{leave.employeeName}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {leave.departmentName} · GL {(leave as unknown as { employeeGradeLevel?: number }).employeeGradeLevel || "—"}
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <StatusBadge status={leave.status} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Leave Type", value: leave.leaveType },
                { label: "Duration", value: `${leave.workingDays} working days` },
                { label: "Start Date", value: leave.startDate },
                { label: "End Date", value: leave.endDate },
                { label: "Reference", value: leave.reference },
                { label: "Applied", value: appliedAt ? new Date(appliedAt).toLocaleDateString() : "-" },
              ].map((row) => (
                <div key={row.label} style={{ padding: "8px 10px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "3px" }}>{row.label}</div>
                  <div style={{ fontSize: "12px", fontWeight: 600 }}>{row.value}</div>
                </div>
              ))}
            </div>

            {leave.reason && (
              <div style={{ marginTop: "12px", padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>Reason</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{leave.reason}</div>
              </div>
            )}
          </Card>

          {/* Progress tracker */}
          <Card>
            <h3 style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>APPLICATION PROGRESS</h3>
            <LeaveProgressTracker leaveRequest={leave} />
          </Card>

          {/* Action buttons */}
          {(leave.status === "PENDING" || leave.status === "HOD_APPROVED") && (
            <Card>
              <h3 style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>DECISION</h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Button variant="success" icon={<CheckCircle size={15} />} onClick={() => setActionModal("approve")}>
                  Approve
                </Button>
                <Button variant="secondary" icon={<RotateCcw size={15} />} onClick={() => setActionModal("return")}>
                  Return
                </Button>
                <Button variant="danger" icon={<XCircle size={15} />} onClick={() => setActionModal("reject")}>
                  Reject
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right — HOD runs the full panel; everyone else sees the score read-only */}
        <div>
          {isHod ? (
            <HeuristicScorePanel
              leaveRequestId={Number(id)}
              onScore={(id) => approvalsApi.score(id)}
            />
          ) : (
            <ReadOnlyScore score={leave.optimisationScore} recommendation={leave.optimisationRecommendation} />
          )}
        </div>
      </div>

      {/* Action confirmation modal */}
      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal ? `${actionModal.charAt(0).toUpperCase() + actionModal.slice(1)} Request` : ""}
        width={420}
      >
        {actionModal && (
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              You are about to <strong style={{ color: actionModal === "approve" ? "var(--status-approved)" : actionModal === "reject" ? "var(--status-rejected)" : "var(--status-returned)" }}>
                {actionModal.toUpperCase()}
              </strong> request <strong style={{ fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>{leave.reference}</strong> for {leave.employeeName}.
            </p>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Comment {actionModal !== "approve" ? "(required)" : "(optional)"}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                required={actionModal !== "approve"}
                style={{
                  width: "100%",
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                  resize: "vertical",
                  minHeight: "80px",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setActionModal(null)}>Cancel</Button>
              <Button
                variant={actionModal === "approve" ? "success" : actionModal === "reject" ? "danger" : "secondary"}
                loading={actionMutation.isPending}
                disabled={(actionModal !== "approve" && !comment.trim()) || actionMutation.isPending}
                onClick={() => actionModal && actionMutation.mutate(actionModal)}
              >
                Confirm {actionModal.charAt(0).toUpperCase() + actionModal.slice(1)}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function ReadOnlyScore({ score, recommendation }: { score?: number; recommendation?: string }) {
  const hasScore = typeof score === "number"
  const color = !hasScore
    ? "var(--text-muted)"
    : score >= 75 ? "var(--status-approved)" : score >= 50 ? "var(--accent-tertiary)" : "var(--status-rejected)"
  const recLabel = recommendation === "APPROVE" ? "Looks good to approve"
    : recommendation === "REVIEW" ? "Review carefully"
    : recommendation === "REJECT" ? "Not advised"
    : null

  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-accent)",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "var(--glow-cyan)",
    }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--text-accent)", letterSpacing: "1px", marginBottom: "16px" }}>
        HEURISTIC REVIEW SCORE
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <div style={{
          width: "84px", height: "84px", borderRadius: "50%", border: `8px solid ${color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color, fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-display)", flexShrink: 0,
        }}>
          {hasScore ? score : "—"}
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>SCORE OUT OF 100</div>
          {recLabel && <div style={{ fontSize: "18px", fontWeight: 800, color }}>{recLabel}</div>}
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.5 }}>
            {hasScore
              ? "Computed by the HOD's heuristic review at the first approval stage."
              : "No heuristic score is available for this request yet."}
          </div>
        </div>
      </div>
    </div>
  )
}

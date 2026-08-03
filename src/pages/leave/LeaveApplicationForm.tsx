import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Calendar, FileText, Users, CheckCircle, Info } from "lucide-react"
import toast from "react-hot-toast"
import { differenceInBusinessDays, addDays, addBusinessDays, format, parseISO } from "date-fns"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input, Textarea } from "../../components/ui/Input"
import { ConflictChecker } from "../../components/leave/ConflictChecker"
import { GreedyVisualizer } from "../../components/algorithms/GreedyVisualizer"
import { leaveApi } from "../../api/leave.api"
import { getApiErrorMessage } from "../../api/axios"
import { useAuthStore } from "../../store/auth.store"
import type { ConflictCheckResult, GreedyResult } from "../../types/api.types"

const STEPS = ["Leave Details", "Conflict Check", "Relief Officer", "Review & Submit"]

const OPEN_ENDED_CODES = ["SICK", "COMPASSIONATE"]

export function LeaveApplicationForm() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step, setStep] = useState(0)

  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [durationDays, setDurationDays] = useState(1)
  const [reason, setReason] = useState("")
  const [reliefOfficerId, setReliefOfficerId] = useState("")

  const [conflict, setConflict] = useState<ConflictCheckResult | null>(null)
  const [conflictLoading, setConflictLoading] = useState(false)
  const [greedy, setGreedy] = useState<GreedyResult | null>(null)
  const [greedyLoading, setGreedyLoading] = useState(false)

  const { data: leaveTypes } = useQuery({ queryKey: ["leave-types"], queryFn: leaveApi.getTypes })
  const { data: balance } = useQuery({ queryKey: ["leave-balance"], queryFn: leaveApi.getBalance })
  const { data: history } = useQuery({ queryKey: ["leave-history"], queryFn: leaveApi.getHistory })

  const canUseMaternity = user?.gender === "FEMALE"
  const availableLeaveTypes = (leaveTypes || []).filter((type) => type.code !== "MATERNITY" || canUseMaternity)
  const selectedType = availableLeaveTypes.find((t) => t.id === Number(leaveTypeId))
  const isOpenEnded = selectedType?.openEnded ?? OPEN_ENDED_CODES.includes(selectedType?.code ?? "")
  const employeeId = user?.employeeId ?? user?.id
  const currentLeave = history?.find((item) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const leaveStart = parseISO(item.startDate)
    const leaveEnd = parseISO(item.endDate)
    return item.status === "APPROVED" && leaveStart <= today && leaveEnd >= today
  })

  // For open-ended types, compute endDate from startDate + durationDays
  const computedEndDate = isOpenEnded && startDate
    ? format(addBusinessDays(parseISO(startDate), durationDays - 1), "yyyy-MM-dd")
    : endDate

  const effectiveEndDate = isOpenEnded ? computedEndDate : endDate

  const workingDays =
    startDate && effectiveEndDate
      ? Math.max(0, differenceInBusinessDays(parseISO(effectiveEndDate), parseISO(startDate)) + 1)
      : isOpenEnded ? durationDays : 0

  const selectedBalance = balance?.find((b) => b.leaveTypeId === Number(leaveTypeId))
  const balanceInsufficient = !isOpenEnded && selectedBalance && workingDays > selectedBalance.remaining

  // Auto conflict check when entering step 1
  useEffect(() => {
    if (startDate && effectiveEndDate && step === 1) {
      runConflictCheck()
    }
  }, [step])

  useEffect(() => {
    if (leaveTypeId && !availableLeaveTypes.some((type) => type.id === Number(leaveTypeId))) {
      setLeaveTypeId("")
    }
  }, [leaveTypeId, availableLeaveTypes])

  const runConflictCheck = async () => {
    if (!startDate || !effectiveEndDate) return
    setConflictLoading(true)
    try {
      const result = await leaveApi.checkConflict({
        departmentId: user?.departmentId,
        employeeId,
        startDate,
        endDate: effectiveEndDate,
      })
      setConflict(result)
      if (!result.safe) runGreedy()
    } catch {
      setConflict(null)
    } finally {
      setConflictLoading(false)
    }
  }

  const runGreedy = async () => {
    if (!user || !employeeId || !user.departmentId) return
    setGreedyLoading(true)
    setGreedy(null)
    try {
      const result = await leaveApi.greedyRecommend({
        departmentId: user.departmentId,
        employeeId,
        requestedStart: startDate,
        duration: workingDays || 5,
      })
      setGreedy(result)
    } catch {
      setGreedy(null)
    } finally {
      setGreedyLoading(false)
    }
  }

  const applyMutation = useMutation({
    mutationFn: () =>
      leaveApi.apply({
        leaveTypeId: Number(leaveTypeId),
        startDate,
        endDate: effectiveEndDate,
        reason,
        reliefOfficerId: reliefOfficerId ? Number(reliefOfficerId) : undefined,
      }),
    onSuccess: () => {
      toast.success("Leave application submitted successfully!")
      navigate("/leave/history")
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const canNext = () => {
    if (step === 0) {
      if (!leaveTypeId || !startDate) return false
      if (isOpenEnded) return durationDays >= 1 && !!reason.trim()
      return !!endDate && !balanceInsufficient
    }
    return true
  }

  const minStartDate = format(addDays(new Date(), 1), "yyyy-MM-dd")

  if (currentLeave) {
    return (
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "8px",
              background: "rgba(239,68,68,0.08)",
              color: "var(--status-rejected)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Info size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", marginBottom: "6px" }}>Leave application unavailable</h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                You cannot apply for another leave while you are currently on approved leave.
                Your current {currentLeave.leaveType} leave runs from {currentLeave.startDate} to {currentLeave.endDate}.
              </p>
              <div style={{ marginTop: "16px" }}>
                <Button variant="primary" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      {/* Progress bar */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              fontSize: "11px",
              fontWeight: i === step ? 700 : 400,
              color: i <= step ? "var(--accent-primary)" : "var(--text-muted)",
              textAlign: "center",
              flex: 1,
            }}>
              {s}
            </div>
          ))}
        </div>
        <div style={{ height: "4px", background: "var(--bg-subtle)", borderRadius: "2px", overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))", borderRadius: "2px" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0 — Leave Details */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <Card>
              <h3 style={{ fontSize: "13px", color: "var(--accent-primary)", marginBottom: "20px", fontWeight: 700 }}>
                <FileText size={14} style={{ display: "inline", marginRight: 8 }} />
                STEP 1 — LEAVE DETAILS
              </h3>

              {/* Leave type cards */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px", fontWeight: 500 }}>
                  Select Leave Type
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
                  {availableLeaveTypes.map((lt) => {
                    const bal = balance?.find((b) => b.leaveTypeId === lt.id)
                    const isSelected = leaveTypeId === String(lt.id)
                    const isOE = lt.openEnded ?? OPEN_ENDED_CODES.includes(lt.code)
                    return (
                      <button
                        key={lt.id}
                        onClick={() => setLeaveTypeId(String(lt.id))}
                        style={{
                          padding: "14px 12px",
                          background: isSelected ? "var(--accent-primary-bg)" : "var(--bg-elevated)",
                          border: `1.5px solid ${isSelected ? "var(--accent-primary)" : "var(--border-default)"}`,
                          borderRadius: "12px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ fontSize: "13px", fontWeight: 600, color: isSelected ? "var(--accent-primary)" : "var(--text-primary)", marginBottom: "4px" }}>
                          {lt.name}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          {isOE ? "No fixed limit" : `${lt.maxDays} days/year`}
                        </div>
                        {bal && !isOE && (
                          <div style={{
                            fontSize: "10px", marginTop: "4px", fontWeight: 600,
                            color: bal.remaining < 3 ? "var(--status-rejected)" : "var(--status-approved)",
                          }}>
                            {bal.remaining} days left
                          </div>
                        )}
                        {lt.requiresMedicalDoc && (
                          <div style={{ fontSize: "10px", color: "var(--accent-tertiary)", marginTop: "3px" }}>
                            ⚕ Medical doc required
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Open-ended: start date + duration */}
              {isOpenEnded ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{
                    padding: "10px 14px",
                    background: "rgba(139,90,43,0.06)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}>
                    <Info size={13} style={{ marginTop: "1px", flexShrink: 0, color: "var(--accent-primary)" }} />
                    <span>
                      This leave type has no fixed period. Enter your start date and the number of days you need.
                      A medical certificate or supporting document may be required.
                    </span>
                  </div>
                  <Input
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={minStartDate}
                  />
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      Duration (working days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Math.max(1, Number(e.target.value)))}
                      style={{
                        width: "100%", padding: "10px 12px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    {startDate && (
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                        Estimated end date: {computedEndDate}
                      </div>
                    )}
                  </div>
                  <Textarea
                    label="Reason (required)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your reason. For medical leave include diagnosis or nature of illness."
                  />
                </div>
              ) : (
                <>
                  {/* Fixed leave: start + end date */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <Input
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={minStartDate}
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || minStartDate}
                    />
                  </div>

                  {workingDays > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        padding: "10px 14px",
                        background: balanceInsufficient ? "rgba(239,68,68,0.08)" : "var(--accent-primary-bg)",
                        border: `1px solid ${balanceInsufficient ? "rgba(239,68,68,0.3)" : "var(--border-accent)"}`,
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: balanceInsufficient ? "var(--status-rejected)" : "var(--accent-primary)",
                        marginBottom: "16px",
                        fontWeight: 600,
                      }}
                    >
                      {balanceInsufficient
                        ? `⚠ Insufficient balance — need ${workingDays} days, you have ${selectedBalance?.remaining ?? 0} remaining`
                        : `= ${workingDays} working day${workingDays !== 1 ? "s" : ""}`}
                      {selectedBalance && !balanceInsufficient && (
                        <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 12 }}>
                          Remaining after: {(selectedBalance.remaining || 0) - workingDays} days
                        </span>
                      )}
                    </motion.div>
                  )}

                  <Textarea
                    label="Reason (optional)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe the reason for your leave..."
                  />
                </>
              )}
            </Card>
          </motion.div>
        )}

        {/* Step 1 — Conflict Check */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <Card>
              <h3 style={{ fontSize: "13px", color: "var(--accent-primary)", marginBottom: "20px", fontWeight: 700 }}>
                <Calendar size={14} style={{ display: "inline", marginRight: 8 }} />
                STEP 2 — CONFLICT CHECK
              </h3>
              <ConflictChecker result={conflict} loading={conflictLoading} />
              {conflict && !conflict.safe && (
                <div style={{ marginTop: "16px" }}>
                  <GreedyVisualizer result={greedy} loading={greedyLoading} onRun={runGreedy} compact />
                  {greedy?.found && greedy.recommendation && (
                    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          setStartDate(greedy.recommendation!.start)
                          setEndDate(greedy.recommendation!.end)
                          setStep(2)
                        }}
                      >
                        Use Recommended Dates
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                        Keep My Dates Anyway
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {!conflict && !conflictLoading && (
                <Button variant="primary" onClick={runConflictCheck}>Run Conflict Check</Button>
              )}
            </Card>
          </motion.div>
        )}

        {/* Step 2 — Relief Officer */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <Card>
              <h3 style={{ fontSize: "13px", color: "var(--accent-primary)", marginBottom: "20px", fontWeight: 700 }}>
                <Users size={14} style={{ display: "inline", marginRight: 8 }} />
                STEP 3 — RELIEF OFFICER (OPTIONAL)
              </h3>
              <Input
                label="Relief Officer Employee ID (optional)"
                type="number"
                value={reliefOfficerId}
                onChange={(e) => setReliefOfficerId(e.target.value)}
                placeholder="Enter colleague's employee ID"
              />
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "10px" }}>
                Leave blank if no relief officer is required.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Step 3 — Review & Submit */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <Card>
              <h3 style={{ fontSize: "13px", color: "var(--accent-primary)", marginBottom: "20px", fontWeight: 700 }}>
                <CheckCircle size={14} style={{ display: "inline", marginRight: 8 }} />
                STEP 4 — REVIEW & SUBMIT
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {[
                  { label: "Leave Type", value: selectedType?.name || "—" },
                  { label: "Start Date", value: startDate || "—" },
                  { label: "End Date", value: effectiveEndDate || "—" },
                  { label: "Duration", value: `${workingDays} working day${workingDays !== 1 ? "s" : ""}` },
                  { label: "Reason", value: reason || "Not provided" },
                  { label: "Relief Officer ID", value: reliefOfficerId || "None" },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{row.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", maxWidth: "60%", textAlign: "right" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {selectedBalance && !isOpenEnded && (
                <div style={{ padding: "10px 14px", background: "var(--accent-primary-bg)", border: "1px solid var(--border-accent)", borderRadius: "8px", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  You have <strong style={{ color: "var(--accent-primary)" }}>{selectedBalance.remaining} days</strong> remaining.
                  This request uses <strong style={{ color: "var(--accent-tertiary)" }}>{workingDays} days</strong>.
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                loading={applyMutation.isPending}
                disabled={applyMutation.isPending}
                style={{ width: "100%" }}
                onClick={() => applyMutation.mutate()}
              >
                Submit Leave Application
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          ← Back
        </Button>
        {step < STEPS.length - 1 && (
          <Button
            variant="primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  )
}

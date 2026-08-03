import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, Sparkles, ChevronRight, HelpCircle } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"

// ---------------------------------------------------------------------------
// Knowledge base — each entry has keywords to match against and a full answer
// ---------------------------------------------------------------------------
interface FaqEntry {
  keywords: string[]
  answer: string
  keyPoints: string[]
}

const FAQ: FaqEntry[] = [
  {
    keywords: ["annual leave", "how many days", "days entitled", "entitlement", "leave days", "how many annual", "days do i get", "annual leave days"],
    answer:
      "Your annual leave entitlement in NIMASA depends on your Grade Level (GL). Staff on GL 01–06 receive 21 working days per year. Those on GL 07–12 receive 28 working days, and staff on GL 13 and above receive 30 working days annually. These are counted in working days — weekends and public holidays are excluded.",
    keyPoints: [
      "GL 01–06: 21 working days per year",
      "GL 07–12: 28 working days per year",
      "GL 13 and above: 30 working days per year",
      "Days are calculated in working days only (no weekends or public holidays)",
      "You can check your remaining balance on the Leave Balance page",
    ],
  },
  {
    keywords: ["notice period", "advance notice", "how early", "how far in advance", "when to apply", "how long before"],
    answer:
      "Annual and casual leave applications must be submitted at least 7 working days before the intended start date. This gives your Head of Department enough time to plan staffing and review the request. For emergency situations such as medical leave or a family emergency, you may apply within 24 hours but must provide supporting documentation.",
    keyPoints: [
      "Annual / casual leave: submit at least 7 working days in advance",
      "Emergency / sick leave: apply within 24 hours of absence",
      "Medical leave requires a doctor's certificate from a recognised facility",
      "Late applications may be declined at the HOD's discretion",
    ],
  },
  {
    keywords: ["carry over", "carry forward", "unused leave", "rollover", "next year", "remaining days expire", "lapse"],
    answer:
      "Unused annual leave may be carried forward to the following year, but this is subject to your department head's approval and must be requested before the end of the leave year. The maximum carry-over is 15 days. Any unused leave beyond that limit will be forfeited. Carried-over days are shown on your Leave Balance page.",
    keyPoints: [
      "Maximum carry-over: 15 days (subject to HOD approval)",
      "Carry-over must be formally requested before the leave year ends",
      "Unused days beyond the limit are forfeited and cannot be redeemed",
      "Check your Leave Balance page for carried-forward days",
    ],
  },
  {
    keywords: ["rejected", "rejection", "declined", "not approved", "denied", "what if rejected", "leave refused"],
    answer:
      "If your leave request is rejected, you will receive an in-system notification explaining the reason. You can view the HOD's or HR's comment on your Leave History page by clicking on the specific request. You may discuss the rejection with your supervisor, amend your dates, and reapply. If you believe the rejection is unjustified, you may escalate to the HR department.",
    keyPoints: [
      "You are notified immediately when a leave is rejected",
      "The rejection reason is visible in your Leave History",
      "You may reapply after addressing the stated reason",
      "Escalate to HR if you believe the rejection was unfair",
    ],
  },
  {
    keywords: ["approval process", "how does approval work", "stages", "hod approval", "hr approval", "workflow", "two stage", "who approves"],
    answer:
      "All leave requests go through a two-stage approval process. In Stage 1, your Head of Department (HOD) reviews and approves or rejects the request. If the HOD approves, the request moves to Stage 2 where HR gives final confirmation. Leave is only active and official after HR completes the second stage. You receive a notification at each stage.",
    keyPoints: [
      "Stage 1: HOD (Head of Department) reviews and decides",
      "Stage 2: HR gives the final approval or rejection",
      "Leave is only active after both stages are completed",
      "You receive an in-system notification at every stage",
    ],
  },
  {
    keywords: ["sick leave", "medical leave", "sick", "ill", "illness", "hospital", "doctor", "medical certificate"],
    answer:
      "Sick leave requires a medical certificate from a government-recognised or NIMASA-approved health facility. Apply on ILMS as soon as possible and upload the supporting document within 48 hours of returning to work. Sick leave is tracked separately from your annual leave balance and does not reduce your annual leave entitlement.",
    keyPoints: [
      "Medical certificate required from a recognised health facility",
      "Apply on ILMS and upload the certificate within 48 hours of your return",
      "Sick leave does not count against your annual leave balance",
      "Repeated unexplained sick leave patterns may trigger an HR review",
    ],
  },
  {
    keywords: ["balance", "leave balance", "remaining", "how much leave left", "days left", "check balance"],
    answer:
      "Your leave balance shows a full breakdown of all leave types — your total entitlement, days already used this year, days carried forward from last year, and your remaining days. Navigate to Leave > Leave Balance in the sidebar to view your balance. The balance updates automatically whenever a leave request is approved.",
    keyPoints: [
      "Go to Leave > Leave Balance for your full breakdown",
      "Each leave type has its own separate balance",
      "Balances update in real time after each approved leave",
      "Contact HR if your balance looks incorrect",
    ],
  },
  {
    keywords: ["cancel", "cancellation", "withdraw", "cancel leave", "take back", "undo leave"],
    answer:
      "You can cancel a leave request yourself as long as it has not yet received final HR approval and your leave has not started. Go to Leave History, open the request, and click Cancel. If HR has already given final approval, you must contact HR directly to process the cancellation. Cancelled leave days are automatically credited back to your balance.",
    keyPoints: [
      "Self-cancellation is available for PENDING and HOD_APPROVED requests",
      "Once HR gives final approval, contact HR to cancel",
      "Cancelled days are credited back to your leave balance immediately",
      "HR is notified automatically when you cancel a request",
    ],
  },
  {
    keywords: ["maternity", "maternity leave", "pregnant", "pregnancy", "delivery"],
    answer:
      "Maternity leave for NIMASA female staff is 16 weeks (4 months), including a mandatory 6 weeks to be taken before the expected delivery date. Maternity leave is entirely separate from annual leave and does not reduce your annual leave balance. You will need to submit evidence of pregnancy and your expected delivery date to HR to initiate the process.",
    keyPoints: [
      "Duration: 16 weeks in total",
      "At least 6 weeks must be taken before the expected delivery date",
      "Does not reduce your annual leave balance",
      "Submit expected delivery date documentation to HR",
    ],
  },
  {
    keywords: ["paternity", "paternity leave", "father", "new baby", "newborn"],
    answer:
      "Male staff are entitled to 5 working days of paternity leave following the birth of a child. This is separate from annual leave and must be taken within 4 weeks of the birth. Provide the birth certificate or hospital letter to HR to activate paternity leave.",
    keyPoints: [
      "Duration: 5 working days",
      "Must be taken within 4 weeks of the birth",
      "Does not affect annual leave balance",
      "Provide birth certificate or hospital documentation to HR",
    ],
  },
  {
    keywords: ["anomaly", "flagged", "risk flag", "high risk", "anomaly detection", "what is anomaly", "why flagged"],
    answer:
      "The ILMS anomaly detection system monitors leave patterns across all staff to identify behaviour that deviates significantly from normal — such as frequent Monday/Friday absences, repeated short-term leaves, or sudden changes in leave frequency. A flag is not a disciplinary action; it simply prompts HR to take a closer look. HR will review context before taking any decision.",
    keyPoints: [
      "Anomaly flags are advisory — they are not disciplinary actions",
      "HR reviews each flagged employee individually and in context",
      "A HIGH-risk flag may result in an HR check-in or discussion",
      "Flags can be dismissed or resolved after HR review",
    ],
  },
  {
    keywords: ["password", "change password", "forgot password", "reset password", "first login"],
    answer:
      "On your first login, ILMS will automatically prompt you to change your temporary password (Nimasa@2025). Your new password must be at least 8 characters long and include a mix of uppercase, lowercase, numbers, and a special character. If you have forgotten your password, contact HR to have it reset — passwords cannot be reset self-service at this time.",
    keyPoints: [
      "Default first-login password: Nimasa@2025",
      "Change it immediately on first login when prompted",
      "New password must be strong (8+ chars, mixed case, number, special char)",
      "For forgotten passwords, contact HR Admin for a reset",
    ],
  },
  {
    keywords: ["apply leave", "how to apply", "submit leave", "request leave", "start leave"],
    answer:
      "To apply for leave, go to Leave > Apply Leave in the sidebar. Select the leave type, choose your start and end dates, provide a reason, and optionally assign a relief officer. Before submitting, you can use the Conflict Checker tool to verify there are no staffing conflicts. Once submitted, your HOD is notified immediately.",
    keyPoints: [
      "Navigate to Leave > Apply Leave",
      "Select leave type, dates, and reason",
      "Optionally assign a relief officer",
      "Use the Conflict Checker to avoid scheduling conflicts before applying",
      "Your HOD is notified automatically on submission",
    ],
  },
  {
    keywords: ["casual leave", "compassionate", "exam leave", "study leave", "types of leave", "leave type", "what types"],
    answer:
      "ILMS supports multiple leave types based on NIMASA policy, including Annual Leave, Sick/Medical Leave, Casual Leave (short-term personal needs), Maternity Leave, Paternity Leave, Compassionate Leave (bereavement or family emergency), and Study/Exam Leave. Each type has its own entitlement, rules, and documentation requirements. Check the Apply Leave page to see all available types.",
    keyPoints: [
      "Annual Leave — main yearly entitlement (GL-based)",
      "Sick / Medical Leave — requires medical certificate",
      "Casual Leave — for short personal needs (limited days)",
      "Compassionate Leave — bereavement or family emergency",
      "Maternity / Paternity Leave — separate from annual leave",
      "Study / Exam Leave — for approved academic activities",
    ],
  },
  {
    keywords: ["smart recommend", "greedy", "recommend dates", "best dates", "when to take leave", "suggest dates"],
    answer:
      "The Smart Recommend feature (accessible at Leave > Smart Recommend) uses an optimisation algorithm to suggest the best available leave dates for you. It analyses current team staffing levels, existing leave schedules, and the minimum required staff in your department to find a window where your leave will cause the least disruption and is most likely to be approved.",
    keyPoints: [
      "Go to Leave > Smart Recommend to use this feature",
      "It finds dates with the lowest staffing conflict",
      "Recommendations are based on real-time team leave data",
      "You can apply directly from the recommended dates",
    ],
  },
  {
    keywords: ["grade level", "gl", "what is grade level", "grade level affect", "gradeLevel"],
    answer:
      "Your Grade Level (GL) is your civil service seniority tier, ranging from GL 01 to GL 17. It directly determines your annual leave entitlement: GL 01–06 get 21 days, GL 07–12 get 28 days, and GL 13+ get 30 days. Your GL is set by HR when your account is created. If your GL appears wrong, contact HR Admin to have it corrected.",
    keyPoints: [
      "Grade Levels range from GL 01 to GL 17",
      "GL 01–06 → 21 days annual leave",
      "GL 07–12 → 28 days annual leave",
      "GL 13–17 → 30 days annual leave",
      "Your GL is assigned by HR — contact HR if it appears incorrect",
    ],
  },
]

const SUGGESTED_QUESTIONS = [
  "How many annual leave days am I entitled to?",
  "What is the leave approval process?",
  "Can I carry unused leave to next year?",
  "What happens if my leave is rejected?",
  "How do I apply for sick leave?",
]

// ---------------------------------------------------------------------------
// Fuzzy match — score each FAQ entry against the question
// ---------------------------------------------------------------------------
function findBestAnswer(question: string): FaqEntry | null {
  const q = question.toLowerCase().replace(/[^a-z0-9 ]/g, " ")
  const words = q.split(/\s+/).filter((w) => w.length > 2)

  let best: FaqEntry | null = null
  let bestScore = 0

  for (const entry of FAQ) {
    let score = 0
    for (const kw of entry.keywords) {
      if (q.includes(kw)) {
        score += kw.split(" ").length * 2  // longer phrase matches score higher
      } else {
        for (const word of words) {
          if (kw.includes(word)) score += 1
        }
      }
    }
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }

  return bestScore >= 2 ? best : null
}

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------
interface ChatMessage {
  id: number
  role: "user" | "assistant"
  text: string
  keyPoints?: string[]
  unmatched?: boolean
}

export function AiAssistantPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nextId, setNextId] = useState(1)
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  const submit = (question: string) => {
    const q = question.trim()
    if (!q || thinking) return

    setMessages((prev) => [...prev, { id: nextId, role: "user", text: q }])
    setNextId((n) => n + 1)
    setInput("")
    setThinking(true)

    // Small delay to feel natural, then resolve from knowledge base
    setTimeout(() => {
      const match = findBestAnswer(q)
      if (match) {
        setMessages((prev) => [
          ...prev,
          { id: nextId + 1, role: "assistant", text: match.answer, keyPoints: match.keyPoints },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId + 1,
            role: "assistant",
            text: "I don't have a specific answer for that question in my knowledge base. For detailed policy guidance, please contact your HR department directly or refer to the NIMASA Staff Leave Policy document.",
            keyPoints: [
              "Contact HR Admin for personalised policy questions",
              "Common questions are covered in this assistant",
              "Leave rules and balances are always visible on your dashboard",
            ],
            unmatched: true,
          },
        ])
      }
      setNextId((n) => n + 2)
      setThinking(false)
    }, 600)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "760px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Bot size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: "20px", marginBottom: "2px" }}>HR Policy Assistant</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Ask questions about leave policy, entitlements, and ILMS workflows.
          </p>
        </div>
      </div>

      {/* Chat window */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ minHeight: "360px", maxHeight: "500px", overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", margin: "auto", padding: "32px 16px" }}
            >
              <Sparkles size={36} color="var(--accent-primary)" style={{ marginBottom: "12px", opacity: 0.6 }} />
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                How can I help you today?
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Ask anything about leave entitlements, approvals, or NIMASA leave policy.
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
                {msg.role === "user" ? (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{
                      maxWidth: "72%",
                      padding: "10px 14px",
                      borderRadius: "14px 14px 4px 14px",
                      background: "linear-gradient(135deg, var(--accent-primary), #6F451F)",
                      color: "#fff",
                      fontSize: "14px",
                      lineHeight: 1.55,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                      background: "var(--accent-primary-bg)", border: "1px solid var(--border-accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {msg.unmatched
                        ? <HelpCircle size={15} color="var(--text-muted)" />
                        : <Bot size={15} color="var(--accent-primary)" />}
                    </div>
                    <div style={{
                      flex: 1, minWidth: 0,
                      padding: "14px 16px",
                      borderRadius: "4px 14px 14px 14px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      display: "flex", flexDirection: "column", gap: "10px",
                    }}>
                      <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--text-primary)", margin: 0 }}>
                        {msg.text}
                      </p>
                      {msg.keyPoints && msg.keyPoints.length > 0 && (
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.6px", marginBottom: "6px" }}>
                            KEY POINTS
                          </div>
                          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
                            {msg.keyPoints.map((pt, i) => (
                              <li key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "13px", color: "var(--text-secondary)" }}>
                                <ChevronRight size={12} color="var(--accent-primary)" style={{ marginTop: "3px", flexShrink: 0 }} />
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                background: "var(--accent-primary-bg)", border: "1px solid var(--border-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={15} color="var(--accent-primary)" />
              </div>
              <div style={{ padding: "14px 18px", borderRadius: "4px 14px 14px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", gap: "4px", alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                    style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-primary)" }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-default)",
          display: "flex",
          gap: "8px",
          alignItems: "flex-end",
          background: "var(--bg-surface)",
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                submit(input)
              }
            }}
            placeholder="Type your question… (Enter to send)"
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "var(--text-primary)",
              fontSize: "14px",
              fontFamily: "var(--font-body)",
              outline: "none",
              lineHeight: 1.5,
            }}
          />
          <Button
            variant="primary"
            icon={<Send size={14} />}
            disabled={!input.trim() || thinking}
            onClick={() => submit(input)}
          >
            Send
          </Button>
        </div>
      </Card>

      {/* Suggested questions (only when chat is empty) */}
      {messages.length === 0 && (
        <div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
            SUGGESTED QUESTIONS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => submit(q)}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "border-color 0.15s, color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-accent)"
                  e.currentTarget.style.color = "var(--accent-primary)"
                  e.currentTarget.style.background = "var(--accent-primary-bg)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)"
                  e.currentTarget.style.color = "var(--text-secondary)"
                  e.currentTarget.style.background = "var(--bg-surface)"
                }}
              >
                <ChevronRight size={13} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "0 16px" }}>
        This assistant uses a built-in NIMASA policy knowledge base. For complex or personal cases, contact your HR department directly.
      </div>
    </div>
  )
}

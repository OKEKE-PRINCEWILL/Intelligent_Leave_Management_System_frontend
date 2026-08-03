import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import { Modal } from "../../components/ui/Modal"
import { Button } from "../../components/ui/Button"
import { authApi } from "../../api/auth.api"
import { getApiErrorMessage } from "../../api/axios"
import { useAuthStore } from "../../store/auth.store"

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
  forceChange?: boolean
}

interface Requirements {
  length: boolean
  uppercase: boolean
  number: boolean
  special: boolean
}

function checkRequirements(pwd: string): Requirements {
  return {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  }
}

function strength(req: Requirements): { label: string; pct: number; color: string } {
  const met = Object.values(req).filter(Boolean).length
  if (met <= 1) return { label: "Weak", pct: 25, color: "var(--status-rejected)" }
  if (met === 2) return { label: "Fair", pct: 50, color: "var(--accent-tertiary)" }
  if (met === 3) return { label: "Strong", pct: 75, color: "#00D4FF" }
  return { label: "Very Strong", pct: 100, color: "var(--status-approved)" }
}

const reqLabels: Record<keyof Requirements, string> = {
  length: "At least 8 characters",
  uppercase: "One uppercase letter",
  number: "One number",
  special: "One special character",
}

export function ChangePasswordModal({ open, onClose, forceChange = false }: ChangePasswordModalProps) {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()
  const [current, setCurrent] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const req = checkRequirements(newPwd)
  const str = strength(req)
  const allReqMet = Object.values(req).every(Boolean)
  const pwdsMatch = newPwd === confirm && newPwd.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allReqMet) { setError("Password does not meet requirements"); return }
    if (!pwdsMatch) { setError("Passwords do not match"); return }
    setLoading(true)
    setError("")
    try {
      await authApi.changePassword({ currentPassword: current, newPassword: newPwd, confirmPassword: confirm })
      updateUser({ firstLogin: false })
      toast.success("Password changed successfully!")
      onClose()
      navigate("/dashboard")
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-base)",
    border: "1px solid var(--border-default)",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
    fontFamily: "var(--font-body)",
  }

  return (
    <Modal
      open={open}
      onClose={forceChange ? undefined : onClose}
      title="Change Password"
      dismissable={!forceChange}
      width={460}
    >
      {forceChange && (
        <div
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "12px",
            color: "var(--accent-tertiary)",
            marginBottom: "16px",
          }}
        >
          ⚠ You must change your password before continuing. This dialog cannot be dismissed.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Current password */}
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Current Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: "40px" }}
                placeholder="Your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: "40px" }}
                placeholder="New secure password"
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Strength meter */}
            {newPwd && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Strength</span>
                  <span style={{ fontSize: "11px", color: str.color, fontWeight: 600 }}>{str.label}</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
                  <motion.div
                    animate={{ width: `${str.pct}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ height: "100%", background: str.color, borderRadius: "2px", transition: "background 0.3s ease" }}
                  />
                </div>
                {/* Requirements checklist */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                  {(Object.keys(req) as Array<keyof Requirements>).map((key) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                      {req[key] ? (
                        <CheckCircle size={12} color="var(--status-approved)" />
                      ) : (
                        <XCircle size={12} color="var(--text-muted)" />
                      )}
                      <span style={{ color: req[key] ? "var(--status-approved)" : "var(--text-muted)" }}>
                        {reqLabels[key]}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={{
                ...inputStyle,
                borderColor: confirm && !pwdsMatch ? "var(--status-rejected)" : undefined,
              }}
              placeholder="Repeat new password"
            />
            {confirm && !pwdsMatch && (
              <span style={{ fontSize: "11px", color: "var(--status-rejected)", marginTop: "4px", display: "block" }}>
                Passwords do not match
              </span>
            )}
          </div>

          {error && (
            <div
              style={{
                padding: "10px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "8px",
                color: "var(--status-rejected)",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!allReqMet || !pwdsMatch || loading}
            style={{ width: "100%", marginTop: "4px" }}
          >
            Change Password
          </Button>
        </div>
      </form>
    </Modal>
  )
}

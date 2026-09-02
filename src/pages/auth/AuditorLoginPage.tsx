import React, { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Shield, UserRound, X } from "lucide-react"
import { authApi } from "../../api/auth.api"
import { getApiErrorMessage } from "../../api/axios"
import { useAuthStore } from "../../store/auth.store"
import { ChangePasswordModal } from "./ChangePasswordModal"

export function AuditorLoginPage() {
  const { isAuthenticated, setAuth, user } = useAuthStore()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showRecovery, setShowRecovery] = useState(false)
  const [showChangePwd, setShowChangePwd] = useState(false)

  if (isAuthenticated && !user?.firstLogin && !user?.mustChangePassword) {
    return <Navigate to="/dashboard" replace />
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const authData = await authApi.auditorLogin({ username, password })
      setAuth(authData.user, authData.token, authData.refreshToken)
      if (authData.user.firstLogin || authData.user.mustChangePassword) {
        setShowChangePwd(true)
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    background: "#F9FAFB",
    border: "1.5px solid #E5E7EB",
    borderRadius: "10px",
    padding: "11px 14px 11px 40px",
    fontSize: "14px",
    color: "#111827",
    outline: "none",
    fontFamily: "var(--font-body)",
    boxSizing: "border-box",
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", background: "linear-gradient(155deg, #FFFFFF 0%, #F7F1E8 100%)" }}>
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        style={{ width: "100%", maxWidth: "390px" }}
      >
        <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "38px", boxShadow: "0 24px 64px rgba(139,90,43,0.12), 0 4px 16px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #111827, #8B5A2B, #111827)" }} />
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ width: "58px", height: "58px", borderRadius: "16px", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 22px rgba(17,24,39,0.25)" }}>
              <Shield size={26} color="#F8E7C9" />
            </div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", color: "#111827", marginBottom: "5px" }}>Auditor Login</h1>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Use your private auditor username and password.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>Auditor Username</label>
              <div style={{ position: "relative" }}>
                <UserRound size={14} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" placeholder="Private username" style={fieldStyle} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} required placeholder="Password" style={{ ...fieldStyle, paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowPassword((p) => !p)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex" }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#DC2626", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertTriangle size={13} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "#374151" : "#111827", border: "none", borderRadius: "12px", color: "#FFFFFF", fontSize: "15px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-heading)" }}>
              {loading ? "Authenticating..." : "Sign In as Auditor"}
            </button>

            <div style={{ textAlign: "center", fontSize: "12px", color: "#6B7280", lineHeight: 1.5 }}>
              Forgot your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("")
                  setSuccess("")
                  setShowRecovery(true)
                }}
                style={{ padding: 0, border: "none", background: "none", color: "#111827", fontWeight: 800, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
              >
                Use emergency recovery
              </button>
            </div>

            <AnimatePresence>
              {success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.22)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#047857", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <CheckCircle2 size={14} style={{ marginTop: "2px", flexShrink: 0 }} />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "18px", fontSize: "12px" }}>
          <Link to="/login" style={{ color: "#8B5A2B", fontWeight: 700, textDecoration: "none" }}>Back to employee login</Link>
        </div>
      </motion.form>

      <AuditorRecoveryDialog
        open={showRecovery}
        initialUsername={username}
        onClose={() => setShowRecovery(false)}
        onRecovered={(recoveredUsername, temporaryPassword, message) => {
          setUsername(recoveredUsername)
          setPassword(temporaryPassword)
          setSuccess(message)
          setShowRecovery(false)
        }}
      />
      <ChangePasswordModal open={showChangePwd} forceChange onClose={() => setShowChangePwd(false)} />
    </div>
  )
}

interface AuditorRecoveryDialogProps {
  open: boolean
  initialUsername: string
  onClose: () => void
  onRecovered: (username: string, temporaryPassword: string, message: string) => void
}

function AuditorRecoveryDialog({
  open,
  initialUsername,
  onClose,
  onRecovered,
}: AuditorRecoveryDialogProps) {
  const [username, setUsername] = useState(initialUsername)
  const [recoveryKey, setRecoveryKey] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showSecrets, setShowSecrets] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  React.useEffect(() => {
    if (open) {
      setUsername(initialUsername)
      setRecoveryKey("")
      setNewPassword("")
      setConfirmPassword("")
      setShowSecrets(false)
      setError("")
    }
  }, [initialUsername, open])

  const submitRecovery = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Temporary password and confirmation do not match.")
      return
    }

    setLoading(true)
    try {
      const result = await authApi.recoverAuditor({
        username: username.trim(),
        recoveryKey: recoveryKey.trim(),
        newPassword,
        confirmPassword,
      })
      onRecovered(
        username.trim(),
        newPassword,
        result.message || "Recovery completed. Sign in with your temporary password.",
      )
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const recoveryFieldStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: "1.5px solid #E5E7EB",
    borderRadius: "10px",
    background: "#F9FAFB",
    color: "#111827",
    padding: "11px 40px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "var(--font-body)",
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auditor-recovery-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loading) onClose()
          }}
          style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(17,24,39,0.72)", backdropFilter: "blur(5px)" }}
        >
          <motion.form
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            onSubmit={submitRecovery}
            style={{ width: "100%", maxWidth: "460px", maxHeight: "90vh", overflowY: "auto", background: "#FFFFFF", borderRadius: "20px", padding: "28px", boxShadow: "0 28px 80px rgba(0,0,0,0.28)", position: "relative" }}
          >
            <button type="button" aria-label="Close recovery dialog" disabled={loading} onClick={onClose} style={{ position: "absolute", top: "18px", right: "18px", border: "none", background: "#F3F4F6", color: "#4B5563", borderRadius: "8px", width: "32px", height: "32px", display: "grid", placeItems: "center", cursor: loading ? "not-allowed" : "pointer" }}>
              <X size={16} />
            </button>

            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#111827", display: "grid", placeItems: "center", marginBottom: "16px" }}>
              <KeyRound size={22} color="#F8E7C9" />
            </div>
            <h2 id="auditor-recovery-title" style={{ margin: "0 42px 6px 0", color: "#111827", fontSize: "21px", fontFamily: "var(--font-heading)" }}>Emergency account recovery</h2>
            <p style={{ margin: "0 0 20px", color: "#6B7280", fontSize: "13px", lineHeight: 1.55 }}>
              Use the offline one-time recovery key issued for the Auditor account. The key is consumed after use and must be rotated before it can be used again.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <RecoveryField label="Auditor Username" icon={<UserRound size={14} />}>
                <input autoFocus required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Private username" style={recoveryFieldStyle} />
              </RecoveryField>

              <RecoveryField label="One-time Recovery Key" icon={<KeyRound size={14} />}>
                <input required minLength={24} autoComplete="off" type={showSecrets ? "text" : "password"} value={recoveryKey} onChange={(event) => setRecoveryKey(event.target.value)} placeholder="At least 24 characters" style={recoveryFieldStyle} />
              </RecoveryField>

              <RecoveryField label="Temporary Password" icon={<Lock size={14} />}>
                <input required minLength={12} autoComplete="new-password" type={showSecrets ? "text" : "password"} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="12+ characters with mixed character types" style={recoveryFieldStyle} />
              </RecoveryField>

              <RecoveryField label="Confirm Temporary Password" icon={<Lock size={14} />}>
                <input required minLength={12} autoComplete="new-password" type={showSecrets ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat temporary password" style={recoveryFieldStyle} />
              </RecoveryField>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4B5563", fontSize: "12px", cursor: "pointer" }}>
                <input type="checkbox" checked={showSecrets} onChange={(event) => setShowSecrets(event.target.checked)} />
                Show recovery key and temporary password
              </label>

              {error && (
                <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "10px", padding: "10px 12px", color: "#DC2626", fontSize: "13px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <AlertTriangle size={14} style={{ marginTop: "2px", flexShrink: 0 }} />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", border: "none", borderRadius: "11px", background: loading ? "#374151" : "#111827", color: "#FFFFFF", fontWeight: 800, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-heading)" }}>
                {loading ? "Recovering account..." : "Reset Auditor Password"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function RecoveryField({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", marginBottom: "6px", color: "#374151", fontSize: "12px", fontWeight: 700 }}>{label}</span>
      <span style={{ position: "relative", display: "block" }}>
        <span style={{ position: "absolute", zIndex: 1, left: "13px", top: "50%", transform: "translateY(-50%)", display: "flex", color: "#9CA3AF", pointerEvents: "none" }}>{icon}</span>
        {children}
      </span>
    </label>
  )
}

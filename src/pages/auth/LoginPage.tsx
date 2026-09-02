import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Shield, AlertTriangle, User, Lock, Building2 } from "lucide-react"
import { useAuthStore } from "../../store/auth.store"
import { authApi } from "../../api/auth.api"
import { getApiErrorMessage } from "../../api/axios"
import { ChangePasswordModal } from "./ChangePasswordModal"

const IT_SUPPORT_URL = import.meta.env.VITE_IT_SUPPORT_URL || "https://nimasa.gov.ng/contact-us/"

function OrbitalGraphic() {
  return (
    <div style={{ position: "relative", width: "260px", height: "260px", margin: "0 auto 36px", flexShrink: 0 }}>
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px dashed rgba(139,90,43,0.28)" }}
      >
        <div style={{
          position: "absolute", top: "50%", right: "-5px",
          width: "10px", height: "10px", borderRadius: "50%",
          background: "#8B5A2B", transform: "translateY(-50%)",
          boxShadow: "0 0 12px #8B5A2B",
        }} />
      </motion.div>

      {/* Mid ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", inset: "34px", borderRadius: "50%", border: "1px dashed rgba(124,58,237,0.38)" }}
      >
        <div style={{
          position: "absolute", top: "-5px", left: "50%",
          width: "10px", height: "10px", borderRadius: "50%",
          background: "#7C3AED", transform: "translateX(-50%)",
          boxShadow: "0 0 12px #7C3AED",
        }} />
      </motion.div>

      {/* Inner ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", inset: "72px", borderRadius: "50%", border: "1px solid rgba(169,100,42,0.45)" }}
      >
        <div style={{
          position: "absolute", bottom: "-5px", left: "50%",
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#A9642A", transform: "translateX(-50%)",
          boxShadow: "0 0 10px #A9642A",
        }} />
      </motion.div>

      {/* Glow backdrop */}
      <div style={{
        position: "absolute", inset: "88px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,90,43,0.3) 0%, rgba(124,58,237,0.16) 60%, transparent 100%)",
        filter: "blur(6px)",
      }} />

      {/* Center shield */}
      <div style={{
        position: "absolute", inset: "96px", borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(139,90,43,0.22), rgba(124,58,237,0.22))",
        border: "1.5px solid rgba(139,90,43,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 32px rgba(139,90,43,0.4), inset 0 0 16px rgba(139,90,43,0.12)",
        animation: "pulse-ring 3s infinite",
      }}>
        <Shield size={28} color="#D8B98C" />
      </div>
    </div>
  )
}

export function LoginPage() {
  const { isAuthenticated, setAuth, user } = useAuthStore()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [shake, setShake] = useState(false)
  const [showChangePwd, setShowChangePwd] = useState(false)

  useEffect(() => {
    authApi.getLoginDepartments().then(setDepartments).catch(() => setDepartments([]))
  }, [])

  if (isAuthenticated && !user?.firstLogin && !user?.mustChangePassword) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const authData = await authApi.login({
        firstName,
        lastName,
        departmentId: Number(departmentId),
        password,
      })
      setAuth(authData.user, authData.token, authData.refreshToken)
      // Force a password change on first login OR when the 90-day rotation is due.
      if (authData.user.firstLogin || authData.user.mustChangePassword) {
        setShowChangePwd(true)
      }
    } catch (err) {
      const msg = getApiErrorMessage(err)
      setError(msg)
      setShake(true)
      setTimeout(() => setShake(false), 600)
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
    transition: "all 0.18s ease",
  }

  const iconWrap: React.CSSProperties = {
    position: "absolute",
    left: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9CA3AF",
    pointerEvents: "none",
    display: "flex",
  }

  const focusField = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#8B5A2B"
    e.currentTarget.style.background = "#FFFFFF"
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,90,43,0.12)"
  }
  const blurField = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#E5E7EB"
    e.currentTarget.style.background = "#F9FAFB"
    e.currentTarget.style.boxShadow = "none"
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "55fr 45fr" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        background: "linear-gradient(160deg, #1A120B 0%, #241709 45%, #33220F 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 56px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient glow orbs */}
        <div style={{
          position: "absolute", width: "700px", height: "700px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,90,43,0.16) 0%, transparent 65%)",
          top: "-250px", left: "-250px", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 65%)",
          bottom: "-150px", right: "-150px", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(169,100,42,0.1) 0%, transparent 65%)",
          bottom: "20%", left: "5%", pointerEvents: "none",
        }} />

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(139,90,43,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,90,43,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          pointerEvents: "none",
        }} />

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          style={{ textAlign: "center", maxWidth: "460px", width: "100%", position: "relative" }}
        >
          <OrbitalGraphic />

          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "56px", fontWeight: 700,
            color: "#FFFFFF", letterSpacing: "7px", lineHeight: 1,
            marginBottom: "12px",
            textShadow: "0 0 48px rgba(139,90,43,0.55)",
          }}>ILMS</div>

          <div style={{
            fontFamily: "var(--font-heading)", fontSize: "17px", fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
          }}>
            Intelligent Leave Management System
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        background: "linear-gradient(155deg, #FFFFFF 0%, #F7F1E8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 48px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative orbs */}
        <div style={{
          position: "absolute", top: "5%", right: "-120px",
          width: "420px", height: "420px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,90,43,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "5%", left: "-100px",
          width: "320px", height: "320px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <motion.form
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "384px",
            animation: shake ? "shake 0.5s ease" : undefined,
          }}
        >
          {/* Card */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 24px 64px rgba(139,90,43,0.12), 0 4px 16px rgba(0,0,0,0.05)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Animated shimmer top stripe */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "3px",
              background: "linear-gradient(90deg, #6F451F, #8B5A2B, #7C3AED, #8B5A2B, #6F451F)",
              backgroundSize: "300% 100%",
              animation: "shimmer 4s linear infinite",
            }} />

            {/* Shield icon header */}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
                style={{
                  width: "58px", height: "58px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #F0E2CC, #E6D2B0)",
                  border: "1.5px solid rgba(139,90,43,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 4px 14px rgba(139,90,43,0.18)",
                }}
              >
                <Shield size={26} color="#8B5A2B" />
              </motion.div>

              <h1 style={{
                fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700,
                color: "#111827", marginBottom: "5px",
              }}>Welcome Back</h1>
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                Sign in to your ILMS account
              </p>
            </div>

            {/* First-login banner */}
            <AnimatePresence>
              {user?.firstLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{
                    background: "rgba(245,158,11,0.07)",
                    border: "1px solid rgba(245,158,11,0.22)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "12px", color: "#D97706",
                    marginBottom: "20px",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}
                >
                  <AlertTriangle size={13} />
                  First login detected — password change required
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* First Name */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>
                  First Name
                </label>
                <div style={{ position: "relative" }}>
                  <div style={iconWrap}><User size={14} /></div>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="e.g. Adebayo"
                    style={fieldStyle}
                    onFocus={focusField}
                    onBlur={blurField}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>
                  Last Name
                </label>
                <div style={{ position: "relative" }}>
                  <div style={iconWrap}><User size={14} /></div>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="e.g. Okafor"
                    style={fieldStyle}
                    onFocus={focusField}
                    onBlur={blurField}
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>
                  Department
                </label>
                <div style={{ position: "relative" }}>
                  <div style={iconWrap}><Building2 size={14} /></div>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    required
                    style={{ ...fieldStyle, paddingRight: "14px", cursor: "pointer", appearance: "none" }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#8B5A2B"
                      e.currentTarget.style.background = "#FFFFFF"
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,90,43,0.12)"
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB"
                      e.currentTarget.style.background = "#F9FAFB"
                      e.currentTarget.style.boxShadow = "none"
                    }}
                  >
                    <option value="" disabled>Select your department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px", letterSpacing: "0.2px" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <div style={iconWrap}><Lock size={14} /></div>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    style={{ ...fieldStyle, paddingRight: "44px" }}
                    onFocus={focusField}
                    onBlur={blurField}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: "absolute", right: "12px", top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none",
                      color: "#9CA3AF", cursor: "pointer",
                      display: "flex", alignItems: "center", padding: "4px",
                    }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.18)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontSize: "13px", color: "#DC2626",
                      display: "flex", alignItems: "center", gap: "8px",
                    }}
                  >
                    <AlertTriangle size={13} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: loading
                    ? "#A9742F"
                    : "linear-gradient(135deg, #6F451F 0%, #8B5A2B 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "0.3px",
                  transition: "all 0.18s ease",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(139,90,43,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "4px",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow = "0 8px 22px rgba(139,90,43,0.42)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,90,43,0.35)"
                  }
                }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M8 2A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  "Sign In to ILMS"
                )}
              </button>

              <div style={{ textAlign: "center", fontSize: "12px", color: "#6B7280" }}>
                Forgot your password?{" "}
                <a
                  href={IT_SUPPORT_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#8B5A2B", fontWeight: 700, textDecoration: "none" }}
                >
                  Contact IT Support
                </a>
              </div>
            </div>
          </div>
        </motion.form>
      </div>

      <ChangePasswordModal open={showChangePwd} forceChange onClose={() => setShowChangePwd(false)} />
    </div>
  )
}

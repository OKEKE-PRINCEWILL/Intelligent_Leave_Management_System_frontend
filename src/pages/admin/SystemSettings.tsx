import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Settings, Save, RefreshCw, Shield, Sliders, Clock } from "lucide-react"
import toast from "react-hot-toast"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { adminApi } from "../../api/admin.api"
import { notificationsApi } from "../../api/notifications.api"
import { getApiErrorMessage } from "../../api/axios"

interface SettingsForm {
  anomalyThreshold: number
  maxLeaveDaysPerYear: number
  maxConsecutiveDays: number
  rateLimitRequestsPerMinute: number
  rateLimitWindowSeconds: number
  jwtExpiryMinutes: number
  refreshTokenExpiryDays: number
  passwordExpiryDays: number
  auditRetentionDays: number
  enableEmailNotifications: boolean
  enableAnomalyAlerts: boolean
}

const defaults: SettingsForm = {
  anomalyThreshold: 0.4,
  maxLeaveDaysPerYear: 30,
  maxConsecutiveDays: 14,
  rateLimitRequestsPerMinute: 60,
  rateLimitWindowSeconds: 60,
  jwtExpiryMinutes: 60,
  refreshTokenExpiryDays: 7,
  passwordExpiryDays: 90,
  auditRetentionDays: 365,
  enableEmailNotifications: true,
  enableAnomalyAlerts: true,
}

export function SystemSettings() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<SettingsForm>({ ...defaults })
  const [isDirty, setIsDirty] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: adminApi.getSettings,
  })

  useEffect(() => {
    if (settings) {
      const loaded: SettingsForm = {
        anomalyThreshold: settings.anomalyThreshold ?? defaults.anomalyThreshold,
        maxLeaveDaysPerYear: settings.maxLeaveDaysPerYear ?? defaults.maxLeaveDaysPerYear,
        maxConsecutiveDays: settings.maxConsecutiveDays ?? defaults.maxConsecutiveDays,
        rateLimitRequestsPerMinute: settings.rateLimitRequestsPerMinute ?? defaults.rateLimitRequestsPerMinute,
        rateLimitWindowSeconds: settings.rateLimitWindowSeconds ?? defaults.rateLimitWindowSeconds,
        jwtExpiryMinutes: settings.jwtExpiryMinutes ?? defaults.jwtExpiryMinutes,
        refreshTokenExpiryDays: settings.refreshTokenExpiryDays ?? defaults.refreshTokenExpiryDays,
        passwordExpiryDays: settings.passwordExpiryDays ?? defaults.passwordExpiryDays,
        auditRetentionDays: settings.auditRetentionDays ?? defaults.auditRetentionDays,
        enableEmailNotifications: settings.enableEmailNotifications ?? defaults.enableEmailNotifications,
        enableAnomalyAlerts: settings.enableAnomalyAlerts ?? defaults.enableAnomalyAlerts,
      }
      setForm(loaded)
      setIsDirty(false)
    }
  }, [settings])

  const updateMutation = useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => {
      toast.success("Settings saved successfully.")
      queryClient.invalidateQueries({ queryKey: ["system-settings"] })
      setIsDirty(false)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const testEmailMutation = useMutation({
    mutationFn: notificationsApi.sendTestEmail,
    onSuccess: () => toast.success("Test email request sent. Check the user's inbox."),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const update = (key: keyof SettingsForm, value: number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const anomalyLabel = form.anomalyThreshold < 0.3 ? "High Sensitivity" : form.anomalyThreshold < 0.6 ? "Medium Sensitivity" : "Low Sensitivity"

  if (isLoading) return <SkeletonCard rows={6} />

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>System Settings</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Configure anomaly detection, leave policies, rate limiting, and security parameters.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Save size={14} />}
          loading={updateMutation.isPending}
          disabled={!isDirty}
          onClick={() => updateMutation.mutate(form as unknown as Record<string, unknown>)}
        >
          Save Changes
        </Button>
      </div>

      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: "10px 16px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: "8px", fontSize: "13px", color: "var(--accent-tertiary)", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <RefreshCw size={13} />
          You have unsaved changes.
        </motion.div>
      )}

      {/* Anomaly Detection */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sliders size={16} color="var(--risk-high)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>Anomaly Detection Engine</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Controls how aggressively the engine flags leave patterns</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Anomaly Risk Threshold</span>
              <span style={{ color: "var(--risk-high)", fontWeight: 600 }}>{anomalyLabel} ({form.anomalyThreshold.toFixed(2)})</span>
            </label>
            <input
              type="range" min="0" max="1" step="0.05"
              value={form.anomalyThreshold}
              onChange={(e) => update("anomalyThreshold", parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--risk-high)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>0.0 — Very Sensitive (more flags)</span>
              <span>1.0 — Low Sensitivity (fewer flags)</span>
            </div>
          </div>

          <div style={{ padding: "14px", background: "var(--bg-elevated)", borderRadius: "10px", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>Anomaly Alerts</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Send alerts when high-risk employees are detected during scans</div>
            </div>
            <button
              onClick={() => update("enableAnomalyAlerts", !form.enableAnomalyAlerts)}
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                background: form.enableAnomalyAlerts ? "var(--status-approved)" : "var(--border-default)",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "white",
                position: "absolute",
                top: "3px",
                left: form.enableAnomalyAlerts ? "23px" : "3px",
                transition: "left 0.2s",
              }} />
            </button>
          </div>
        </div>
      </Card>

      {/* Leave Policy */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(139,90,43,0.1)", border: "1px solid rgba(139,90,43,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Settings size={16} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>Leave Policy</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Annual leave limits and consecutive day restrictions</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Max Annual Leave Days</span>
              <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{form.maxLeaveDaysPerYear} days</span>
            </label>
            <input
              type="range" min="10" max="60" step="1"
              value={form.maxLeaveDaysPerYear}
              onChange={(e) => update("maxLeaveDaysPerYear", Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent-primary)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Max Consecutive Days</span>
              <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{form.maxConsecutiveDays} days</span>
            </label>
            <input
              type="range" min="3" max="30" step="1"
              value={form.maxConsecutiveDays}
              onChange={(e) => update("maxConsecutiveDays", Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent-primary)" }}
            />
          </div>
        </div>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={16} color="var(--accent-secondary)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>Rate Limiting</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>API request throttling configuration</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Requests per Window</span>
              <span style={{ color: "var(--accent-secondary)", fontWeight: 600 }}>{form.rateLimitRequestsPerMinute}</span>
            </label>
            <input
              type="range" min="10" max="300" step="10"
              value={form.rateLimitRequestsPerMinute}
              onChange={(e) => update("rateLimitRequestsPerMinute", Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent-secondary)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Window Size (seconds)</span>
              <span style={{ color: "var(--accent-secondary)", fontWeight: 600 }}>{form.rateLimitWindowSeconds}s</span>
            </label>
            <input
              type="range" min="10" max="300" step="10"
              value={form.rateLimitWindowSeconds}
              onChange={(e) => update("rateLimitWindowSeconds", Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent-secondary)" }}
            />
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={16} color="var(--status-approved)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>Security & Audit</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Password rotation, token expiry, and audit retention settings</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Password Expiry</span>
              <span style={{ color: "var(--status-approved)", fontWeight: 600 }}>{form.passwordExpiryDays}d</span>
            </label>
            <input
              type="range" min="30" max="365" step="5"
              value={form.passwordExpiryDays}
              onChange={(e) => update("passwordExpiryDays", Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--status-approved)" }}
            />
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
              Users must change passwords after this many days.
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>JWT Expiry</span>
              <span style={{ color: "var(--status-approved)", fontWeight: 600 }}>{form.jwtExpiryMinutes}m</span>
            </label>
            <input
              type="range" min="15" max="480" step="15"
              value={form.jwtExpiryMinutes}
              onChange={(e) => update("jwtExpiryMinutes", Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--status-approved)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Refresh Token</span>
              <span style={{ color: "var(--status-approved)", fontWeight: 600 }}>{form.refreshTokenExpiryDays}d</span>
            </label>
            <input
              type="range" min="1" max="30" step="1"
              value={form.refreshTokenExpiryDays}
              onChange={(e) => update("refreshTokenExpiryDays", Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--status-approved)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Audit Retention</span>
              <span style={{ color: "var(--status-approved)", fontWeight: 600 }}>{form.auditRetentionDays}d</span>
            </label>
            <input
              type="range" min="30" max="730" step="30"
              value={form.auditRetentionDays}
              onChange={(e) => update("auditRetentionDays", Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--status-approved)" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "16px", padding: "14px", background: "var(--bg-elevated)", borderRadius: "10px", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>Email Notifications</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Send email alerts for leave status changes and anomaly flags</div>
          </div>
          <button
            onClick={() => update("enableEmailNotifications", !form.enableEmailNotifications)}
            style={{
              width: "44px", height: "24px", borderRadius: "12px",
              background: form.enableEmailNotifications ? "var(--status-approved)" : "var(--border-default)",
              border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
            }}
          >
            <div style={{
              width: "18px", height: "18px", borderRadius: "50%", background: "white",
              position: "absolute", top: "3px",
              left: form.enableEmailNotifications ? "23px" : "3px", transition: "left 0.2s",
            }} />
          </button>
        </div>

        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="ghost"
            icon={<Shield size={14} />}
            loading={testEmailMutation.isPending}
            onClick={() => testEmailMutation.mutate()}
          >
            Send Test Email
          </Button>
        </div>
      </Card>
    </div>
  )
}

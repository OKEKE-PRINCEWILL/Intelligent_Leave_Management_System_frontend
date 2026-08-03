import { motion } from "framer-motion"
import { Card } from "../../components/ui/Card"
import { useAuthStore } from "../../store/auth.store"

export function UserProfile() {
  const { user } = useAuthStore()

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      HR_ADMIN: "var(--accent-secondary)",
      HOD: "var(--accent-primary)",
      AUDITOR: "var(--accent-tertiary)",
      EMPLOYEE: "var(--text-muted)",
    }
    return colors[role] || "var(--text-muted)"
  }

  const roleLabel = (role?: string) =>
    role === "HR_ADMIN" ? "HR Admin" : role === "HOD" ? "Head of Department" : role === "AUDITOR" ? "Administrator" : "Employee"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>My Profile</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>View your account details.</p>
      </div>

      {/* Profile card */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(139,90,43,0.2), rgba(124,58,237,0.2))",
              border: "2px solid var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--accent-primary)",
              flexShrink: 0,
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </motion.div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>{user?.email}</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                color: roleBadge(user?.role || ""),
                background: `${roleBadge(user?.role || "")}15`,
                border: `1px solid ${roleBadge(user?.role || "")}40`,
                borderRadius: "999px",
                padding: "3px 10px",
              }}>
                {roleLabel(user?.role)}
              </span>
              {user?.staffId && (
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {user.staffId}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border-default)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
          {[
            { label: "Department", value: user?.departmentName || "—" },
            { label: "Position", value: user?.roleTitle || user?.position || "—" },
            { label: "Phone", value: user?.phone || user?.phoneNumber || "—" },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>{item.label}</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}

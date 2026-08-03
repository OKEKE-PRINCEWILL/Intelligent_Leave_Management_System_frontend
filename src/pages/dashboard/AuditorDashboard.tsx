import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Shield, CheckCircle, AlertTriangle, BarChart2 } from "lucide-react"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { AuditHashNode } from "../../components/algorithms/AuditHashNode"
import { auditApi } from "../../api/audit.api"
import { analyticsApi } from "../../api/analytics.api"

export function AuditorDashboard() {
  const { data: audit } = useQuery({ queryKey: ["audit-trail"], queryFn: () => auditApi.getTrail({}) })
  const { data: approval } = useQuery({ queryKey: ["approval-rate"], queryFn: analyticsApi.getApprovalRate })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Administrator Dashboard</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Read-only analytics and tamper-evident audit chain viewer.
        </p>
      </motion.div>

      {/* Chain integrity banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: "16px 20px",
          background: audit?.chainIntact === false ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.08)",
          border: `1px solid ${audit?.chainIntact === false ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.25)"}`,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          animation: audit?.chainIntact === false ? "pulse-ring 2s infinite" : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {audit?.chainIntact === false ? (
            <AlertTriangle size={22} color="var(--status-rejected)" />
          ) : (
            <CheckCircle size={22} color="var(--status-approved)" />
          )}
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: audit?.chainIntact === false ? "var(--status-rejected)" : "var(--status-approved)" }}>
              {audit?.chainIntact === false ? "CHAIN INTEGRITY VIOLATED" : "AUDIT CHAIN INTACT"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {audit?.entries?.length || 0} verified entries
            </div>
          </div>
        </div>
        <Link to="/audit/trail"><Button size="sm" variant="ghost">View Full Chain</Button></Link>
      </motion.div>

      {/* Approval stats */}
      {approval && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
          {[
            { label: "Total Requests", value: approval.totalRequests, color: "var(--accent-primary)" },
            { label: "Approved", value: approval.approved, color: "var(--status-approved)" },
            { label: "Rejected", value: approval.rejected, color: "var(--status-rejected)" },
            { label: "Approval Rate", value: `${Math.round(approval.approvalRate)}%`, color: "var(--status-approved)" },
          ].map((item) => (
            <Card key={item.label}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>{item.label}</div>
              <div style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-display)", color: item.color }}>
                {item.value}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Recent audit entries */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={15} />
            RECENT AUDIT EVENTS
          </h3>
          <Link to="/audit/trail"><Button size="sm" variant="ghost">Full Trail</Button></Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(audit?.entries || []).slice(0, 8).map((entry) => (
            <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid var(--border-default)" }}>
              <AuditHashNode entry={entry} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{entry.action}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{entry.userLabel} · {entry.entityLabel} · {entry.createdAt}</div>
              </div>
            </div>
          ))}
          {(!audit?.entries || audit.entries.length === 0) && (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "16px" }}>
              No audit entries available.
            </p>
          )}
        </div>
      </Card>

      {/* Analytics link */}
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px" }}>
          ANALYTICS (READ-ONLY)
        </h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/analytics/departments"><Button variant="ghost" icon={<BarChart2 size={15} />}>Department Analytics</Button></Link>
          <Link to="/analytics/forecast"><Button variant="ghost" icon={<BarChart2 size={15} />}>Forecast</Button></Link>
          <Link to="/audit/trail"><Button variant="ghost" icon={<Shield size={15} />}>Audit Trail</Button></Link>
        </div>
      </Card>
    </div>
  )
}

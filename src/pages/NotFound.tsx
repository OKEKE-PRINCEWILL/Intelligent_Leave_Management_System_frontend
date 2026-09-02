import React from "react"
import { Link } from "react-router-dom"
import { Compass, ArrowLeft } from "lucide-react"

/**
 * Standalone 404 page (rendered outside the app shell, so it works whether or
 * not the visitor is signed in).
 */
export function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-primary)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
          color: "#fff",
        }}
      >
        <Compass size={34} />
      </div>

      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          letterSpacing: "2px",
          color: "var(--text-muted)",
          margin: "0 0 8px",
        }}
      >
        ERROR 404
      </p>

      <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 12px" }}>
        Page not found
      </h1>

      <p style={{ color: "var(--text-secondary)", maxWidth: "440px", margin: "0 0 28px", lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or may have been moved. Check
        the address, or head back to your dashboard.
      </p>

      <Link
        to="/dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "11px 20px",
          borderRadius: "10px",
          background: "var(--accent-primary)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "14px",
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </main>
  )
}

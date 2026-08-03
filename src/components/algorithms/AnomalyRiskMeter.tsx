import React, { useEffect, useRef } from "react"
import type { AnomalyScanResult } from "../../types/api.types"

interface AnomalyRiskMeterProps {
  result: AnomalyScanResult
}

export function AnomalyRiskMeter({ result }: AnomalyRiskMeterProps) {
  const score = result.riskScore
  const pct = Math.min(score, 1)

  const riskColor =
    result.riskLevel === "HIGH"
      ? "var(--risk-high)"
      : result.riskLevel === "MEDIUM"
      ? "var(--risk-medium)"
      : "var(--risk-low)"

  const radius = 40
  const circumference = Math.PI * radius // semicircle
  const arcOffset = circumference - pct * circumference

  const progressRef = useRef<SVGCircleElement>(null)
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.strokeDashoffset = `${circumference}`
      requestAnimationFrame(() => {
        if (progressRef.current) {
          progressRef.current.style.transition = "stroke-dashoffset 1s ease"
          progressRef.current.style.strokeDashoffset = `${arcOffset}`
        }
      })
    }
  }, [arcOffset, circumference])

  return (
    <div>
      {/* Semicircular gauge */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          marginBottom: "4px",
        }}
      >
        <svg width="100" height="55" viewBox="0 0 100 55">
          {/* Track */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress — approximated with circle trick */}
          <circle
            ref={progressRef}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={riskColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference * 2}
            strokeDashoffset={circumference + arcOffset}
            transform="rotate(180 50 50)"
            style={{ filter: `drop-shadow(0 0 4px ${riskColor})` }}
          />
        </svg>
        {/* Score label */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "16px",
              fontWeight: 700,
              color: riskColor,
            }}
          >
            {score.toFixed(2)}
          </div>
          <div style={{ fontSize: "10px", color: riskColor, fontWeight: 700 }}>
            {result.riskLevel} RISK
          </div>
        </div>
      </div>

      {/* Bar */}
      <div
        style={{
          height: "6px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "999px",
          overflow: "hidden",
          margin: "8px 0",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct * 100}%`,
            background: riskColor,
            borderRadius: "999px",
            transition: "width 1s ease",
            boxShadow: `0 0 8px ${riskColor}`,
          }}
        />
      </div>

      {/* Pattern */}
      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
        Pattern: <span style={{ color: riskColor, fontWeight: 600 }}>{result.pattern}</span>
      </div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
        Confidence: {(result.confidence * 100).toFixed(0)}%
      </div>
    </div>
  )
}

import React from "react"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { ForecastResponse } from "../../types/api.types"

interface ForecastChartProps {
  data: ForecastResponse
  mode: "historical" | "forecast"
}

const tooltipStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: "8px",
  color: "var(--text-primary)",
  fontSize: "12px",
}

export function ForecastChart({ data, mode }: ForecastChartProps) {
  if (mode === "historical") {
    const chartData = data.historical.map((h) => ({
      month: h.month,
      Actual: h.requests,
      "Moving Avg": h.movingAverage,
    }))

    return (
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="maGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
          <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Area
            type="monotone"
            dataKey="Actual"
            stroke="#00D4FF"
            strokeWidth={2}
            fill="url(#actualGrad)"
          />
          <Area
            type="monotone"
            dataKey="Moving Avg"
            stroke="#F59E0B"
            strokeWidth={2}
            strokeDasharray="5 4"
            fill="url(#maGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  // Forecast mode — combined line chart
  const combinedData = [
    ...data.historical.map((h) => ({
      month: h.month,
      Historical: h.requests,
      Forecast: undefined as number | undefined,
    })),
    ...data.forecast.map((f) => ({
      month: f.month,
      Historical: undefined as number | undefined,
      Forecast: f.forecast,
    })),
  ]

  const dividerMonth =
    data.historical.length > 0 ? data.historical[data.historical.length - 1].month : undefined

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={combinedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
        <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        {dividerMonth && (
          <ReferenceLine
            x={dividerMonth}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="4 4"
            label={{ value: "Forecast →", fill: "var(--text-muted)", fontSize: 11 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="Historical"
          stroke="#00D4FF"
          strokeWidth={2}
          dot={{ fill: "#00D4FF", r: 3 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="Forecast"
          stroke="#7C3AED"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ fill: "#7C3AED", r: 3 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

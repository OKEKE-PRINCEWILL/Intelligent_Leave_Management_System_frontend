import { api } from "./axios"
import type { AnomalyScanResponse, AnomalyFlag } from "../types/api.types"

export const anomalyApi = {
  scan: async (payload: { threshold: number; departmentId?: number }): Promise<AnomalyScanResponse> => {
    const { data } = await api.post("/anomaly/scan", payload)
    const response = data.data || {}
    return {
      ...response,
      scannedCount: response.scannedCount ?? response.totalScanned ?? 0,
      results: Array.isArray(response.results)
        ? response.results.map((result: any) => ({
            ...result,
            topTriggers: result.topTriggers ?? result.reasonCodes ?? [],
            rules: result.rules ?? (result.explanations || []).map((rule: any) => ({
              ruleKey: rule.code,
              ruleLabel: rule.label,
              score: rule.score,
              triggered: rule.triggered,
            })),
          }))
        : [],
    }
  },

  getFlags: async (): Promise<AnomalyFlag[]> => {
    const { data } = await api.get("/anomaly/flags")
    const rows = Array.isArray(data.data) ? data.data : Array.isArray(data.data?.content) ? data.data.content : []
    return rows.map((flag: any) => ({
      ...flag,
      employeeName: flag.employeeName ?? flag.employee?.fullName,
      staffId: flag.staffId ?? flag.employee?.staffId,
      departmentName: flag.departmentName ?? flag.employee?.department?.name,
      createdAt: flag.createdAt ?? flag.detectedAt,
      hrNotes: flag.hrNotes,
    }))
  },

  flagEmployee: async (employeeId: number, reason: string): Promise<void> => {
    await api.post(`/anomaly/employee/${employeeId}/flag`, { reason })
  },

  dismissFlag: async (flagId: number): Promise<void> => {
    await api.post(`/anomaly/flags/${flagId}/dismiss`)
  },

  resolveFlag: async (flagId: number): Promise<void> => {
    await api.post(`/anomaly/flags/${flagId}/resolve`)
  },
}

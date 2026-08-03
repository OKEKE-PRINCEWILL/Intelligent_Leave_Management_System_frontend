import { api } from "./axios"
import type { AuditResponse, AuditVerifyResponse } from "../types/api.types"

export const auditApi = {
  getTrail: async (params?: { entityType?: string; page?: number; size?: number }): Promise<AuditResponse> => {
    const { data } = await api.get("/audit", { params })
    return data.data
  },

  verify: async (): Promise<AuditVerifyResponse> => {
    const { data } = await api.post("/audit/verify")
    return data.data
  },

  getEntityAudit: async (entityType: string, entityId: number): Promise<AuditResponse> => {
    const { data } = await api.get(`/audit/entity/${entityType}/${entityId}`)
    return data.data
  },
}

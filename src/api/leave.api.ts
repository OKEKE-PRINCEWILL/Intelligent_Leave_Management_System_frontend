import { api } from "./axios"
import type {
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  ConflictCheckResult,
  GreedyResult,
} from "../types/api.types"

export const leaveApi = {
  getTypes: async (): Promise<LeaveType[]> => {
    const { data } = await api.get("/leave/types")
    const raw = Array.isArray(data.data) ? data.data : []
    return raw.map((r: any) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      maxDays: r.defaultDays ?? r.maxDays ?? 0,
      requiresMedicalDoc: r.requiresMedical ?? r.requiresMedicalDoc ?? false,
      openEnded: r.openEnded ?? false,
      noticePeriodDays: r.noticePeriodDays ?? 0,
      carryForwardMax: r.carryForwardMax ?? 0,
      description: r.description,
    }))
  },

  getBalance: async (): Promise<LeaveBalance[]> => {
    const { data } = await api.get("/leave/balance")
    const raw = Array.isArray(data.data?.balances)
      ? data.data.balances
      : Array.isArray(data.data) ? data.data : []
    return raw.map((r: any) => ({
      leaveTypeId: r.leaveTypeId ?? r.id ?? 0,
      leaveTypeName: r.leaveType ?? r.leaveTypeName ?? "",
      code: r.code ?? "",
      entitled: r.entitledDays ?? r.entitled ?? 0,
      used: r.usedDays ?? r.used ?? 0,
      carried: r.carriedForward ?? r.carried ?? 0,
      remaining: r.remainingDays ?? r.remaining ?? 0,
      openEnded: r.openEnded ?? false,
    }))
  },

  apply: async (payload: {
    leaveTypeId: number
    startDate: string
    endDate: string
    reason?: string
    reliefOfficerId?: number
  }): Promise<LeaveRequest> => {
    const { data } = await api.post("/leave", payload)
    return data.data
  },

  getHistory: async (): Promise<LeaveRequest[]> => {
    const { data } = await api.get("/leave/history")
    return Array.isArray(data.data) ? data.data : []
  },

  getById: async (id: number): Promise<LeaveRequest> => {
    const { data } = await api.get(`/leave/${id}`)
    return data.data
  },

  cancel: async (id: number): Promise<void> => {
    await api.patch(`/leave/${id}/cancel`)
  },

  checkConflict: async (payload: {
    startDate: string
    endDate: string
    employeeId?: number
    departmentId?: number
  }): Promise<ConflictCheckResult> => {
    const { data } = await api.post("/leave/check-conflict", payload)
    return data.data
  },

  greedyRecommend: async (payload: {
    departmentId: number
    employeeId: number
    requestedStart: string
    duration: number
  }): Promise<GreedyResult> => {
    const { data } = await api.post("/leave/greedy-recommend", payload)
    const result = data.data
    const recommendation = result?.recommendation

    return {
      ...result,
      found: Boolean(recommendation),
      recommendation: recommendation
        ? {
            ...recommendation,
            iterations: recommendation.iterations ?? recommendation.iterationsUsed ?? 0,
            reason: recommendation.reason ?? result?.explanations?.[0],
          }
        : null,
    }
  },
}

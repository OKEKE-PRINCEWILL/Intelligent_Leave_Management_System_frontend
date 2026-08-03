import { api } from "./axios"
import type {
  MonthlyAnalytics,
  DepartmentAnalytics,
  ApprovalRateStats,
  ForecastResponse,
} from "../types/api.types"

export const analyticsApi = {
  getMonthly: async (params?: { departmentId?: number; months?: number }): Promise<MonthlyAnalytics[]> => {
    const { data } = await api.get("/analytics/monthly", { params })
    const raw = Array.isArray(data.data) ? data.data : []
    return raw.map((r: any) => ({
      month: r.month ?? r.yearMonth ?? "",
      total: r.total ?? r.requests ?? 0,
      approved: r.approved ?? 0,
      rejected: r.rejected ?? 0,
      pending: r.pending ?? 0,
    }))
  },

  getByDepartment: async (): Promise<DepartmentAnalytics[]> => {
    const { data } = await api.get("/analytics/by-department")
    const raw = Array.isArray(data.data) ? data.data : []
    return raw.map((r: any) => {
      const totalStaff = r.totalStaff ?? 0
      const onLeave = r.currentOnLeave ?? r.currentlyOnLeave ?? 0
      return {
        departmentId: r.departmentId ?? 0,
        departmentName: r.departmentName ?? r.department ?? r.name ?? "Unknown",
        totalStaff,
        currentOnLeave: onLeave,
        totalRequests: r.totalRequests ?? 0,
        approvedCount: r.approvedCount ?? 0,
        pendingCount: r.pendingCount ?? 0,
        rejectedCount: r.rejectedCount ?? 0,
        averageDays: r.averageDays ?? 0,
        staffingRatio: r.staffingRatio ?? (totalStaff > 0 ? (totalStaff - onLeave) / totalStaff : 1),
        currentLeaves: Array.isArray(r.currentLeaves) ? r.currentLeaves : [],
        upcomingLeaves: Array.isArray(r.upcomingLeaves) ? r.upcomingLeaves : [],
      }
    })
  },

  getApprovalRate: async (): Promise<ApprovalRateStats> => {
    const { data } = await api.get("/analytics/approval-rate")
    const r = data.data ?? {}
    const total = r.total ?? r.totalRequests ?? r.resolvedRequests ?? 0
    const approved = r.approved ?? r.approvedRequests ?? 0
    return {
      total,
      totalRequests: total,
      approved,
      rejected: r.rejected ?? 0,
      pending: r.pending ?? 0,
      returned: r.returned ?? 0,
      approvalRate: r.approvalRate ?? (total > 0 ? Math.round((approved / total) * 1000) / 10 : 0),
      averageProcessingDays: r.averageProcessingDays ?? 0,
      hodApprovalRate: r.hodApprovalRate,
      hrApprovalRate: r.hrApprovalRate,
      byLeaveType: r.byLeaveType ?? [],
    }
  },

  forecast: async (payload: { window: number; horizon: number; departmentId?: number }): Promise<ForecastResponse> => {
    const { data } = await api.post("/analytics/forecast", payload)
    return data.data
  },
}

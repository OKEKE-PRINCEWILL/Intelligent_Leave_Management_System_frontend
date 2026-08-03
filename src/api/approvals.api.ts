import { api } from "./axios"
import type { ApprovalRequest, DepartmentEmployeeInsight, ScoreResponse } from "../types/api.types"

export const approvalsApi = {
  getPendingDepartment: async (): Promise<ApprovalRequest[]> => {
    const { data } = await api.get("/approvals/pending/department")
    return Array.isArray(data.data) ? data.data : []
  },

  getPendingHR: async (): Promise<ApprovalRequest[]> => {
    const { data } = await api.get("/approvals/pending")
    return Array.isArray(data.data) ? data.data : []
  },

  getById: async (id: number): Promise<ApprovalRequest> => {
    const { data } = await api.get(`/approvals/${id}`)
    return data.data
  },

  score: async (id: number): Promise<ScoreResponse> => {
    const { data } = await api.post(`/approvals/${id}/score`)
    return data.data
  },

  approve: async (id: number, comment?: string): Promise<ApprovalRequest> => {
    const { data } = await api.post(`/approvals/${id}/approve`, { action: "APPROVED", comment })
    return data.data
  },

  reject: async (id: number, comment: string): Promise<ApprovalRequest> => {
    const { data } = await api.post(`/approvals/${id}/reject`, { action: "REJECTED", comment })
    return data.data
  },

  return: async (id: number, comment: string): Promise<ApprovalRequest> => {
    const { data } = await api.post(`/approvals/${id}/return`, { action: "RETURNED", comment })
    return data.data
  },

  getDepartmentEmployees: async (): Promise<DepartmentEmployeeInsight[]> => {
    const { data } = await api.get("/approvals/department/employees")
    return Array.isArray(data.data) ? data.data : []
  },

  getAllDepartmentCoverage: async (): Promise<DepartmentEmployeeInsight[]> => {
    const { data } = await api.get("/approvals/departments/coverage")
    return Array.isArray(data.data) ? data.data : []
  },

  getDepartmentSchedule: async (): Promise<ApprovalRequest[]> => {
    const { data } = await api.get("/approvals/department/schedule")
    return Array.isArray(data.data) ? data.data : []
  },

  getEmployeeLeaves: async (employeeId: number): Promise<ApprovalRequest[]> => {
    const { data } = await api.get(`/approvals/department/employees/${employeeId}/leaves`)
    return Array.isArray(data.data) ? data.data : []
  },
}

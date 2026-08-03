import { api } from "./axios"
import type { Employee, Department, SystemSetting } from "../types/api.types"

export const adminApi = {
  getEmployees: async (): Promise<Employee[]> => {
    const { data } = await api.get("/admin/employees")
    const rows = Array.isArray(data.data) ? data.data : []
    return rows.map((row: Employee & { department?: string; systemRole?: Employee["role"]; isActive?: boolean }) => ({
      ...row,
      departmentName: row.departmentName ?? row.department ?? "",
      role: row.role ?? row.systemRole ?? "EMPLOYEE",
      active: row.active ?? row.isActive ?? true,
    }))
  },

  createEmployee: async (payload: Partial<Employee> & {
    password?: string
    departmentId?: number
    dateJoined?: string
    roleTitle?: string
  }): Promise<Employee> => {
    const { data } = await api.post("/admin/employees", payload)
    return data.data
  },

  updateEmployee: async (id: number, payload: Partial<Employee>): Promise<Employee> => {
    const { data } = await api.put(`/admin/employees/${id}`, payload)
    return data.data
  },

  deactivateEmployee: async (id: number): Promise<void> => {
    await api.patch(`/admin/employees/${id}/deactivate`)
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await api.delete(`/admin/employees/${id}`)
  },

  resetEmployeePassword: async (id: number, newPassword: string): Promise<void> => {
    await api.post(`/admin/employees/${id}/reset-password`, { newPassword })
  },

  getDepartments: async (): Promise<Department[]> => {
    const { data } = await api.get("/admin/departments")
    return Array.isArray(data.data) ? data.data : []
  },

  createDepartment: async (payload: Partial<Department>): Promise<Department> => {
    const { data } = await api.post("/admin/departments", payload)
    return data.data
  },

  updateDepartment: async (id: number, payload: Partial<Department>): Promise<Department> => {
    const { data } = await api.put(`/admin/departments/${id}`, payload)
    return data.data
  },

  deleteDepartment: async (id: number): Promise<void> => {
    await api.delete(`/admin/departments/${id}`)
  },

  getSettings: async (): Promise<SystemSetting> => {
    const { data } = await api.get("/admin/settings")
    if (Array.isArray(data.data)) {
      // Flatten key/value array into object
      return data.data.reduce((acc: Record<string, unknown>, s: SystemSetting) => {
        const parsed = Number(s.value)
        if (s.value === "true") acc[s.key] = true
        else if (s.value === "false") acc[s.key] = false
        else if (!isNaN(parsed) && s.value !== "") acc[s.key] = parsed
        else acc[s.key] = s.value
        return acc
      }, {}) as SystemSetting
    }
    return data.data
  },

  updateSettings: async (settings: Record<string, unknown>): Promise<void> => {
    await api.put("/admin/settings", settings)
  },

  uploadLeaveRoster: async (file: File): Promise<{ created: number; failed: number; createdRecords: string[]; errors: string[] }> => {
    const form = new FormData()
    form.append("file", file)
    const { data } = await api.post("/admin/leave-roster/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data.data
  },
}

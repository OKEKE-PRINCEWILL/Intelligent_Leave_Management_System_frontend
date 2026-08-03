import { api } from "./axios"
import type { AuthData } from "../types/api.types"

export const authApi = {
  getLoginDepartments: async (): Promise<{ id: number; name: string }[]> => {
    const { data } = await api.get<{ success: boolean; data: { id: number; name: string }[] }>("/auth/departments")
    return Array.isArray(data.data) ? data.data : []
  },

  login: async (credentials: { firstName: string; lastName: string; departmentId: number; password: string }) => {
    const { data } = await api.post<{ success: boolean; data: AuthData }>("/auth/login", credentials)
    return data.data
  },

  auditorLogin: async (credentials: { username: string; password: string }) => {
    const { data } = await api.post<{ success: boolean; data: AuthData }>("/auth/auditor-login", credentials)
    return data.data
  },

  recoverAuditor: async (payload: {
    username: string
    recoveryKey: string
    newPassword: string
    confirmPassword: string
  }) => {
    const { data } = await api.post<{ success: boolean; message: string }>("/auth/auditor-recover", payload)
    return data
  },

  logout: async () => {
    await api.post("/auth/logout")
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const { data } = await api.post("/auth/change-password", payload)
    return data
  },

  refresh: async (refreshToken: string) => {
    const { data } = await api.post<{ success: boolean; data: { token: string } }>("/auth/refresh", { refreshToken })
    return data.data
  },
}

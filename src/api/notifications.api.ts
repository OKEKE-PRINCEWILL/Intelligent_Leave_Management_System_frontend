import { api } from "./axios"
import type { Notification } from "../types/api.types"

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get("/notifications")
    const rows = Array.isArray(data.data) ? data.data : []
    return rows.map((row: Notification) => ({
      ...row,
      read: row.read ?? row.isRead ?? false,
      isRead: row.isRead ?? row.read ?? false,
    }))
  },

  markAllRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all")
  },

  markRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`)
  },

  sendTestEmail: async (): Promise<void> => {
    await api.post("/notifications/test-email")
  },
}

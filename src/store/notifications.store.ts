import { create } from "zustand"
import type { Notification } from "../types/api.types"

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (notifications: Notification[]) => void
  markAllRead: () => void
  addNotification: (notification: Notification) => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length })
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    }))
  },
}))

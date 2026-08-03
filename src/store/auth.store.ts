import { create } from "zustand"
import type { User } from "../types/api.types"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string, refreshToken?: string) => void
  clearAuth: () => void
  updateUser: (updates: Partial<User>) => void
}

function normalizeUser(raw: User & { department?: string; fullName?: string }): User {
  const fullName = raw.fullName || `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "User"

  // Split fullName into first/last if the individual fields are missing
  let firstName = raw.firstName || ""
  let lastName = raw.lastName || ""
  if (!firstName && !lastName && fullName) {
    const parts = fullName.trim().split(" ")
    firstName = parts[0] || ""
    lastName = parts.slice(1).join(" ") || parts[0] || ""
  }

  return {
    ...raw,
    firstName,
    lastName,
    fullName,
    employeeId: (raw as any).employeeId ?? raw.id,
    // Map `department` → `departmentName` if needed
    departmentName: raw.departmentName || (raw as any).department || "",
    departmentId: raw.departmentId || 0,
    gradeLevel: raw.gradeLevel || 0,
    roleTitle: raw.roleTitle || raw.role || "",
    active: raw.active ?? true,
    firstLogin: raw.firstLogin ?? false,
  }
}

function loadFromSession(): Pick<AuthState, "user" | "token" | "isAuthenticated"> {
  const token = sessionStorage.getItem("ilms_token")
  const raw = sessionStorage.getItem("ilms_user")
  const parsed = raw ? (JSON.parse(raw) as User) : null
  const user = parsed ? normalizeUser(parsed) : null
  return { token, user, isAuthenticated: !!token && !!user }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadFromSession(),

  setAuth: (rawUser, token, refreshToken) => {
    const user = normalizeUser(rawUser)
    sessionStorage.setItem("ilms_token", token)
    sessionStorage.setItem("ilms_user", JSON.stringify(user))
    if (refreshToken) sessionStorage.setItem("ilms_refresh_token", refreshToken)
    set({ user, token, isAuthenticated: true })
  },

  clearAuth: () => {
    sessionStorage.clear()
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state
      const updated = normalizeUser({ ...state.user, ...updates } as any)
      sessionStorage.setItem("ilms_user", JSON.stringify(updated))
      return { user: updated }
    })
  },
}))

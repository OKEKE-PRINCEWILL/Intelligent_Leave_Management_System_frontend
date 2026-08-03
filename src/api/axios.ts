/// <reference types="vite/client" />
import axios from "axios"

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("ilms_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = sessionStorage.getItem("ilms_refresh_token")
        if (!refreshToken) throw new Error("No refresh token")
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
        if (data?.data?.token) {
          sessionStorage.setItem("ilms_token", data.data.token)
          original.headers.Authorization = `Bearer ${data.data.token}`
          return api(original)
        }
      } catch {
        sessionStorage.clear()
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export function setAuthTokens(token: string, refreshToken?: string) {
  sessionStorage.setItem("ilms_token", token)
  if (refreshToken) sessionStorage.setItem("ilms_refresh_token", refreshToken)
}

export function clearAuthTokens() {
  sessionStorage.removeItem("ilms_token")
  sessionStorage.removeItem("ilms_refresh_token")
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    // Bean-validation failures come back as { message: "Validation failed",
    // data: { field: "<reason>", ... } }. Surface the specific field reasons so
    // the user knows what to fix instead of a generic "Validation failed".
    const fieldErrors = data?.data
    if (fieldErrors && typeof fieldErrors === "object" && !Array.isArray(fieldErrors)) {
      const messages = Object.values(fieldErrors).filter(
        (v): v is string => typeof v === "string" && v.trim().length > 0
      )
      if (messages.length > 0) return messages.join(" ")
    }
    return data?.message || error.message || "Request failed"
  }
  if (error instanceof Error) return error.message
  return "An unexpected error occurred"
}

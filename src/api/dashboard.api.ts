import { api } from "./axios"
import type { DashboardSummary } from "../types/api.types"

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await api.get("/dashboard/summary")
    return data.data
  },
}

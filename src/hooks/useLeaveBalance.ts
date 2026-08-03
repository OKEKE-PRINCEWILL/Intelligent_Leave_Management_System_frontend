import { useQuery } from "@tanstack/react-query"
import { leaveApi } from "../api/leave.api"

export function useLeaveBalance() {
  return useQuery({
    queryKey: ["leave-balance"],
    queryFn: leaveApi.getBalance,
    staleTime: 5 * 60 * 1000,
  })
}

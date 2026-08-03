import React from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../../store/auth.store"
import { EmployeeDashboard } from "./EmployeeDashboard"
import { HODDashboard } from "./HODDashboard"
import { HRDashboard } from "./HRDashboard"
import { AuditorDashboard } from "./AuditorDashboard"

export function Dashboard() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />

  switch (user.role) {
    case "EMPLOYEE": return <EmployeeDashboard />
    case "HOD": return <HODDashboard />
    case "HR_ADMIN": return <HRDashboard />
    case "AUDITOR": return <AuditorDashboard />
    default: return <Navigate to="/login" replace />
  }
}

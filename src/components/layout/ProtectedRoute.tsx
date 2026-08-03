import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../../store/auth.store"
import type { UserRole } from "../../types/api.types"

interface ProtectedRouteProps {
  children?: React.ReactNode
  roles?: UserRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

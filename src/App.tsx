import React, { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Shell } from "./components/layout/Shell"
import { ProtectedRoute } from "./components/layout/ProtectedRoute"
import { RouteMeta } from "./components/RouteMeta"
import { LoginPage } from "./pages/auth/LoginPage"
import { AuditorLoginPage } from "./pages/auth/AuditorLoginPage"
import { NotFound } from "./pages/NotFound"

// Dashboard
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })))

// Leave
const LeaveApplicationForm = lazy(() => import("./pages/leave/LeaveApplicationForm").then((m) => ({ default: m.LeaveApplicationForm })))
const LeaveHistory = lazy(() => import("./pages/leave/LeaveHistory").then((m) => ({ default: m.LeaveHistory })))
const LeaveDetail = lazy(() => import("./pages/leave/LeaveDetail").then((m) => ({ default: m.LeaveDetail })))
const GreedyRecommender = lazy(() => import("./pages/leave/GreedyRecommender").then((m) => ({ default: m.GreedyRecommender })))
const ConflictCheckerPage = lazy(() => import("./pages/leave/ConflictCheckerPage").then((m) => ({ default: m.ConflictCheckerPage })))

// Approvals
const PendingApprovals = lazy(() => import("./pages/approvals/PendingApprovals").then((m) => ({ default: m.PendingApprovals })))
const HRPendingApprovals = lazy(() => import("./pages/approvals/HRPendingApprovals").then((m) => ({ default: m.HRPendingApprovals })))
const ApprovalDetail = lazy(() => import("./pages/approvals/ApprovalDetail").then((m) => ({ default: m.ApprovalDetail })))
const TeamLeaveInsights = lazy(() => import("./pages/approvals/TeamLeaveInsights").then((m) => ({ default: m.TeamLeaveInsights })))

// Analytics
const DepartmentAnalytics = lazy(() => import("./pages/analytics/DepartmentAnalytics").then((m) => ({ default: m.DepartmentAnalytics })))
const ApprovalRateStats = lazy(() => import("./pages/analytics/ApprovalRateStats").then((m) => ({ default: m.ApprovalRateStats })))
const ForecastPage = lazy(() => import("./pages/analytics/ForecastPage").then((m) => ({ default: m.ForecastPage })))

// Anomaly
const AnomalyScanPage = lazy(() => import("./pages/anomaly/AnomalyScanPage").then((m) => ({ default: m.AnomalyScanPage })))
const AnomalyFlags = lazy(() => import("./pages/anomaly/AnomalyFlags").then((m) => ({ default: m.AnomalyFlags })))

// Audit
const AuditTrail = lazy(() => import("./pages/audit/AuditTrail").then((m) => ({ default: m.AuditTrail })))

// Admin
const EmployeeManagement = lazy(() => import("./pages/admin/EmployeeManagement").then((m) => ({ default: m.EmployeeManagement })))
const DepartmentManagement = lazy(() => import("./pages/admin/DepartmentManagement").then((m) => ({ default: m.DepartmentManagement })))
const SystemSettings = lazy(() => import("./pages/admin/SystemSettings").then((m) => ({ default: m.SystemSettings })))
const BulkRosterUpload = lazy(() => import("./pages/admin/BulkRosterUpload").then((m) => ({ default: m.BulkRosterUpload })))

// AI Assistant
const AiAssistantPage = lazy(() => import("./pages/ai/AiAssistantPage").then((m) => ({ default: m.AiAssistantPage })))

// Notifications & Profile
const NotificationsPage = lazy(() => import("./pages/notifications/NotificationsPage").then((m) => ({ default: m.NotificationsPage })))
const UserProfile = lazy(() => import("./pages/profile/UserProfile").then((m) => ({ default: m.UserProfile })))

function PageLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
      <div style={{ width: "32px", height: "32px", border: "2px solid var(--border-default)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteMeta />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auditor-login" element={<AuditorLoginPage />} />

        {/* Protected shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Shell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={
              <Suspense fallback={<PageLoader />}><Dashboard /></Suspense>
            } />

            {/* Leave */}
            <Route path="leave">
              <Route index element={<Navigate to="/leave/history" replace />} />
              <Route path="apply" element={
                <ProtectedRoute roles={["EMPLOYEE", "HOD"]}>
                  <Suspense fallback={<PageLoader />}><LeaveApplicationForm /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="history" element={
                <Suspense fallback={<PageLoader />}><LeaveHistory /></Suspense>
              } />
              <Route path=":id" element={
                <Suspense fallback={<PageLoader />}><LeaveDetail /></Suspense>
              } />
              <Route path="balance" element={<Navigate to="/dashboard" replace />} />
              <Route path="greedy" element={<Navigate to="/leave/recommend" replace />} />
              <Route path="recommend" element={
                <ProtectedRoute roles={["EMPLOYEE", "HOD"]}>
                  <Suspense fallback={<PageLoader />}><GreedyRecommender /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="conflict-check" element={
                <Suspense fallback={<PageLoader />}><ConflictCheckerPage /></Suspense>
              } />
            </Route>

            {/* Approvals */}
            <Route path="approvals">
              <Route index element={<Navigate to="/approvals/pending" replace />} />
              <Route path="pending" element={
                <ProtectedRoute roles={["HOD"]}>
                  <Suspense fallback={<PageLoader />}><PendingApprovals /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="hr-pending" element={
                <ProtectedRoute roles={["HR_ADMIN"]}>
                  <Suspense fallback={<PageLoader />}><HRPendingApprovals /></Suspense>
                </ProtectedRoute>
              } />
              <Route path=":id" element={
                <ProtectedRoute roles={["HOD", "HR_ADMIN"]}>
                  <Suspense fallback={<PageLoader />}><ApprovalDetail /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="team" element={
                <ProtectedRoute roles={["HOD"]}>
                  <Suspense fallback={<PageLoader />}><TeamLeaveInsights /></Suspense>
                </ProtectedRoute>
              } />
            </Route>

            {/* Analytics */}
            <Route path="analytics">
              <Route index element={<Navigate to="/analytics/departments" replace />} />
              <Route path="monthly" element={<Navigate to="/analytics/departments" replace />} />
              <Route path="departments" element={
                <ProtectedRoute roles={["HR_ADMIN", "AUDITOR", "HOD"]}>
                  <Suspense fallback={<PageLoader />}><DepartmentAnalytics /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="approval-rates" element={
                <ProtectedRoute roles={["HR_ADMIN", "AUDITOR"]}>
                  <Suspense fallback={<PageLoader />}><ApprovalRateStats /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="forecast" element={
                <ProtectedRoute roles={["HR_ADMIN", "HOD", "AUDITOR"]}>
                  <Suspense fallback={<PageLoader />}><ForecastPage /></Suspense>
                </ProtectedRoute>
              } />
            </Route>

            {/* Anomaly */}
            <Route path="anomaly">
              <Route index element={<Navigate to="/anomaly/scan" replace />} />
              <Route path="scan" element={
                <ProtectedRoute roles={["HOD", "HR_ADMIN", "AUDITOR"]}>
                  <Suspense fallback={<PageLoader />}><AnomalyScanPage /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="flags" element={
                <ProtectedRoute roles={["HOD", "HR_ADMIN", "AUDITOR"]}>
                  <Suspense fallback={<PageLoader />}><AnomalyFlags /></Suspense>
                </ProtectedRoute>
              } />
            </Route>

            {/* Audit */}
            <Route path="audit">
              <Route index element={<Navigate to="/audit/trail" replace />} />
              <Route path="trail" element={
                <ProtectedRoute roles={["AUDITOR"]}>
                  <Suspense fallback={<PageLoader />}><AuditTrail /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute roles={["AUDITOR"]}>
                  <Suspense fallback={<PageLoader />}><SystemSettings /></Suspense>
                </ProtectedRoute>
              } />
            </Route>

            {/* Admin */}
            <Route path="admin">
              <Route index element={<Navigate to="/admin/employees" replace />} />
              <Route path="employees" element={
                <ProtectedRoute roles={["HR_ADMIN", "AUDITOR"]}>
                  <Suspense fallback={<PageLoader />}><EmployeeManagement /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="departments" element={
                <ProtectedRoute roles={["HR_ADMIN", "AUDITOR"]}>
                  <Suspense fallback={<PageLoader />}><DepartmentManagement /></Suspense>
                </ProtectedRoute>
              } />
              <Route path="bulk-roster" element={
                <ProtectedRoute roles={["HR_ADMIN"]}>
                  <Suspense fallback={<PageLoader />}><BulkRosterUpload /></Suspense>
                </ProtectedRoute>
              } />
            </Route>

            {/* AI Assistant */}
            <Route path="ai-assistant" element={
              <Suspense fallback={<PageLoader />}><AiAssistantPage /></Suspense>
            } />

            {/* Notifications & Profile */}
            <Route path="notifications" element={
              <Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>
            } />
            <Route path="profile" element={
              <Suspense fallback={<PageLoader />}><UserProfile /></Suspense>
            } />
          </Route>
        </Route>

        {/* 404 — unknown routes (works signed-in or signed-out) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

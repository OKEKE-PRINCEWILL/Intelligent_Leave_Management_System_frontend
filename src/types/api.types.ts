export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export type LeaveStatus =
  | "PENDING"
  | "HOD_APPROVED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "RETURNED"

export type UserRole = "EMPLOYEE" | "HOD" | "HR_ADMIN" | "AUDITOR"

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW"

export interface User {
  id: number
  employeeId?: number
  staffId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: UserRole
  departmentId: number
  departmentName: string
  gradeLevel: number
  roleTitle: string
  firstLogin: boolean
  mustChangePassword?: boolean
  active: boolean
  gender?: "MALE" | "FEMALE"
  position?: string
  phoneNumber?: string
  phone?: string
  dateOfBirth?: string
  dateJoined?: string
}

export interface AuthData {
  token: string
  refreshToken: string
  user: User
}

export interface LeaveType {
  id: number
  name: string
  code: string
  maxDays: number
  requiresMedicalDoc: boolean
  openEnded: boolean
  noticePeriodDays?: number
  carryForwardMax?: number
  description?: string
}

export interface LeaveBalance {
  leaveTypeId: number
  leaveTypeName: string
  code: string
  entitled: number
  used: number
  carried: number
  remaining: number
  openEnded?: boolean
}

export interface LeaveRequest {
  id: number
  reference: string
  employeeId: number
  employeeName: string
  departmentName: string
  leaveTypeId: number
  leaveType: string
  startDate: string
  endDate: string
  workingDays: number
  reason?: string
  status: LeaveStatus
  reliefOfficerId?: number
  reliefOfficerName?: string
  hodActionedAt?: string
  hrActionedAt?: string
  hodComment?: string
  hrComment?: string
  hodActorName?: string
  hrActorName?: string
  aiScore?: number
  aiRecommendation?: string
  conflictChecked?: boolean
  greedyUsed?: boolean
  optimisationScore?: number
  optimisationRecommendation?: string
  suggestedStartDate?: string
  suggestedEndDate?: string
  suggestedDateReason?: string
  createdAt: string
  updatedAt: string
}

export interface ConflictingEmployee {
  name: string
  leaveType: string
  startDate: string
  endDate: string
}

export interface ConflictCheckResult {
  safe: boolean
  hasConflict?: boolean
  staffAvailable: number
  minRequired: number
  maxConcurrent: number
  overlappingCount: number
  overlappingEmployees?: string[]
  conflictingEmployees?: ConflictingEmployee[]
  message?: string
}

export interface GreedyStep {
  attempt: number
  date: string
  endDate: string
  onLeave: number
  available: number
  minRequired: number
  safe: boolean
}

export interface GreedyRecommendation {
  start: string
  end: string
  iterations: number
  reason?: string
}

export interface GreedyResult {
  steps: GreedyStep[]
  recommendation: GreedyRecommendation | null
  found: boolean
}

export interface ScoreFactor {
  label: string
  score: number
  weight: number
  contribution: number
  description?: string
}

export interface ScoreResponse {
  leaveRequestId: number
  total: number
  recommendation: "APPROVE" | "REVIEW" | "REJECT"
  reasonText?: string
  reasonsSummary?: string
  decisionNarrative?: string
  decisionNarrativePlain?: string
  decisionNarrativeTechnical?: string
  primaryDrivers?: string[]
  counterBalance?: string[]
  reasonCodes: string[]
  factors: {
    staffing: ScoreFactor
    urgency: ScoreFactor
    criticality: ScoreFactor
    overlap: ScoreFactor
    duration: ScoreFactor
  }
}

export interface AnomalyRule {
  ruleKey: string
  ruleLabel: string
  score: number
  triggered: boolean
}

export interface AnomalyScanResult {
  employeeId: number
  staffId: string
  name: string
  department: string
  riskScore: number
  riskLevel: RiskLevel
  pattern: string
  issueSummary: string
  confidence: number
  topTriggers: string[]
  aiNarrativePlain?: string
  aiRecommendedAction?: string
  rules: AnomalyRule[]
}

export interface AnomalyScanResponse {
  scannedCount: number
  flaggedCount: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  results: AnomalyScanResult[]
}

export interface AnomalyFlag {
  id: number
  employeeId: number
  employeeName: string
  staffId: string
  departmentName: string
  riskScore: number
  riskLevel: RiskLevel
    pattern: string
    issueSummary: string
    hrNotes?: string
    status: "ACTIVE" | "OPEN" | "DISMISSED" | "RESOLVED"
    createdAt: string
  }

export interface AuditEntry {
  id: number
  userLabel: string
  action: string
  entityType: string
  entityLabel: string
  currentHash: string
  previousHash?: string
  verified: boolean
  createdAt: string
}

export interface AuditResponse {
  entries: AuditEntry[]
  totalEntries: number
  chainIntact: boolean
  tamperedAt?: number
}

export interface AuditVerifyResponse {
  chainIntact: boolean
  totalEntries: number
  tamperedAt?: number
  tamperedEntry?: AuditEntry
}

export interface ForecastDataPoint {
  month: string
  requests?: number
  forecast?: number
  movingAverage?: number
}

export interface ForecastTraceRow {
  month: string
  actual: number
  movingAverage?: number
  deviation?: number
  trendSignal?: string
}

export interface ForecastInsights {
  peakMonth: string
  peakValue: number
  riskDepartment: string
  safeWindows: string[]
  narrative: string
}

export interface ForecastResponse {
  historical: ForecastDataPoint[]
  forecast: ForecastDataPoint[]
  trace: ForecastTraceRow[]
  insights: ForecastInsights
}

export interface MonthlyAnalytics {
  month: string
  total: number
  approved: number
  rejected: number
  pending: number
}

export interface DepartmentAnalytics {
  departmentId: number
  departmentName: string
  totalStaff: number
  currentOnLeave: number
  totalRequests: number
  approvedCount: number
  pendingCount: number
  rejectedCount?: number
  staffingRatio: number
  averageDays?: number
  currentLeaves: DepartmentLeaveScheduleItem[]
  upcomingLeaves: DepartmentLeaveScheduleItem[]
}

export interface DepartmentLeaveScheduleItem {
  leaveRequestId: number
  employeeId: number
  staffId: string
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  workingDays: number
}

export interface LeaveTypeApprovalRate {
  leaveType: string
  total: number
  approved: number
  approvalRate: number
}

export interface ApprovalRateStats {
  total?: number
  totalRequests: number
  approved: number
  rejected: number
  pending: number
  returned?: number
  approvalRate: number
  averageProcessingDays: number
  hodApprovalRate?: number
  hrApprovalRate?: number
  byLeaveType?: LeaveTypeApprovalRate[]
}

export interface DashboardSummary {
  activeLeaveRequests: number
  pendingApprovals: number
  anomalyCount: number
  totalEmployees?: number
  approvalRate?: number
  forecastPeakMonth?: string
  chainIntact?: boolean
}

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  read: boolean
  isRead: boolean
  entityId?: number
  entityType?: string
  createdAt: string
}

export interface Department {
  id: number
  name: string
  code?: string
  description?: string
  hodName?: string
  hodId?: number
  employeeCount?: number
  totalStaff: number
  minStaff: number
  maxConcurrentLeave: number
  employeesOnLeave?: number
  staffingRatio?: number
}

export interface DepartmentEmployeeInsight {
  employeeId: number
  staffId: string
  fullName: string
  department: string
  roleTitle?: string
  gradeLevel: number
  email?: string
  active: boolean
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  currentLeaveType?: string
  currentLeaveStartDate?: string
  currentLeaveEndDate?: string
  currentLeaveDaysRemaining?: number
  upcomingLeaveType?: string
  upcomingLeaveStartDate?: string
  upcomingLeaveEndDate?: string
  upcomingLeaveWorkingDays?: number
  latestLeaveStartDate?: string
  latestLeaveEndDate?: string
  latestLeaveStatus?: LeaveStatus
  currentYearBalances?: {
    leaveType: string
    code: string
    entitledDays: number
    usedDays: number
    carriedForward: number
    remainingDays: number
    openEnded?: boolean
  }[]
}

export interface Employee {
  id: number
  staffId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: UserRole
  roleTitle: string
  departmentId: number
  departmentName: string
  gradeLevel: number
  gender?: "MALE" | "FEMALE"
  position?: string
  phoneNumber?: string
  phone?: string
  active: boolean
  dateOfBirth?: string
  dateJoined?: string
}

export interface SystemSetting {
  key: string
  value: string
  description?: string
  anomalyThreshold?: number
  maxLeaveDaysPerYear?: number
  maxConsecutiveDays?: number
  rateLimitRequestsPerMinute?: number
  rateLimitWindowSeconds?: number
  jwtExpiryMinutes?: number
  refreshTokenExpiryDays?: number
  passwordExpiryDays?: number
  auditRetentionDays?: number
  enableEmailNotifications?: boolean
  enableAnomalyAlerts?: boolean
}

export interface ApprovalRequest extends LeaveRequest {
  currentStage: string
  employeeGradeLevel: number
  employeeRoleTitle: string
  daysUrgency?: number
}

// Single source of truth for per-route page titles and breadcrumbs.
// Used by RouteMeta (document.title), the Header (visible H1 + breadcrumb),
// and the NotFound page. Keep the keys in sync with the routes in App.tsx.

export const SITE_NAME = "ILMS"
export const SITE_URL = "https://intelligent-leave-management-system-five.vercel.app"

// Exact-path titles for every concrete route.
const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leave/apply": "Apply for Leave",
  "/leave/history": "My Leaves",
  "/leave/conflict-check": "Conflict Check",
  "/leave/recommend": "Smart Recommender",
  "/approvals/pending": "Pending Approvals",
  "/approvals/hr-pending": "Leave Approvals",
  "/approvals/team": "Team Coverage",
  "/analytics/departments": "Department Analytics",
  "/analytics/approval-rates": "Approval Rates",
  "/analytics/forecast": "Leave Forecast",
  "/anomaly/scan": "Weekly Anomaly Review",
  "/anomaly/flags": "Anomaly Flags",
  "/audit/trail": "Audit Trail",
  "/audit/settings": "System Settings",
  "/admin/employees": "Employee Management",
  "/admin/departments": "Department Management",
  "/admin/bulk-roster": "Bulk Leave Roster",
  "/ai-assistant": "AI Assistant",
  "/notifications": "Notifications",
  "/profile": "My Profile",
  "/login": "Sign In",
  "/auditor-login": "Auditor Sign In",
}

// Section labels for breadcrumb middles (first path segment -> label).
const SECTIONS: Record<string, string> = {
  leave: "Leave",
  approvals: "Approvals",
  analytics: "Analytics",
  anomaly: "Anomaly",
  audit: "Audit",
  admin: "Administration",
}

function normalize(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/"
}

/** Page title for a path, or "" when the path matches no known route. */
export function getPageTitle(pathname: string): string {
  const path = normalize(pathname)
  if (TITLES[path]) return TITLES[path]

  const seg = path.split("/").filter(Boolean)
  // Dynamic detail routes.
  if (seg[0] === "leave" && seg[1]) return "Leave Details"
  if (seg[0] === "approvals" && seg[1]) return "Approval Details"
  // Bare section paths (redirect targets) — return the section label so the
  // title never flashes "Not Found" during an in-app redirect.
  if (seg.length === 1 && SECTIONS[seg[0]]) return SECTIONS[seg[0]]
  return ""
}

/** Full document.title, e.g. "Dashboard · ILMS". */
export function getDocumentTitle(pathname: string): string {
  const title = getPageTitle(pathname)
  return title ? `${title} · ${SITE_NAME}` : `Page Not Found · ${SITE_NAME}`
}

export interface Crumb {
  label: string
  to?: string
}

/** Breadcrumb trail: Dashboard / [Section] / Current page. */
export function getBreadcrumbs(pathname: string): Crumb[] {
  const path = normalize(pathname)
  if (path === "/" || path === "/dashboard") return [{ label: "Dashboard" }]

  const seg = path.split("/").filter(Boolean)
  const crumbs: Crumb[] = [{ label: "Dashboard", to: "/dashboard" }]
  if (seg.length > 1 && SECTIONS[seg[0]]) crumbs.push({ label: SECTIONS[seg[0]] })
  crumbs.push({ label: getPageTitle(path) || SITE_NAME })
  return crumbs
}

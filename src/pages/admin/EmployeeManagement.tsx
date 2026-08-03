import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Users, Plus, Edit2, Trash2, Search, LayoutGrid, LayoutList, X, ChevronLeft, ChevronRight, KeyRound } from "lucide-react"
import toast from "react-hot-toast"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Modal } from "../../components/ui/Modal"
import { SkeletonTable } from "../../components/ui/Skeleton"
import { adminApi } from "../../api/admin.api"
import { getApiErrorMessage } from "../../api/axios"
import { useAuthStore } from "../../store/auth.store"
import type { Employee, Department } from "../../types/api.types"

const ROLES = ["EMPLOYEE", "HOD", "HR_ADMIN", "AUDITOR"]

const GRADE_LEVELS = Array.from({ length: 17 }, (_, i) => i + 1)

const ROLE_LABELS: Record<string, string> = {
  EMPLOYEE: "Employee",
  HOD: "Head of Department",
  HR_ADMIN: "HR Administrator",
  AUDITOR: "Administrator",
}

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  staffId: "",
  role: "EMPLOYEE",
  gender: "MALE",
  departmentId: "",
  gradeLevel: 1,
  roleTitle: "",
  dateJoined: new Date().toISOString().slice(0, 10),
}

export function EmployeeManagement() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isAuditor = user?.role === "AUDITOR"
  const assignableRoles = isAuditor ? ROLES : ROLES.filter((role) => role !== "AUDITOR")
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("")
  const [view, setView] = useState<"table" | "card">("table")
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [confirmName, setConfirmName] = useState("")
  const [resetTarget, setResetTarget] = useState<Employee | null>(null)
  const [resetPwd, setResetPwd] = useState("")
  const [form, setForm] = useState({ ...emptyForm })
  const [page, setPage] = useState(0)
  const pageSize = 8

  const { data: employees, isLoading } = useQuery({
    queryKey: ["admin-employees"],
    queryFn: adminApi.getEmployees,
  })

  const { data: departments } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: adminApi.getDepartments,
  })

  const createMutation = useMutation({
    mutationFn: adminApi.createEmployee,
    onSuccess: () => {
      toast.success("Employee created successfully.")
      queryClient.invalidateQueries({ queryKey: ["admin-employees"] })
      setShowForm(false)
      setForm({ ...emptyForm })
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Employee> }) =>
      adminApi.updateEmployee(id, data),
    onSuccess: () => {
      toast.success("Employee updated.")
      queryClient.invalidateQueries({ queryKey: ["admin-employees"] })
      setShowForm(false)
      setEditingEmployee(null)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteEmployee,
    onSuccess: () => {
      toast.success("Employee deleted.")
      queryClient.invalidateQueries({ queryKey: ["admin-employees"] })
      setDeleteTarget(null)
      setConfirmName("")
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const resetMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      adminApi.resetEmployeePassword(id, newPassword),
    onSuccess: () => {
      toast.success("Password reset. The user must change it on next login.")
      setResetTarget(null)
      setResetPwd("")
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const filtered = (employees || []).filter((e) => {
    const matchesSearch = `${e.firstName} ${e.lastName} ${e.staffId} ${e.email}`.toLowerCase().includes(search.toLowerCase())
    const matchesDept = !deptFilter || String(e.departmentId) === deptFilter
    return matchesSearch && matchesDept
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pagedEmployees = filtered.slice(page * pageSize, page * pageSize + pageSize)

  React.useEffect(() => {
    setPage(0)
  }, [search, deptFilter, view])

  const openCreate = () => {
    setEditingEmployee(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp)
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      staffId: emp.staffId,
      role: emp.role,
      gender: emp.gender || "MALE",
      departmentId: String(emp.departmentId || ""),
      gradeLevel: emp.gradeLevel || 1,
      roleTitle: emp.roleTitle || "",
      dateJoined: emp.dateJoined ? String(emp.dateJoined).slice(0, 10) : new Date().toISOString().slice(0, 10),
    })
    setShowForm(true)
  }

  const handleSubmit = () => {
    const payload = {
      ...form,
      departmentId: form.departmentId ? Number(form.departmentId) : undefined,
      gradeLevel: Number(form.gradeLevel),
      roleTitle: form.roleTitle || ROLE_LABELS[form.role] || form.role,
      dateJoined: form.dateJoined || new Date().toISOString().slice(0, 10),
    }
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data: payload as Partial<Employee> })
    } else {
      createMutation.mutate(payload as any)
    }
  }

  const roleBadgeColor = (role: string) => {
    if (role === "HR_ADMIN") return "var(--accent-secondary)"
    if (role === "HOD") return "var(--accent-primary)"
    if (role === "AUDITOR") return "var(--accent-tertiary)"
    return "var(--text-muted)"
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Employee Management</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Manage all system users, roles, and department assignments.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="ghost"
            size="sm"
            icon={view === "table" ? <LayoutGrid size={14} /> : <LayoutList size={14} />}
            onClick={() => setView(view === "table" ? "card" : "table")}
          >
            {view === "table" ? "Card View" : "Table View"}
          </Button>
          <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search + Department filter */}
      <Card>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              placeholder="Search by name, staff ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              color: deptFilter ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: "13px",
              outline: "none",
              minWidth: "180px",
              cursor: "pointer",
            }}
          >
            <option value="">All Departments</option>
            {(departments || []).map((d: Department) => (
              <option key={d.id} value={String(d.id)}>{d.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Employee list */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>
            EMPLOYEES ({filtered.length})
          </h3>
        </div>

        {isLoading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : view === "table" ? (
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "0.5fr 1.5fr 1.5fr 1fr 1fr 0.8fr",
              gap: "8px",
              padding: "8px 12px",
              background: "var(--bg-elevated)",
              borderRadius: "8px",
              marginBottom: "4px",
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.8px",
            }}>
              <span>ID</span><span>NAME</span><span>EMAIL</span><span>DEPT</span><span>ROLE</span><span>ACTIONS</span>
            </div>
            {pagedEmployees.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.5fr 1.5fr 1.5fr 1fr 1fr 0.8fr",
                  gap: "8px",
                  padding: "10px 12px",
                  borderBottom: "1px solid var(--border-default)",
                  alignItems: "center",
                  fontSize: "12px",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "11px" }}>#{emp.id}</span>
                <span style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{emp.email}</span>
                <span style={{ color: "var(--text-secondary)" }}>{emp.departmentName || "—"}</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: roleBadgeColor(emp.role), background: `${roleBadgeColor(emp.role)}15`, border: `1px solid ${roleBadgeColor(emp.role)}40`, borderRadius: "999px", padding: "2px 8px", display: "inline-block" }}>
                  {ROLE_LABELS[emp.role] || emp.role}
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => openEdit(emp)} title="Edit" style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", padding: "4px" }}>
                    <Edit2 size={13} />
                  </button>
                  {isAuditor && (
                    <button onClick={() => { setResetTarget(emp); setResetPwd("") }} title="Reset password" style={{ background: "none", border: "none", color: "var(--accent-tertiary)", cursor: "pointer", padding: "4px" }}>
                      <KeyRound size={13} />
                    </button>
                  )}
                  <button onClick={() => setDeleteTarget(emp)} title="Delete" style={{ background: "none", border: "none", color: "var(--status-rejected)", cursor: "pointer", padding: "4px" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                <Users size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
                <div>No employees found.</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
            {pagedEmployees.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  padding: "16px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--accent-primary)20", border: "1px solid var(--accent-primary)40", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--accent-primary)", fontSize: "14px" }}>
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => openEdit(emp)} title="Edit" style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer" }}><Edit2 size={13} /></button>
                    {isAuditor && (
                      <button onClick={() => { setResetTarget(emp); setResetPwd("") }} title="Reset password" style={{ background: "none", border: "none", color: "var(--accent-tertiary)", cursor: "pointer" }}><KeyRound size={13} /></button>
                    )}
                    <button onClick={() => setDeleteTarget(emp)} title="Delete" style={{ background: "none", border: "none", color: "var(--status-rejected)", cursor: "pointer" }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "2px" }}>{emp.firstName} {emp.lastName}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>{emp.staffId} · {emp.departmentName}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>{emp.email}</div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: roleBadgeColor(emp.role), background: `${roleBadgeColor(emp.role)}15`, border: `1px solid ${roleBadgeColor(emp.role)}40`, borderRadius: "999px", padding: "2px 8px" }}>
                  {ROLE_LABELS[emp.role] || emp.role}
                </span>
              </motion.div>
            ))}
          </div>
        )}
        {filtered.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", fontSize: "12px", color: "var(--text-muted)" }}>
            <span>Page {page + 1} of {pageCount} - {filtered.length} employees</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button size="sm" variant="ghost" icon={<ChevronLeft size={14} />} disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
              <Button size="sm" variant="ghost" icon={<ChevronRight size={14} />} disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit slide-over */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", justifyContent: "flex-end" }}
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                width: "420px",
                height: "100%",
                background: "var(--bg-surface)",
                borderLeft: "1px solid var(--border-default)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "24px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: 700, fontSize: "16px" }}>
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </h3>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Input
                    label="First Name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="John"
                  />
                  <Input
                    label="Last Name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john.doe@nimasa.gov.ng"
                />
                <Input
                  label="Staff ID"
                  value={form.staffId}
                  onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                  placeholder="NIM-001"
                />
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Grade Level
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "6px" }}>(affects leave entitlement)</span>
                  </label>
                  <select
                    value={form.gradeLevel}
                    onChange={(e) => setForm({ ...form, gradeLevel: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                  >
                    {GRADE_LEVELS.map((gl) => (
                      <option key={gl} value={gl}>GL {String(gl).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Gender
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "6px" }}>(maternity leave applies to female staff only)</span>
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Department</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                  >
                    <option value="">Select department</option>
                    {(departments || []).map((d: Department) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                  >
                    {assignableRoles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
                  </select>
                </div>
                <Input
                  label="Official Job Title"
                  value={form.roleTitle}
                  onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                  placeholder="e.g. Senior Administrative Officer"
                />
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Date Joined</label>
                  <input
                    type="date"
                    value={form.dateJoined}
                    onChange={(e) => setForm({ ...form, dateJoined: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ padding: "20px 24px", borderTop: "1px solid var(--border-default)", display: "flex", gap: "10px" }}>
                <Button variant="ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</Button>
                <Button
                  variant="primary"
                  style={{ flex: 1 }}
                  loading={createMutation.isPending || updateMutation.isPending}
                  onClick={handleSubmit}
                >
                  {editingEmployee ? "Save Changes" : "Create Employee"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset password modal (auditor only) */}
      {resetTarget && (
        <Modal
          open
          onClose={() => { setResetTarget(null); setResetPwd("") }}
          title="Reset User Password"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "14px", background: "var(--accent-primary-bg)", border: "1px solid var(--border-accent)", borderRadius: "10px", fontSize: "13px", color: "var(--text-secondary)" }}>
              Set a temporary password for <strong>{resetTarget.firstName} {resetTarget.lastName}</strong>. They will be required to choose their own password the next time they log in.
            </div>
            <Input
              label="Temporary Password (min 8 characters)"
              type="text"
              value={resetPwd}
              onChange={(e) => setResetPwd(e.target.value)}
              placeholder="e.g. Welcome@2026"
            />
            <Button
              variant="primary"
              loading={resetMutation.isPending}
              disabled={resetPwd.trim().length < 8}
              onClick={() => resetMutation.mutate({ id: resetTarget.id, newPassword: resetPwd.trim() })}
            >
              Reset Password
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <Modal
          open
          onClose={() => { setDeleteTarget(null); setConfirmName("") }}
          title="Confirm Delete"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "13px", color: "var(--text-secondary)" }}>
              This action <strong style={{ color: "var(--status-rejected)" }}>cannot be undone</strong>. Type the employee's full name to confirm.
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              {deleteTarget.firstName} {deleteTarget.lastName}
            </div>
            <Input
              label='Type full name to confirm'
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={`${deleteTarget.firstName} ${deleteTarget.lastName}`}
            />
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              disabled={confirmName !== `${deleteTarget.firstName} ${deleteTarget.lastName}`}
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
            >
              Delete Employee
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

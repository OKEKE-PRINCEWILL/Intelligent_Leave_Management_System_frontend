import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Building2, Plus, Edit2, Trash2, Users, X, Umbrella, Search, ChevronLeft, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Modal } from "../../components/ui/Modal"
import { SkeletonCard } from "../../components/ui/Skeleton"
import { adminApi } from "../../api/admin.api"
import { analyticsApi } from "../../api/analytics.api"
import { getApiErrorMessage } from "../../api/axios"
import type { Department } from "../../types/api.types"

const emptyForm = { name: "", code: "", description: "", hodName: "", totalStaff: 1, minStaff: 1, maxConcurrentLeave: 1 }

export function DepartmentManagement() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [confirmName, setConfirmName] = useState("")
  const [quickDeptName, setQuickDeptName] = useState("")
  const [form, setForm] = useState({ ...emptyForm })
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const pageSize = 8

  const { data: departments, isLoading } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: adminApi.getDepartments,
  })
  const { data: deptStats } = useQuery({
    queryKey: ["dept-analytics"],
    queryFn: analyticsApi.getByDepartment,
  })

  const createMutation = useMutation({
    mutationFn: adminApi.createDepartment,
    onSuccess: () => {
      toast.success("Department created.")
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] })
      queryClient.invalidateQueries({ queryKey: ["dept-analytics"] })
      setShowForm(false)
      setForm({ ...emptyForm })
      setQuickDeptName("")
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Department> }) =>
      adminApi.updateDepartment(id, data),
    onSuccess: () => {
      toast.success("Department updated.")
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] })
      queryClient.invalidateQueries({ queryKey: ["dept-analytics"] })
      setShowForm(false)
      setEditingDept(null)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteDepartment,
    onSuccess: () => {
      toast.success("Department deleted.")
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] })
      setDeleteTarget(null)
      setConfirmName("")
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const openCreate = () => {
    setEditingDept(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }

  const openEdit = (dept: Department) => {
    setEditingDept(dept)
    setForm({
      name: dept.name,
      code: dept.code || "",
      description: dept.description || "",
      hodName: dept.hodName || "",
      totalStaff: dept.totalStaff ?? 1,
      minStaff: dept.minStaff ?? 1,
      maxConcurrentLeave: dept.maxConcurrentLeave ?? 1,
    })
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (editingDept) {
      updateMutation.mutate({ id: editingDept.id, data: form })
    } else {
      createMutation.mutate(form as any)
    }
  }

  const makeCode = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 6)
      .toUpperCase() || `DEPT${Date.now().toString().slice(-4)}`

  const handleQuickAdd = () => {
    if (!quickDeptName.trim()) {
      toast.error("Enter a department name.")
      return
    }
    createMutation.mutate({
      name: quickDeptName.trim(),
      code: makeCode(quickDeptName),
      totalStaff: 1,
      minStaff: 1,
      maxConcurrentLeave: 1,
    } as any)
  }

  const filteredDepartments = (departments || []).filter((dept) => {
    const q = search.toLowerCase()
    const stats = deptStats?.find((s) => s.departmentId === dept.id)
    return !q
      || dept.name?.toLowerCase().includes(q)
      || dept.code?.toLowerCase().includes(q)
      || dept.hodName?.toLowerCase().includes(q)
      || String(stats?.totalStaff ?? dept.totalStaff ?? "").includes(q)
  })
  const pageCount = Math.max(1, Math.ceil(filteredDepartments.length / pageSize))
  const pagedDepartments = filteredDepartments.slice(page * pageSize, page * pageSize + pageSize)

  React.useEffect(() => {
    setPage(0)
  }, [search])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Department Management</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Manage organizational departments and their HOD assignments.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>
          Add Department
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
        <Card>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>Departments</div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--accent-primary)" }}>
            {departments?.length || 0}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>Employees</div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--status-approved)" }}>
            {(deptStats || []).reduce((sum, dept) => sum + (dept.totalStaff || 0), 0)}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>Employees On Leave</div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--accent-tertiary)" }}>
            {(deptStats || []).reduce((sum, dept) => sum + (dept.currentOnLeave || 0), 0)}
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 260px" }}>
            <Input
              label="Add New Department"
              value={quickDeptName}
              onChange={(e) => setQuickDeptName(e.target.value)}
              placeholder="Department name"
            />
          </div>
          <Button variant="primary" icon={<Plus size={14} />} loading={createMutation.isPending} onClick={handleQuickAdd}>
            Add
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <SkeletonCard rows={4} />
      ) : (
        <>
        <Card>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by department, code, HOD, or staff count..."
              style={{ width: "100%", boxSizing: "border-box", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "10px", padding: "10px 12px 10px 36px", fontSize: "13px", color: "var(--text-primary)", outline: "none" }}
            />
          </div>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {pagedDepartments.map((dept: Department, i: number) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card glow={false}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "rgba(139,90,43,0.1)",
                      border: "1px solid rgba(139,90,43,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Building2 size={18} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px" }}>{dept.name}</div>
                      {dept.code && (
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {dept.code}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => openEdit(dept)} style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", padding: "6px" }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(dept)} style={{ background: "none", border: "none", color: "var(--status-rejected)", cursor: "pointer", padding: "6px" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {dept.description && (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px", lineHeight: 1.5 }}>
                    {dept.description}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border-default)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <Users size={12} />
                    <span>{deptStats?.find((s) => s.departmentId === dept.id)?.totalStaff ?? dept.employeeCount ?? dept.totalStaff ?? 0} employees</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--accent-tertiary)" }}>
                    <Umbrella size={12} />
                    <span>{deptStats?.find((s) => s.departmentId === dept.id)?.currentOnLeave ?? 0} on leave</span>
                  </div>
                  {dept.hodName && (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      HOD: <span style={{ color: "var(--accent-primary)" }}>{dept.hodName}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredDepartments.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
              <Building2 size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
              <div>No departments found.</div>
            </div>
          )}
        </div>
        {filteredDepartments.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--text-muted)" }}>
            <span>Page {page + 1} of {pageCount} - {filteredDepartments.length} department{filteredDepartments.length === 1 ? "" : "s"}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button size="sm" variant="ghost" icon={<ChevronLeft size={14} />} disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
              <Button size="sm" variant="ghost" icon={<ChevronRight size={14} />} disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>Next</Button>
            </div>
          </div>
        )}
        </>
      )}

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
                width: "400px",
                height: "100%",
                background: "var(--bg-surface)",
                borderLeft: "1px solid var(--border-default)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ padding: "24px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: 700, fontSize: "16px" }}>
                  {editingDept ? "Edit Department" : "Add Department"}
                </h3>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
                <Input
                  label="Department Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Marine Safety"
                />
                <Input
                  label="Code (Optional)"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. MS-001"
                />
                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of department responsibilities..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <Input
                  label="HOD Name (Optional)"
                  value={form.hodName}
                  onChange={(e) => setForm({ ...form, hodName: e.target.value })}
                  placeholder="Head of Department name"
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Total Staff</label>
                    <input
                      type="number"
                      min={1}
                      value={form.totalStaff}
                      onChange={(e) => setForm({ ...form, totalStaff: Math.max(1, Number(e.target.value)) })}
                      style={{ width: "100%", padding: "10px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Min. On Duty</label>
                    <input
                      type="number"
                      min={1}
                      value={form.minStaff}
                      onChange={(e) => setForm({ ...form, minStaff: Math.max(1, Number(e.target.value)) })}
                      style={{ width: "100%", padding: "10px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Max on Leave</label>
                    <input
                      type="number"
                      min={1}
                      value={form.maxConcurrentLeave}
                      onChange={(e) => setForm({ ...form, maxConcurrentLeave: Math.max(1, Number(e.target.value)) })}
                      style={{ width: "100%", padding: "10px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
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
                  {editingDept ? "Save Changes" : "Create"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      {deleteTarget && (
        <Modal
          open
          onClose={() => { setDeleteTarget(null); setConfirmName("") }}
          title="Delete Department"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
              This will permanently delete <strong>{deleteTarget.name}</strong>. Employees will lose their department assignment.
            </div>
            <Input
              label={`Type "${deleteTarget.name}" to confirm`}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={deleteTarget.name}
            />
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              disabled={confirmName !== deleteTarget.name}
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
            >
              Delete Department
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

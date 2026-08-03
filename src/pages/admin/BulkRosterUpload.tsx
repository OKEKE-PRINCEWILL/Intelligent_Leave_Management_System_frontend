import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation } from "@tanstack/react-query"
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react"
import toast from "react-hot-toast"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { adminApi } from "../../api/admin.api"
import { getApiErrorMessage } from "../../api/axios"

interface RosterResult {
  created: number
  failed: number
  createdRecords: string[]
  errors: string[]
}

export function BulkRosterUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<RosterResult | null>(null)

  const uploadMutation = useMutation({
    mutationFn: adminApi.uploadLeaveRoster,
    onSuccess: (data) => {
      setResult(data)
      setSelectedFile(null)
      if (data.created > 0) {
        toast.success(`${data.created} leave request${data.created !== 1 ? "s" : ""} created.`)
      }
      if (data.failed > 0) {
        toast.error(`${data.failed} row${data.failed !== 1 ? "s" : ""} failed. See details below.`)
      }
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Please upload an Excel file (.xlsx or .xls)")
      return
    }
    setSelectedFile(file)
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleUpload = () => {
    if (!selectedFile) return
    uploadMutation.mutate(selectedFile)
  }

  const downloadTemplate = () => {
    const csvContent = [
      "Staff ID,Leave Type,Start Date,End Date or Duration (days),Reason",
      "E001,ANNUAL,2026-07-01,2026-07-10,Annual vacation",
      "E002,SICK,2026-07-05,3,Medical appointment",
      "E003,CASUAL,2026-07-08,2026-07-09,Personal errand",
      "E004,COMPASSIONATE,2026-07-15,5,Family bereavement",
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "leave_roster_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Bulk Leave Roster Upload</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Upload an Excel file to create multiple leave requests at once. Each row becomes one pending leave request.
        </p>
      </div>

      {/* Format guide */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>
            REQUIRED EXCEL FORMAT
          </h3>
          <Button variant="ghost" size="sm" icon={<Download size={13} />} onClick={downloadTemplate}>
            Download Template
          </Button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "var(--bg-elevated)" }}>
                {["Column A — Staff ID", "Column B — Leave Type", "Column C — Start Date", "Column D — End Date / Duration", "Column E — Reason"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["E001", "ANNUAL", "2026-07-01", "2026-07-10", "Annual vacation"],
                ["E002", "SICK", "2026-07-05", "3 (days)", "Medical appointment"],
                ["E003", "CASUAL", "2026-07-08", "2026-07-09", "Personal errand"],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-default)" }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: "8px 12px", color: j === 1 ? "var(--accent-primary)" : "var(--text-secondary)", fontFamily: j === 0 ? "var(--font-mono)" : "inherit" }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
          <strong>Valid leave types:</strong> ANNUAL · CASUAL · SICK · COMPASSIONATE · MATERNITY · STUDY
          &nbsp;·&nbsp;
          <strong>Dates:</strong> YYYY-MM-DD or DD/MM/YYYY
          &nbsp;·&nbsp;
          <strong>Duration:</strong> You can put number of days instead of end date for open-ended leaves
        </div>
      </Card>

      {/* Drop zone */}
      <Card>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "var(--accent-primary)" : selectedFile ? "var(--status-approved)" : "var(--border-default)"}`,
            borderRadius: "12px",
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "var(--accent-primary-bg)" : selectedFile ? "rgba(5,150,105,0.04)" : "var(--bg-elevated)",
            transition: "all 0.2s ease",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleInputChange}
          />
          {selectedFile ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <FileSpreadsheet size={36} color="var(--status-approved)" />
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{selectedFile.name}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {(selectedFile.size / 1024).toFixed(1)} KB — click to change file
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <Upload size={36} color={dragging ? "var(--accent-primary)" : "var(--text-muted)"} />
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                {dragging ? "Drop the file here" : "Drag & drop your Excel file here"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>or click to browse — .xlsx or .xls files only</div>
            </div>
          )}
        </div>

        {selectedFile && (
          <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
            <Button
              variant="primary"
              loading={uploadMutation.isPending}
              onClick={handleUpload}
              icon={<Upload size={14} />}
              style={{ flex: 1 }}
            >
              {uploadMutation.isPending ? "Processing..." : "Upload & Process"}
            </Button>
            <Button variant="ghost" onClick={() => { setSelectedFile(null); setResult(null) }}>
              Clear
            </Button>
          </div>
        )}
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {/* Summary row */}
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{
                flex: 1, padding: "16px", borderRadius: "12px",
                background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.25)",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <CheckCircle size={20} color="var(--status-approved)" />
                <div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--status-approved)" }}>{result.created}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Requests created</div>
                </div>
              </div>
              <div style={{
                flex: 1, padding: "16px", borderRadius: "12px",
                background: result.failed > 0 ? "rgba(220,38,38,0.07)" : "var(--bg-elevated)",
                border: `1px solid ${result.failed > 0 ? "rgba(220,38,38,0.25)" : "var(--border-default)"}`,
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                {result.failed > 0 ? <XCircle size={20} color="var(--status-rejected)" /> : <CheckCircle size={20} color="var(--text-muted)" />}
                <div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: result.failed > 0 ? "var(--status-rejected)" : "var(--text-muted)" }}>{result.failed}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Rows failed</div>
                </div>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <AlertTriangle size={15} color="var(--status-rejected)" />
                  <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>
                    ERRORS ({result.errors.length})
                  </h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
                  {result.errors.map((e, i) => (
                    <div key={i} style={{
                      padding: "8px 12px",
                      background: "rgba(220,38,38,0.06)",
                      border: "1px solid rgba(220,38,38,0.2)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}>
                      {e}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Created list */}
            {result.createdRecords.length > 0 && (
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <CheckCircle size={15} color="var(--status-approved)" />
                  <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>
                    CREATED ({result.createdRecords.length})
                  </h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "200px", overflowY: "auto" }}>
                  {result.createdRecords.map((r, i) => (
                    <div key={i} style={{
                      padding: "6px 12px",
                      background: "var(--bg-elevated)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}>
                      {r}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

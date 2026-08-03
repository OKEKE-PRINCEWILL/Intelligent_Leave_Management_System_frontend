import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ModalProps {
  open: boolean
  onClose?: () => void
  title?: string
  children: React.ReactNode
  width?: number | string
  dismissable?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 520,
  dismissable = true,
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={dismissable ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-accent)",
              borderRadius: "20px",
              padding: "28px",
              width: "100%",
              maxWidth: width,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "var(--glow-cyan), 0 24px 64px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border-default)",
                }}
              >
                <h2 style={{ fontSize: "18px", margin: 0 }}>{title}</h2>
                {dismissable && onClose && (
                  <button
                    onClick={onClose}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "20px",
                      lineHeight: 1,
                      padding: "4px",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import React, { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { notificationsApi } from "../../api/notifications.api"
import { useNotificationsStore } from "../../store/notifications.store"

export function Shell() {
  const setNotifications = useNotificationsStore((state) => state.setNotifications)
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.getAll,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (notifications) setNotifications(notifications)
  }, [notifications, setNotifications])

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header />
        <motion.main
          key="main-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ flex: 1, padding: "24px", overflowX: "hidden" }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}

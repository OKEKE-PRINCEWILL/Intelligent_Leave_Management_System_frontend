import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import App from "./App"
import "./styles/globals.css"
import "./styles/animations.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "10px",
            fontSize: "13px",
            fontFamily: "var(--font-primary)",
          },
          success: {
            iconTheme: { primary: "var(--status-approved)", secondary: "var(--bg-base)" },
          },
          error: {
            iconTheme: { primary: "var(--status-rejected)", secondary: "var(--bg-base)" },
          },
          duration: 3500,
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
)

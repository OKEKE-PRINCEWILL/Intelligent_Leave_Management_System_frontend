import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    // Never ship source maps to production (they expose original source).
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split stable vendor libraries into their own long-cached chunks.
        // (Recharts, react-hook-form, zod, etc. stay in their lazy route
        // chunks via React.lazy — don't list them here.)
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "data-vendor": ["@tanstack/react-query", "axios", "zustand"],
          "motion-vendor": ["framer-motion"],
        },
      },
    },
  },
})

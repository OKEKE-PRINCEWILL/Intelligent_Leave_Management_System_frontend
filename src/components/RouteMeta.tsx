import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { getDocumentTitle } from "../lib/pageMeta"

/**
 * Keeps the browser tab title in sync with the current route. Rendered once,
 * inside the Router, so it covers public, protected, and 404 routes alike.
 */
export function RouteMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = getDocumentTitle(pathname)
  }, [pathname])

  return null
}

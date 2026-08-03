import { useState, useCallback } from "react"

export function useAlgorithmSteps(delayMs = 400) {
  const [visibleSteps, setVisibleSteps] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runSteps = useCallback(
    async (steps: string[], onComplete?: () => void) => {
      setVisibleSteps([])
      setIsRunning(true)
      for (const step of steps) {
        await new Promise<void>((res) => setTimeout(res, delayMs))
        setVisibleSteps((prev) => [...prev, step])
      }
      setIsRunning(false)
      onComplete?.()
    },
    [delayMs]
  )

  const reset = useCallback(() => {
    setVisibleSteps([])
    setIsRunning(false)
  }, [])

  return { visibleSteps, isRunning, runSteps, reset }
}

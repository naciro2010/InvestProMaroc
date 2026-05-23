import { useState, useCallback, useRef, useEffect } from 'react'

interface UndoState {
  isUndoAvailable: boolean
  fieldName: string | null
  timeRemaining: number
}

interface UseInlineUndoOptions {
  undoWindowMs?: number
  onUndo?: (fieldName: string, previousValue: unknown) => void
  onConfirm?: (fieldName: string, newValue: unknown) => void
}

export function useInlineUndo(options: UseInlineUndoOptions = {}) {
  const { undoWindowMs = 4000, onUndo, onConfirm } = options
  const [undoState, setUndoState] = useState<UndoState>({
    isUndoAvailable: false,
    fieldName: null,
    timeRemaining: 0,
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const previousValueRef = useRef<unknown>(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  // Arrête les timers au démontage pour éviter un setState sur composant démonté
  // (et un onConfirm déclenché après la disparition du composant).
  useEffect(() => clearTimers, [clearTimers])

  const trackChange = useCallback(
    (fieldName: string, previousValue: unknown, newValue: unknown) => {
      clearTimers()
      previousValueRef.current = previousValue

      setUndoState({
        isUndoAvailable: true,
        fieldName,
        timeRemaining: undoWindowMs,
      })

      intervalRef.current = setInterval(() => {
        setUndoState((prev) => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 100),
        }))
      }, 100)

      timerRef.current = setTimeout(() => {
        clearTimers()
        setUndoState({ isUndoAvailable: false, fieldName: null, timeRemaining: 0 })
        onConfirm?.(fieldName, newValue)
      }, undoWindowMs)
    },
    [undoWindowMs, clearTimers, onConfirm]
  )

  const undo = useCallback(() => {
    clearTimers()
    if (undoState.fieldName) {
      onUndo?.(undoState.fieldName, previousValueRef.current)
    }
    setUndoState({ isUndoAvailable: false, fieldName: null, timeRemaining: 0 })
  }, [undoState.fieldName, clearTimers, onUndo])

  const dismiss = useCallback(() => {
    clearTimers()
    setUndoState({ isUndoAvailable: false, fieldName: null, timeRemaining: 0 })
  }, [clearTimers])

  return {
    ...undoState,
    trackChange,
    undo,
    dismiss,
  }
}

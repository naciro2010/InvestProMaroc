import { useEffect, useRef, useCallback, useState } from 'react'
import type { ConventionWizardFormData } from './types'

const STORAGE_KEY = 'convention-wizard-draft'
const AUTOSAVE_DELAY_MS = 2000

interface AutosaveState {
  formData: ConventionWizardFormData
  activeStep: number
  templateId?: string
  savedAt: string
}

interface UseConventionAutosaveResult {
  /** Whether a saved draft exists */
  hasDraft: boolean
  /** Timestamp of last save */
  lastSaved: Date | null
  /** Whether currently saving */
  isSaving: boolean
  /** Restore from draft - returns form data and active step */
  restoreDraft: () => AutosaveState | null
  /** Clear the saved draft */
  clearDraft: () => void
  /** Trigger save */
  saveDraft: (data: ConventionWizardFormData, activeStep: number, templateId?: string) => void
}

export const useConventionAutosave = (
  isEditing: boolean
): UseConventionAutosaveResult => {
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Check for existing draft on mount
  useEffect(() => {
    if (isEditing) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: AutosaveState = JSON.parse(stored)
        setHasDraft(true)
        setLastSaved(new Date(parsed.savedAt))
      }
    } catch {
      // Corrupt data, remove it
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [isEditing])

  const saveDraft = useCallback(
    (data: ConventionWizardFormData, activeStep: number, templateId?: string) => {
      if (isEditing) return

      // Debounce saves
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        setIsSaving(true)
        try {
          const state: AutosaveState = {
            formData: data,
            activeStep,
            templateId,
            savedAt: new Date().toISOString(),
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
          setHasDraft(true)
          setLastSaved(new Date())
        } catch {
          // localStorage full or unavailable
        } finally {
          setIsSaving(false)
        }
      }, AUTOSAVE_DELAY_MS)
    },
    [isEditing]
  )

  const restoreDraft = useCallback((): AutosaveState | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      return JSON.parse(stored) as AutosaveState
    } catch {
      return null
    }
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHasDraft(false)
    setLastSaved(null)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return {
    hasDraft,
    lastSaved,
    isSaving,
    restoreDraft,
    clearDraft,
    saveDraft,
  }
}

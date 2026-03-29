import { useEffect, useRef, useCallback, useState } from 'react'
import type { ConventionWizardFormData } from './types'

const STORAGE_KEY = 'convention-wizard-draft'
const AUTOSAVE_DELAY_MS = 2000

export interface AutosaveState {
  formData: ConventionWizardFormData
  activeStep: number
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
  /** Trigger save (debounced) */
  saveDraft: (data: ConventionWizardFormData, activeStep: number) => void
}

/** Save draft immediately to localStorage (no debounce) */
const saveToStorage = (data: ConventionWizardFormData, activeStep: number): void => {
  try {
    const state: AutosaveState = {
      formData: data,
      activeStep,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable
  }
}

/** Get all local drafts from localStorage */
export const getLocalDrafts = (): AutosaveState[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as AutosaveState
    if (parsed?.formData?.code) return [parsed]
    return []
  } catch {
    return []
  }
}

export const useConventionAutosave = (
  isEditing: boolean
): UseConventionAutosaveResult => {
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Keep a ref to the latest data so we can save on unmount/beforeunload
  const latestDataRef = useRef<{ data: ConventionWizardFormData; step: number } | null>(null)
  const isEditingRef = useRef(isEditing)
  isEditingRef.current = isEditing

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
    (data: ConventionWizardFormData, activeStep: number) => {
      if (isEditing) return

      // Always update the ref with latest data for unmount save
      latestDataRef.current = { data, step: activeStep }

      // Debounce saves for normal typing
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        setIsSaving(true)
        try {
          saveToStorage(data, activeStep)
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
    latestDataRef.current = null
    setHasDraft(false)
    setLastSaved(null)
  }, [])

  // Save immediately on beforeunload (browser close/refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isEditingRef.current && latestDataRef.current) {
        saveToStorage(latestDataRef.current.data, latestDataRef.current.step)
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // On unmount: flush any pending debounced save immediately
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      // Save immediately on unmount (navigation away from form)
      if (!isEditingRef.current && latestDataRef.current) {
        saveToStorage(latestDataRef.current.data, latestDataRef.current.step)
      }
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

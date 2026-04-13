import { useState, useCallback } from 'react'

const STORAGE_KEY = 'investpro-dashboard-widgets'

interface DashboardPreferences {
  hiddenWidgets: string[]
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  hiddenWidgets: [],
}

export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES
    } catch {
      return DEFAULT_PREFERENCES
    }
  })

  const save = useCallback((prefs: DashboardPreferences) => {
    setPreferences(prefs)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [])

  const toggleWidget = useCallback(
    (widgetId: string) => {
      const hidden = preferences.hiddenWidgets.includes(widgetId)
        ? preferences.hiddenWidgets.filter((id) => id !== widgetId)
        : [...preferences.hiddenWidgets, widgetId]
      save({ ...preferences, hiddenWidgets: hidden })
    },
    [preferences, save]
  )

  const isWidgetVisible = useCallback(
    (widgetId: string) => !preferences.hiddenWidgets.includes(widgetId),
    [preferences.hiddenWidgets]
  )

  const resetToDefaults = useCallback(() => {
    save(DEFAULT_PREFERENCES)
  }, [save])

  return {
    preferences,
    toggleWidget,
    isWidgetVisible,
    resetToDefaults,
    hiddenCount: preferences.hiddenWidgets.length,
  }
}

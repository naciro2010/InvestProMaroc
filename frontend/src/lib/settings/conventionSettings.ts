export type ConventionTypeValue = 'CADRE' | 'NON_CADRE' | 'SPECIFIQUE' | 'AVENANT'

export interface ConventionTypeOption {
  value: ConventionTypeValue
  label: string
  enabled: boolean
}

export interface ConventionSettings {
  codeMaskPattern: string
  codeMaskPlaceholder: string
  numeroMaskPattern: string
  numeroMaskPlaceholder: string
  typeConventionOptions: ConventionTypeOption[]
}

const SETTINGS_KEY = 'investpro:convention-settings'

const DEFAULT_TYPE_OPTIONS: ConventionTypeOption[] = [
  { value: 'CADRE', label: 'Convention principale', enabled: true },
  { value: 'NON_CADRE', label: 'Convention secondaire', enabled: true },
  { value: 'SPECIFIQUE', label: 'Convention spécifique', enabled: false },
  { value: 'AVENANT', label: 'Convention avenant', enabled: false },
]

const DEFAULT_SETTINGS: ConventionSettings = {
  codeMaskPattern: '^[A-Za-z0-9-]+$',
  codeMaskPlaceholder: 'CON-09-01',
  numeroMaskPattern: '^[A-Za-z0-9/-]+$',
  numeroMaskPlaceholder: 'N°2026/001',
  typeConventionOptions: DEFAULT_TYPE_OPTIONS,
}

const mergeTypeOptions = (
  saved: ConventionTypeOption[] | undefined,
  defaults: ConventionTypeOption[]
): ConventionTypeOption[] => {
  if (!saved) return defaults
  const mapped = new Map(saved.map((option) => [option.value, option]))
  return defaults.map((option) => ({
    ...option,
    ...mapped.get(option.value),
  }))
}

export const loadConventionSettings = (): ConventionSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<ConventionSettings>

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      typeConventionOptions: mergeTypeOptions(
        parsed.typeConventionOptions,
        DEFAULT_TYPE_OPTIONS
      ),
    }
  } catch (error) {
    console.warn('Impossible de charger les paramètres des conventions', error)
    return DEFAULT_SETTINGS
  }
}

export const saveConventionSettings = (settings: ConventionSettings) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export const getEnabledConventionTypes = (settings: ConventionSettings) =>
  settings.typeConventionOptions.filter((option) => option.enabled)

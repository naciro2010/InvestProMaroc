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

const DEFAULT_TYPE_OPTIONS: ConventionTypeOption[] = [
  { value: 'CADRE', label: 'Convention cadre', enabled: true },
  { value: 'NON_CADRE', label: 'Convention non-cadre', enabled: true },
  { value: 'SPECIFIQUE', label: 'Convention spécifique', enabled: false },
  { value: 'AVENANT', label: 'Convention avenant', enabled: false },
]

export const DEFAULT_CONVENTION_CONFIGURATION: ConventionSettings = {
  codeMaskPattern: '^[A-Za-z0-9-]+$',
  codeMaskPlaceholder: 'CON-09-01',
  numeroMaskPattern: '^[A-Za-z0-9/-]+$',
  numeroMaskPlaceholder: 'N°2026/001',
  typeConventionOptions: DEFAULT_TYPE_OPTIONS,
}

export const normalizeConventionConfiguration = (
  saved: Partial<ConventionSettings> | undefined
): ConventionSettings => {
  if (!saved) return DEFAULT_CONVENTION_CONFIGURATION
  return {
    ...DEFAULT_CONVENTION_CONFIGURATION,
    ...saved,
    typeConventionOptions: mergeTypeOptions(
      saved.typeConventionOptions,
      DEFAULT_TYPE_OPTIONS
    ),
  }
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

export const getEnabledConventionTypes = (settings: ConventionSettings) =>
  settings.typeConventionOptions.filter((option) => option.enabled)

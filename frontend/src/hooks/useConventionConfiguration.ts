import { useCallback, useEffect, useState } from 'react'
import { conventionConfigurationAPI } from '@/lib/api'
import {
  ConventionSettings,
  DEFAULT_CONVENTION_CONFIGURATION,
  ConventionTypeValue,
  normalizeConventionConfiguration,
} from '@/lib/settings/conventionSettings'

interface UseConventionConfigurationResult {
  configuration: ConventionSettings
  loading: boolean
  error: string | null
  reload: () => void
  setConfiguration: (next: ConventionSettings) => void
}

export const useConventionConfiguration = (): UseConventionConfigurationResult => {
  const [configuration, setConfiguration] = useState<ConventionSettings>(
    DEFAULT_CONVENTION_CONFIGURATION
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfiguration = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await conventionConfigurationAPI.get()
      const data = response.data?.data ?? response.data
      const normalizedPayload = data?.typeConfigurations
        ? {
            ...data,
            typeConventionOptions: data.typeConfigurations.map((option: {
              typeCode: string
              libelle: string
              enabled: boolean
            }) => ({
              value: option.typeCode as ConventionTypeValue,
              label: option.libelle,
              enabled: option.enabled,
            })),
          }
        : data
      setConfiguration(normalizeConventionConfiguration(normalizedPayload))
    } catch (err) {
      setError('Impossible de charger le paramétrage des conventions')
      setConfiguration(DEFAULT_CONVENTION_CONFIGURATION)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfiguration()
  }, [fetchConfiguration])

  return {
    configuration,
    loading,
    error,
    reload: fetchConfiguration,
    setConfiguration,
  }
}

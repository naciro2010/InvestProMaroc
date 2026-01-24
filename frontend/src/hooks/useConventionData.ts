import { useState, useEffect } from 'react'
import { conventionsAPI } from '@/lib/api'
import {
  ConventionBasicDTO,
  ConventionFinancesDTO,
  ConventionDatesDTO,
  ConventionStatsDTO,
  ApiResponse,
} from '@/types/api'

interface UseConventionDataOptions {
  enabled?: boolean
}

/**
 * Custom hook for progressive lazy loading of convention data
 * Implements micro-services pattern with independent data fetching
 */

export const useConventionBasic = (id: number | undefined, options: UseConventionDataOptions = {}) => {
  const { enabled = true } = options
  const [data, setData] = useState<ConventionBasicDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id || !enabled) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await conventionsAPI.getBasic(id)
        const responseData = response.data as ApiResponse<ConventionBasicDTO>
        setData(responseData.data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load basic info'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, enabled])

  return { data, loading, error }
}

export const useConventionFinances = (id: number | undefined, options: UseConventionDataOptions = {}) => {
  const { enabled = true } = options
  const [data, setData] = useState<ConventionFinancesDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id || !enabled) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await conventionsAPI.getFinances(id)
        const responseData = response.data as ApiResponse<ConventionFinancesDTO>
        setData(responseData.data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load finances info'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, enabled])

  return { data, loading, error }
}

export const useConventionDates = (id: number | undefined, options: UseConventionDataOptions = {}) => {
  const { enabled = true } = options
  const [data, setData] = useState<ConventionDatesDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id || !enabled) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await conventionsAPI.getDates(id)
        const responseData = response.data as ApiResponse<ConventionDatesDTO>
        setData(responseData.data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load dates info'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, enabled])

  return { data, loading, error }
}

export const useConventionStats = (id: number | undefined, options: UseConventionDataOptions = {}) => {
  const { enabled = true } = options
  const [data, setData] = useState<ConventionStatsDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id || !enabled) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await conventionsAPI.getStats(id)
        const responseData = response.data as ApiResponse<ConventionStatsDTO>
        setData(responseData.data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load stats'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, enabled])

  return { data, loading, error }
}

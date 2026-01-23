import axios from 'axios'

export interface ErrorWithMessage {
  message?: string
}

export const getErrorMessage = (error: unknown, fallback = 'Une erreur est survenue'): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorWithMessage | undefined
    return data?.message ?? error.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  if (typeof error === 'string') {
    return error || fallback
  }

  return fallback
}

export const getErrorStatus = (error: unknown): number | undefined => {
  if (axios.isAxiosError(error)) {
    return error.response?.status
  }

  return undefined
}

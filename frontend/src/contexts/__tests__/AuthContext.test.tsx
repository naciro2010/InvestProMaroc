import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { AuthProvider, useAuth } from '../AuthContext'
import { ToastProvider } from '../ToastContext'

// Mock axios API
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}))

// Wrapper for hooks
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should provide auth context with initial state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })

    expect(result.current).toBeDefined()
    expect(result.current.login).toBeDefined()
    expect(result.current.logout).toBeDefined()
    expect(result.current.register).toBeDefined()

    // Wait for loading to finish
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should handle logout correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Set initial auth state in localStorage
    localStorage.setItem('accessToken', 'mock-token')
    localStorage.setItem('refreshToken', 'mock-refresh')

    // Call logout
    result.current.logout()

    // Verify logout cleared state
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  it('should have required auth methods', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })

    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.register).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })
})

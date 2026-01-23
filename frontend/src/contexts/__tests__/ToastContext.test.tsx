import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { ToastProvider, useToast } from '../ToastContext'

function Wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('ToastContext', () => {
  it('should provide toast context', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper })

    expect(result.current).toBeDefined()
    expect(result.current.showToast).toBeDefined()
    expect(typeof result.current.showToast).toBe('function')
  })

  it('should allow showing success toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper })

    act(() => {
      result.current.showToast('Success message', 'success')
    })

    // Toast was called without error
    expect(result.current.showToast).toBeDefined()
  })

  it('should allow showing error toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper })

    act(() => {
      result.current.showToast('Error message', 'error')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should allow showing info toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper })

    act(() => {
      result.current.showToast('Info message', 'info')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should allow showing warning toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper: Wrapper })

    act(() => {
      result.current.showToast('Warning message', 'warning')
    })

    expect(result.current.showToast).toBeDefined()
  })
})

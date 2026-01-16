/**
 * Unified Color System for InvestPro Maroc
 * All colors are defined here to ensure consistency across the application
 * Primary color: Blue-600 (#2563eb) - Modern, professional blue
 */

export const colors = {
  // Primary brand color - Blue
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#2563eb', // ← Use this everywhere (Material Blue 600)
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary color - Gray
  secondary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Success color - Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a', // ← Use for success states
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },

  // Warning color - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706', // ← Use for warning states
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Danger/Error color - Red
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626', // ← Use for error states
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Info color - Cyan
  info: {
    50: '#ecf0ff',
    100: '#cfe2ff',
    200: '#9ec5ff',
    300: '#6ea8ff',
    400: '#4d94ff',
    500: '#2e81ff',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Neutral/Gray - for text and backgrounds
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Status colors
  status: {
    active: '#16a34a',
    inactive: '#6b7280',
    pending: '#d97706',
    error: '#dc2626',
    success: '#16a34a',
    warning: '#d97706',
    info: '#2563eb',
  },

  // UI Elements
  ui: {
    border: '#e5e7eb',
    background: '#f9fafb',
    backgroundAlt: '#f3f4f6',
    text: '#111827',
    textSecondary: '#6b7280',
    white: '#ffffff',
    black: '#000000',
  },

  // Semantic colors for specific use cases
  semantic: {
    convention: {
      brouillon: '#f59e0b', // warning
      soumis: '#3b82f6', // info
      validee: '#10b981', // success
      en_execution: '#8b5cf6', // purple
      acheve: '#6b7280', // gray
    },
    marche: {
      active: '#10b981',
      completed: '#6b7280',
      delayed: '#ef4444',
      at_risk: '#f59e0b',
    },
    payment: {
      pending: '#f59e0b',
      completed: '#10b981',
      partial: '#3b82f6',
      overdue: '#ef4444',
    },
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    subtle: 'linear-gradient(135deg, #f0f9ff 0%, #ecf0ff 100%)',
  },
} as const

// Export type for TypeScript
export type Color = typeof colors
export type ColorKey = keyof Color

/**
 * Helper function to get a color value with fallback
 * Usage: getColor('primary', 600) => '#2563eb'
 */
export function getColor(colorGroup: keyof Omit<Color, 'gradients'>, shade?: number | string): string {
  const color = colors[colorGroup]
  if (typeof shade === 'undefined') {
    return color as unknown as string
  }
  return (color as Record<string | number, string>)[shade]
}

/**
 * Helper to get gradient
 * Usage: getGradient('primary') => 'linear-gradient(...)'
 */
export function getGradient(gradientName: keyof Color['gradients']): string {
  return colors.gradients[gradientName]
}

export default colors

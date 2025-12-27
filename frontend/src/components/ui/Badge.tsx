import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'gray'
  className?: string
}

export default function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-success-100 text-success-600',
    danger: 'bg-danger-100 text-danger-600',
    warning: 'bg-warning-100 text-warning-600',
    info: 'bg-info-100 text-info-600',
    gray: 'bg-gray-100 text-gray-600',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

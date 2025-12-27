import React from 'react'

interface XcomptaButtonProps {
  variant?: 'success' | 'danger' | 'info' | 'secondary' | 'outline-success' | 'outline-danger' | 'outline-info'
  children: React.ReactNode
  onClick?: () => void
  icon?: React.ReactNode
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const variants: Record<string, string> = {
  'success': 'bg-success hover:bg-green-600 text-white shadow-sm hover:shadow-md',
  'danger': 'bg-danger hover:bg-red-600 text-white shadow-sm hover:shadow-md',
  'info': 'bg-info hover:bg-cyan-600 text-white shadow-sm hover:shadow-md',
  'secondary': 'bg-gray-500 hover:bg-gray-600 text-white shadow-sm hover:shadow-md',
  'outline-success': 'border-2 border-success text-success hover:bg-success hover:text-white',
  'outline-danger': 'border-2 border-danger text-danger hover:bg-danger hover:text-white',
  'outline-info': 'border-2 border-info text-info hover:bg-info hover:text-white'
}

export const XcomptaButton: React.FC<XcomptaButtonProps> = ({
  variant = 'success',
  children,
  onClick,
  icon,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = ''
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-md font-medium font-rubik transition-all duration-200
        inline-flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  )
}

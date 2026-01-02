import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  icon?: ReactNode
  className?: string
}

export default function Button({
  children,
  variant = 'primary',
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium px-4 py-2 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-600-dark text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    success: 'bg-success-500 hover:bg-success-600 text-white',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

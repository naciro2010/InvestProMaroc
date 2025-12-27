import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  className?: string
  actions?: ReactNode
}

export default function Card({ children, title, className = '', actions }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded shadow-sm ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

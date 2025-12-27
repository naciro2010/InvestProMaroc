import React from 'react'

interface XcomptaCardProps {
  title?: string
  headerColor?: 'info' | 'success' | 'danger' | 'primary' | 'warning'
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

const headerColors: Record<string, string> = {
  info: 'bg-info text-white',
  success: 'bg-success text-white',
  danger: 'bg-danger text-white',
  primary: 'bg-xcompta-blue text-white',
  warning: 'bg-warning text-white'
}

export const XcomptaCard: React.FC<XcomptaCardProps> = ({
  title,
  headerColor = 'info',
  children,
  className = '',
  actions
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className={`px-6 py-4 flex justify-between items-center ${headerColors[headerColor]}`}>
          <h4 className="text-lg font-medium font-rubik">{title}</h4>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

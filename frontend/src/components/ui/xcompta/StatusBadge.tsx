import React from 'react'

export type Status = 'VALIDEE' | 'EN_COURS' | 'ACHEVE' | 'EN_RETARD' | 'ANNULE'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; className: string; icon: string }> = {
  VALIDEE: {
    label: 'Validée',
    className: 'bg-success text-white',
    icon: '🟢'
  },
  EN_COURS: {
    label: 'En cours',
    className: 'bg-warning text-white',
    icon: '🟠'
  },
  ACHEVE: {
    label: 'Achevé',
    className: 'bg-success text-white',
    icon: '✅'
  },
  EN_RETARD: {
    label: 'En retard',
    className: 'bg-danger text-white',
    icon: '🔴'
  },
  ANNULE: {
    label: 'Annulé',
    className: 'bg-gray-500 text-white',
    icon: '⚫'
  }
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.className} ${className}`}
    >
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </span>
  )
}

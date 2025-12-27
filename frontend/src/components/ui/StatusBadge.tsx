import Badge from './Badge'

export type Status = 'VALIDEE' | 'EN_COURS' | 'ACHEVE' | 'EN_RETARD' | 'ANNULE'

interface StatusBadgeProps {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<Status, { variant: 'success' | 'danger' | 'warning' | 'info' | 'gray'; label: string }> = {
    VALIDEE: { variant: 'success', label: 'Validée' },
    EN_COURS: { variant: 'info', label: 'En cours' },
    ACHEVE: { variant: 'success', label: 'Achevé' },
    EN_RETARD: { variant: 'warning', label: 'En retard' },
    ANNULE: { variant: 'danger', label: 'Annulé' },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

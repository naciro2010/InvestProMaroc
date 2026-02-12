import { ReactNode } from 'react'
import { Box, Typography, Stack } from '@mui/material'
import { colors, typography } from '@/lib/designSystem'

// ─── Data Types ─────────────────────────────────────────────────────────

export interface ConventionData {
  id: number
  code?: string
  objet?: string
  budget?: number
  montant?: number
  statut?: string
  typeConvention?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProjetData {
  id: number
  code?: string
  designation?: string
  budgetTotal?: number
  status?: string
  pourcentageAvancement?: number
}

export interface MarcheData {
  id: number
  code?: string
  objet?: string
  montantTtc?: number
  statut?: string
  createdAt?: string
}

export interface PaiementData {
  id: number
  montant?: number
  datePaiement?: string
  statut?: string
}

export interface DecompteData {
  id: number
  numero?: string
  montant?: number
  statut?: string
  createdAt?: string
}

export interface KPI {
  title: string
  value: number
  subtitle: string
  details?: string
  icon: ReactNode
  color: string
  bgColor: string
  loading: boolean
  path: string
}

export interface StatusBreakdown {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

export interface BudgetData {
  label: string
  budget: number
  consomme: number
}

export interface RecentItem {
  id: number
  code: string
  label: string
  status: string
  date: string
  type: 'convention' | 'marche' | 'projet' | 'decompte'
  path: string
}

export interface DashboardSectionProps {
  refreshKey: number
}

// ─── Helpers ────────────────────────────────────────────────────────────

export const formatLargeCurrency = (amount: number): string => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Md DH`
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M DH`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} K DH`
  return `${amount.toFixed(0)} DH`
}

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-'
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
  } catch {
    return '-'
  }
}

export const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon apres-midi'
  return 'Bonsoir'
}

// ─── Section Header Component ───────────────────────────────────────────

interface SectionHeaderProps {
  icon: ReactNode
  title: string
  action?: ReactNode
}

export const SectionHeader = ({ icon, title, action }: SectionHeaderProps) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 2.5,
    py: 1.5,
    borderBottom: `1px solid ${colors.divider}`,
  }}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ color: colors.textDisabled, display: 'flex' }}>
        {icon}
      </Box>
      <Typography sx={{
        fontWeight: typography.weights.medium,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
      }}>
        {title}
      </Typography>
    </Stack>
    {action}
  </Box>
)

// ─── API Data Extractor ─────────────────────────────────────────────────

export function extractApiData<T>(response: { data: T[] | { data?: T[] } }): T[] {
  return Array.isArray(response.data)
    ? response.data
    : (response.data?.data ?? [])
}

import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { CheckCircle, Clock, FileEdit, Archive } from 'lucide-react'
import { colors, typography, borders, transitions } from '@/lib/designSystem'

export type ConventionSection = 'actives' | 'en_attente' | 'terminees' | 'brouillons_locaux'

interface SectionConfig {
  key: ConventionSection
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  bgActive: string
  description: string
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'actives',
    label: 'Actives',
    icon: <CheckCircle size={15} />,
    color: colors.success[700],
    bgColor: colors.success[50],
    bgActive: colors.success[100],
    description: 'Validees et en execution',
  },
  {
    key: 'en_attente',
    label: 'En attente',
    icon: <Clock size={15} />,
    color: colors.warning[700],
    bgColor: colors.warning[50],
    bgActive: colors.warning[100],
    description: 'Brouillons, soumises et rejetees',
  },
  {
    key: 'terminees',
    label: 'Terminees',
    icon: <Archive size={15} />,
    color: colors.neutral[600],
    bgColor: colors.neutral[50],
    bgActive: colors.neutral[100],
    description: 'Conventions achevees',
  },
  {
    key: 'brouillons_locaux',
    label: 'Mes brouillons',
    icon: <FileEdit size={15} />,
    color: colors.purple[700],
    bgColor: colors.purple[50],
    bgActive: colors.purple[100],
    description: 'Formulaires en cours de creation',
  },
]

interface ConventionSectionTabsProps {
  activeSection: ConventionSection
  onSectionChange: (section: ConventionSection) => void
  counts: Record<ConventionSection, number>
}

const ConventionSectionTabs = ({
  activeSection,
  onSectionChange,
  counts,
}: ConventionSectionTabsProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0,
        borderBottom: `2px solid ${colors.divider}`,
        mb: 0,
      }}
    >
      {SECTIONS.map((section) => {
        const isActive = activeSection === section.key
        const count = counts[section.key]

        // Hide "Mes brouillons" tab if no local drafts
        if (section.key === 'brouillons_locaux' && count === 0) return null

        return (
          <Box
            key={section.key}
            onClick={() => onSectionChange(section.key)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 2,
              py: 1.25,
              cursor: 'pointer',
              userSelect: 'none',
              borderBottom: isActive ? `2px solid ${section.color}` : '2px solid transparent',
              mb: '-2px',
              color: isActive ? section.color : colors.textSecondary,
              transition: `all ${transitions.fast}`,
              '&:hover': {
                bgcolor: section.bgColor,
                color: section.color,
              },
            }}
          >
            {section.icon}
            <Typography
              sx={{
                fontSize: typography.sizes.sm,
                fontWeight: isActive ? typography.weights.semibold : typography.weights.medium,
                whiteSpace: 'nowrap',
              }}
            >
              {section.label}
            </Typography>
            {count > 0 && (
              <Chip
                label={count}
                size="small"
                sx={{
                  height: 18,
                  minWidth: 18,
                  fontSize: typography.sizes['2xs'],
                  fontWeight: typography.weights.bold,
                  bgcolor: isActive ? section.bgActive : colors.neutral[100],
                  color: isActive ? section.color : colors.textSecondary,
                  borderRadius: borders.radius.full,
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            )}
          </Box>
        )
      })}
    </Box>
  )
}

export default ConventionSectionTabs
export { SECTIONS }

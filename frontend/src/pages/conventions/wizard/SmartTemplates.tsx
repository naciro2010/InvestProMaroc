import type { ReactNode } from 'react'
import { Box, Typography, Tooltip } from '@mui/material'
import {
  FileText,
  Building2,
  Landmark,
  Wrench,
  GraduationCap,
  Heart,
  Zap,
} from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'
import type { ConventionWizardFormData } from './types'

interface ConventionTemplate {
  id: string
  label: string
  description: string
  icon: ReactNode
  color: string
  bgColor: string
  defaults: Partial<ConventionWizardFormData>
}

const TEMPLATES: ConventionTemplate[] = [
  {
    id: 'vide',
    label: 'Vide',
    description: 'Partir de zero',
    icon: <FileText size={20} />,
    color: colors.neutral[500],
    bgColor: colors.neutral[50],
    defaults: {},
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    description: 'Routes, ponts, voirie',
    icon: <Building2 size={20} />,
    color: colors.primary[600],
    bgColor: colors.primary[25],
    defaults: {
      type: 'CADRE',
      dureeMois: 36,
      tauxCommission: 2.5,
      baseCalcul: 'DECAISSEMENTS_TTC',
      tauxTva: 20,
      tauxTvaLignes: 20,
      commissionMode: 'GLOBAL',
    },
  },
  {
    id: 'equipement',
    label: 'Equipement',
    description: 'Equipements publics',
    icon: <Wrench size={20} />,
    color: colors.info[600],
    bgColor: colors.info[25],
    defaults: {
      type: 'CADRE',
      dureeMois: 24,
      tauxCommission: 3.0,
      baseCalcul: 'DECAISSEMENTS_HT',
      tauxTva: 20,
      tauxTvaLignes: 20,
      commissionMode: 'PAR_CATEGORIE',
    },
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Batiments scolaires',
    icon: <GraduationCap size={20} />,
    color: colors.success[600],
    bgColor: colors.success[25],
    defaults: {
      type: 'CADRE',
      dureeMois: 24,
      tauxCommission: 2.0,
      baseCalcul: 'DECAISSEMENTS_TTC',
      tauxTva: 20,
      tauxTvaLignes: 20,
      commissionMode: 'GLOBAL',
    },
  },
  {
    id: 'sante',
    label: 'Sante',
    description: 'Hopitaux, centres de sante',
    icon: <Heart size={20} />,
    color: colors.danger[500],
    bgColor: colors.danger[25],
    defaults: {
      type: 'CADRE',
      dureeMois: 36,
      tauxCommission: 2.5,
      baseCalcul: 'DECAISSEMENTS_TTC',
      tauxTva: 20,
      tauxTvaLignes: 20,
      commissionMode: 'GLOBAL',
    },
  },
  {
    id: 'administration',
    label: 'Administration',
    description: 'Batiments administratifs',
    icon: <Landmark size={20} />,
    color: colors.purple[600],
    bgColor: colors.purple[25],
    defaults: {
      type: 'NON_CADRE',
      dureeMois: 12,
      tauxCommission: 1.5,
      baseCalcul: 'DECAISSEMENTS_HT',
      tauxTva: 20,
      tauxTvaLignes: 20,
      commissionMode: 'GLOBAL',
    },
  },
  {
    id: 'urgence',
    label: 'Urgence',
    description: 'Convention rapide',
    icon: <Zap size={20} />,
    color: colors.warning[600],
    bgColor: colors.warning[25],
    defaults: {
      type: 'NON_CADRE',
      dureeMois: 6,
      tauxCommission: 2.0,
      baseCalcul: 'DECAISSEMENTS_TTC',
      tauxTva: 20,
      tauxTvaLignes: 20,
      commissionMode: 'GLOBAL',
    },
  },
]

interface SmartTemplatesProps {
  onSelect: (template: ConventionTemplate) => void
  selectedId?: string
}

const SmartTemplates = ({ onSelect, selectedId }: SmartTemplatesProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: typography.weights.semibold,
          color: colors.textSecondary,
          mb: 1.5,
          fontSize: typography.sizes.xs,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Demarrer avec un modele
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(3, 1fr)',
            sm: 'repeat(4, 1fr)',
            md: 'repeat(7, 1fr)',
          },
          gap: 1.5,
        }}
      >
        {TEMPLATES.map((template) => {
          const isSelected = selectedId === template.id
          return (
            <Tooltip
              key={template.id}
              title={template.description}
              placement="bottom"
              arrow
            >
              <Box
                onClick={() => onSelect(template)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.75,
                  p: 1.5,
                  borderRadius: borders.radius.lg,
                  border: `2px solid ${isSelected ? template.color : 'transparent'}`,
                  bgcolor: isSelected ? template.bgColor : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: template.bgColor,
                    border: `2px solid ${template.color}40`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: borders.radius.md,
                    bgcolor: isSelected ? `${template.color}15` : template.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: template.color,
                  }}
                >
                  {template.icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: typography.sizes.xs,
                    fontWeight: isSelected
                      ? typography.weights.bold
                      : typography.weights.medium,
                    color: isSelected ? template.color : colors.textPrimary,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {template.label}
                </Typography>
              </Box>
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}

export { SmartTemplates, TEMPLATES }
export type { ConventionTemplate }
export default SmartTemplates

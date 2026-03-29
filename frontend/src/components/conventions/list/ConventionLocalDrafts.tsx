import React from 'react'
import { Box, Typography, IconButton, Button } from '@mui/material'
import { FileEdit, Trash2, Clock, ArrowRight } from 'lucide-react'
import { colors, typography, borders, transitions, componentStyles } from '@/lib/designSystem'
import type { AutosaveState } from '@/pages/conventions/wizard'

interface ConventionLocalDraftsProps {
  drafts: AutosaveState[]
  onResume: () => void
  onDelete: () => void
}

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffMin < 1) return "A l'instant"
  if (diffMin < 60) return `Il y a ${diffMin} min`
  if (diffH < 24) return `Il y a ${diffH}h`
  if (diffD < 7) return `Il y a ${diffD}j`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const ConventionLocalDrafts = ({ drafts, onResume, onDelete }: ConventionLocalDraftsProps) => {
  if (drafts.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <FileEdit size={40} style={{ color: colors.neutral[300], margin: '0 auto 12px' }} />
        <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
          Aucun brouillon local en cours
        </Typography>
        <Typography sx={{ color: colors.neutral[400], fontSize: typography.sizes.xs, mt: 0.5 }}>
          Les formulaires non termines apparaitront ici
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {drafts.map((draft, idx) => {
          const formData = draft.formData
          const stepLabels = ['Informations', 'Budget & Commission', 'Partenaires', 'Recapitulatif']
          const currentStepLabel = stepLabels[draft.activeStep] || 'Informations'

          return (
            <Box
              key={idx}
              sx={{
                ...componentStyles.card,
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: `all ${transitions.fast}`,
                borderLeft: `3px solid ${colors.purple[400]}`,
                '&:hover': {
                  borderColor: colors.purple[500],
                  boxShadow: `0 2px 8px ${colors.purple[100]}`,
                },
              }}
              onClick={onResume}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: borders.radius.md,
                  bgcolor: colors.purple[50],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileEdit size={18} style={{ color: colors.purple[600] }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: typography.weights.semibold,
                    fontSize: typography.sizes.base,
                    color: colors.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formData.code || 'Sans code'}
                  {formData.libelle ? ` — ${formData.libelle}` : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.25 }}>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.purple[600], fontWeight: typography.weights.medium }}>
                    Etape: {currentStepLabel}
                  </Typography>
                  {formData.type && (
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                      Type: {formData.type}
                    </Typography>
                  )}
                  {formData.budgetGlobal > 0 && (
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                      Budget: {(formData.budgetGlobal / 1000000).toFixed(1)}M MAD
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
                  <Clock size={12} style={{ color: colors.neutral[400] }} />
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.neutral[400] }}>
                    {formatRelativeTime(draft.savedAt)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete() }}
                  sx={{ color: colors.danger[400], '&:hover': { color: colors.danger[600], bgcolor: colors.danger[50] } }}
                >
                  <Trash2 size={14} />
                </IconButton>
                <Button
                  size="small"
                  endIcon={<ArrowRight size={14} />}
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onResume() }}
                  sx={{
                    fontSize: typography.sizes.xs,
                    color: colors.purple[700],
                    fontWeight: typography.weights.semibold,
                    textTransform: 'none',
                    '&:hover': { bgcolor: colors.purple[50] },
                  }}
                >
                  Reprendre
                </Button>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default ConventionLocalDrafts

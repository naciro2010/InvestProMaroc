import { Box, Typography } from '@mui/material'
import { CalendarMonth } from '@mui/icons-material'
import { StatusBadge } from '@/components/core'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { colors, typography } from '@/lib/designSystem'

interface ConventionHeaderMetadataProps {
  code: string
  numero: string
  libelle: string
  objet?: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  dateSignature?: string
  dateDebut?: string
  dateFin?: string
  canEdit: boolean
  onEditField: (fieldKey: string, value: string) => void
}

const ConventionHeaderMetadata = ({
  code, numero, libelle, objet, typeConvention,
  dateSignature, dateDebut, dateFin,
  canEdit, onEditField,
}: ConventionHeaderMetadataProps) => (
  <Box sx={{ mb: 1.5 }}>
    {/* Title */}
    <Box
      sx={{
        fontSize: typography.sizes.xl, fontWeight: typography.weights.bold,
        color: colors.textPrimary, mb: 0.5, cursor: canEdit ? 'pointer' : 'default',
        borderRadius: '4px', px: 0.5, mx: -0.5,
        '&:hover': canEdit ? { bgcolor: colors.primary[25] } : {},
      }}
      onClick={canEdit ? () => onEditField('libelle', libelle || '') : undefined}
    >
      <RichTextDisplay html={libelle || code} variant="compact" allowExpand={false} />
    </Box>

    {/* Description */}
    {objet && (
      <Box
        sx={{
          mb: 1, cursor: canEdit ? 'pointer' : 'default',
          borderRadius: '4px', px: 0.5, mx: -0.5,
          '&:hover': canEdit ? { bgcolor: colors.primary[25] } : {},
        }}
        onClick={canEdit ? () => onEditField('objet', objet || '') : undefined}
      >
        <RichTextDisplay html={objet} variant="compact" collapseLength={200} />
      </Box>
    )}

    {/* Metadata bar */}
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, py: 0.75, borderTop: `1px solid ${colors.borderSubtle}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Code:</Typography>
        <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{code}</Typography>
      </Box>
      <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>N:</Typography>
        <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{numero}</Typography>
      </Box>
      <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
      <StatusBadge status={typeConvention} size="small" />
      {dateSignature && (
        <>
          <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarMonth sx={{ fontSize: 13, color: colors.textSecondary }} />
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              {new Date(dateSignature).toLocaleDateString('fr-FR')}
              {dateDebut && ` — ${new Date(dateDebut).toLocaleDateString('fr-FR')}`}
              {dateFin && ` → ${new Date(dateFin).toLocaleDateString('fr-FR')}`}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  </Box>
)

export default ConventionHeaderMetadata

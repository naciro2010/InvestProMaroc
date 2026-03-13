import { useNavigate } from 'react-router-dom'
import { Box, Typography, Stack, LinearProgress, Chip } from '@mui/material'
import { Trophy } from 'lucide-react'
import { colors, typography, componentStyles, borders, getStatusConfig } from '@/lib/designSystem'
import { TopMarcheExecDTO } from '@/lib/api'
import { SectionHeader, formatLargeCurrency } from './types'

interface Props {
  marches: TopMarcheExecDTO[]
}

const DashboardTopMarches = ({ marches }: Props) => {
  const navigate = useNavigate()

  return (
    <Box sx={componentStyles.card}>
      <SectionHeader icon={<Trophy size={16} />} title="Top 5 Marches" />
      <Box sx={{ p: 0 }}>
        {marches.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textDisabled }}>
              Aucun marche
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {marches.map((m, idx) => {
              const statusCfg = getStatusConfig(m.statut)
              return (
                <Box
                  key={m.id}
                  onClick={() => navigate(`/marches/${m.id}`)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    px: 2.5, py: 1.5, cursor: 'pointer',
                    borderBottom: `1px solid ${colors.divider}`,
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: colors.neutral[25] },
                  }}
                >
                  <Box sx={{
                    width: 24, height: 24, borderRadius: borders.radius.md,
                    bgcolor: idx < 3 ? colors.primary[50] : colors.neutral[50],
                    color: idx < 3 ? colors.primary[600] : colors.textDisabled,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: typography.sizes.xs, fontWeight: typography.weights.bold,
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Typography sx={{
                        fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
                        color: colors.textPrimary, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {m.code}
                      </Typography>
                      <Chip label={statusCfg.label} size="small" sx={{
                        height: 18, fontSize: 9, fontWeight: typography.weights.semibold,
                        bgcolor: statusCfg.bgColor, color: statusCfg.textColor,
                        '& .MuiChip-label': { px: 0.75 },
                      }} />
                    </Stack>
                    {m.fournisseur && (
                      <Typography sx={{
                        fontSize: typography.sizes.xs, color: colors.textSecondary,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {m.fournisseur}
                      </Typography>
                    )}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(m.tauxAvancement, 100)}
                        sx={{
                          flex: 1, height: 4, borderRadius: borders.radius.full,
                          bgcolor: colors.neutral[100],
                          '& .MuiLinearProgress-bar': {
                            borderRadius: borders.radius.full,
                            bgcolor: m.tauxAvancement >= 80 ? colors.success[400] : colors.primary[400],
                          },
                        }}
                      />
                      <Typography sx={{
                        fontSize: 9, color: colors.textDisabled,
                        fontWeight: typography.weights.semibold, minWidth: 28, textAlign: 'right',
                      }}>
                        {m.tauxAvancement.toFixed(0)}%
                      </Typography>
                    </Stack>
                  </Box>
                  <Typography sx={{
                    fontSize: typography.sizes.sm, fontWeight: typography.weights.bold,
                    color: colors.textPrimary, flexShrink: 0, textAlign: 'right',
                  }}>
                    {formatLargeCurrency(m.montantTtc)}
                  </Typography>
                </Box>
              )
            })}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default DashboardTopMarches

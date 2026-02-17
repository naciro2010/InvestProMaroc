import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Tooltip,
} from '@mui/material'
import {
  AccountBalance,
  People,
  ArrowUpward,
  OpenInNew,
  TrendingUp,
  Percent,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { conventionsAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface ParentConventionData {
  id: number
  code: string
  numero: string
  libelle: string
  typeConvention: string
  statut: string
  budget: number
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
}

interface ParentPartenaireData {
  id: number
  partenaireId: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  commissionIntervention: number | null
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
}

interface ParentConventionBannerProps {
  parentConventionId: number
  parentConventionNumero: string
  heriteParametres: boolean
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)

const formatCurrencyShort = (amount: number): string => {
  const millions = amount / 1_000_000
  if (millions >= 1) {
    return `${millions.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M DH`
  }
  return formatCurrency(amount)
}

/**
 * MICRO-COMPONENT: ParentConventionBanner
 * Displays parent convention budget data, financial parameters, and partenaires
 * with clear visual indicator that data comes from the convention principale.
 *
 * Used on sous-convention detail pages.
 * Endpoints: GET /conventions/{parentId}, GET /conventions/{parentId}/partenaires
 */
const ParentConventionBanner = ({
  parentConventionId,
  parentConventionNumero,
  heriteParametres,
}: ParentConventionBannerProps) => {
  const navigate = useNavigate()
  const [parentData, setParentData] = useState<ParentConventionData | null>(null)
  const [partenaires, setPartenaires] = useState<ParentPartenaireData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPartenaires, setLoadingPartenaires] = useState(true)

  useEffect(() => {
    loadParentData()
    loadParentPartenaires()
  }, [parentConventionId])

  const loadParentData = async () => {
    try {
      setLoading(true)
      const [basicRes, financesRes] = await Promise.all([
        conventionsAPI.getBasic(parentConventionId),
        conventionsAPI.getFinances(parentConventionId),
      ])
      const basic = basicRes.data.data || basicRes.data
      const finances = financesRes.data.data || financesRes.data
      setParentData({
        id: basic.id,
        code: basic.code,
        numero: basic.numero,
        libelle: basic.libelle,
        typeConvention: basic.typeConvention,
        statut: basic.statut,
        budget: finances.budget,
        tauxCommission: finances.tauxCommission,
        baseCalcul: finances.baseCalcul,
        tauxTva: finances.tauxTva,
      })
    } catch {
      setParentData(null)
    } finally {
      setLoading(false)
    }
  }

  const loadParentPartenaires = async () => {
    try {
      setLoadingPartenaires(true)
      const response = await conventionsAPI.getPartenaires(parentConventionId)
      const data = response.data.data || response.data || []
      setPartenaires(Array.isArray(data) ? data : [])
    } catch {
      setPartenaires([])
    } finally {
      setLoadingPartenaires(false)
    }
  }

  if (loading) {
    return (
      <Paper sx={{
        ...componentStyles.card,
        p: 2,
        border: `1px solid ${colors.primary[200]}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={20} />
          <Typography sx={{
            fontSize: typography.sizes.sm,
            color: colors.primary[600],
            fontWeight: typography.weights.medium,
          }}>
            Chargement de la convention principale ({parentConventionNumero})...
          </Typography>
        </Box>
      </Paper>
    )
  }

  if (!parentData) return null

  const totalBudgetPartenaires = partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0)

  return (
    <Paper sx={{
      ...componentStyles.card,
      p: 0,
      overflow: 'hidden',
      border: `1px solid ${colors.primary[200]}`,
      position: 'relative',
    }}>
      {/* Top accent bar */}
      <Box sx={{
        height: 3,
        bgcolor: colors.primary[500],
      }} />

      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.5,
        bgcolor: colors.primary[25],
        borderBottom: `1px solid ${colors.primary[100]}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            bgcolor: colors.primary[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ArrowUpward sx={{ color: colors.primary[600], fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.semibold,
              color: colors.primary[600],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Convention Principale
            </Typography>
            <Typography sx={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              color: colors.textPrimary,
            }}>
              {parentData.numero} - {parentData.libelle}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Voir la convention principale">
          <Chip
            label="Voir"
            size="small"
            icon={<OpenInNew sx={{ fontSize: 14 }} />}
            onClick={() => navigate(`/conventions/${parentConventionId}`)}
            sx={{
              bgcolor: colors.primary[50],
              color: colors.primary[700],
              fontWeight: typography.weights.medium,
              fontSize: typography.sizes.xs,
              cursor: 'pointer',
              border: `1px solid ${colors.primary[200]}`,
              '&:hover': { bgcolor: colors.primary[100] },
            }}
          />
        </Tooltip>
      </Box>

      {/* Budget & Financial Data */}
      <Box sx={{ px: 3, py: 2 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 2,
        }}>
          {/* Budget Total */}
          <Box sx={{
            p: 1.5,
            bgcolor: colors.success[25],
            borderRadius: '8px',
            border: `1px solid ${colors.success[100]}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <AccountBalance sx={{ fontSize: 14, color: colors.success[600] }} />
              <Typography sx={{
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
              }}>
                Budget Total
              </Typography>
            </Box>
            <Typography sx={{
              fontSize: typography.sizes.md,
              fontWeight: typography.weights.bold,
              color: colors.success[700],
            }}>
              {formatCurrencyShort(parentData.budget)}
            </Typography>
            <SourceLabel />
          </Box>

          {/* Taux Commission */}
          <Box sx={{
            p: 1.5,
            bgcolor: heriteParametres ? colors.info[25] : colors.neutral[25],
            borderRadius: '8px',
            border: `1px solid ${heriteParametres ? colors.info[100] : colors.neutral[200]}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <TrendingUp sx={{ fontSize: 14, color: heriteParametres ? colors.info[600] : colors.neutral[500] }} />
              <Typography sx={{
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
              }}>
                Taux Commission
              </Typography>
            </Box>
            <Typography sx={{
              fontSize: typography.sizes.md,
              fontWeight: typography.weights.bold,
              color: heriteParametres ? colors.info[700] : colors.textPrimary,
            }}>
              {parentData.tauxCommission}%
            </Typography>
            {heriteParametres && <SourceLabel label="Herite" />}
          </Box>

          {/* Base Calcul */}
          <Box sx={{
            p: 1.5,
            bgcolor: heriteParametres ? colors.info[25] : colors.neutral[25],
            borderRadius: '8px',
            border: `1px solid ${heriteParametres ? colors.info[100] : colors.neutral[200]}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <AccountBalance sx={{ fontSize: 14, color: heriteParametres ? colors.info[600] : colors.neutral[500] }} />
              <Typography sx={{
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
              }}>
                Base de Calcul
              </Typography>
            </Box>
            <Typography sx={{
              fontSize: typography.sizes.md,
              fontWeight: typography.weights.bold,
              color: heriteParametres ? colors.info[700] : colors.textPrimary,
            }}>
              {parentData.baseCalcul === 'DECAISSEMENTS_TTC' ? 'Decaissements TTC' : 'Decaissements HT'}
            </Typography>
            {heriteParametres && <SourceLabel label="Herite" />}
          </Box>

          {/* Taux TVA */}
          <Box sx={{
            p: 1.5,
            bgcolor: heriteParametres ? colors.info[25] : colors.neutral[25],
            borderRadius: '8px',
            border: `1px solid ${heriteParametres ? colors.info[100] : colors.neutral[200]}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Percent sx={{ fontSize: 14, color: heriteParametres ? colors.info[600] : colors.neutral[500] }} />
              <Typography sx={{
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
                fontWeight: typography.weights.medium,
              }}>
                Taux TVA
              </Typography>
            </Box>
            <Typography sx={{
              fontSize: typography.sizes.md,
              fontWeight: typography.weights.bold,
              color: heriteParametres ? colors.info[700] : colors.textPrimary,
            }}>
              {parentData.tauxTva}%
            </Typography>
            {heriteParametres && <SourceLabel label="Herite" />}
          </Box>
        </Box>
      </Box>

      {/* Partenaires Section */}
      {(loadingPartenaires || partenaires.length > 0) && (
        <>
          <Divider sx={{ borderColor: colors.primary[100] }} />
          <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <People sx={{ fontSize: 18, color: colors.primary[600] }} />
              <Typography sx={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
                color: colors.textPrimary,
              }}>
                Partenaires de la convention principale
              </Typography>
              {partenaires.length > 0 && (
                <Chip
                  label={partenaires.length}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: typography.sizes.xs,
                    bgcolor: colors.primary[100],
                    color: colors.primary[700],
                    fontWeight: typography.weights.semibold,
                  }}
                />
              )}
            </Box>

            {loadingPartenaires ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {partenaires.map((p) => (
                  <Box
                    key={p.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      bgcolor: colors.neutral[25],
                      borderRadius: '6px',
                      border: `1px solid ${colors.neutral[200]}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        bgcolor: colors.primary[50],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Typography sx={{
                          fontSize: typography.sizes.xs,
                          fontWeight: typography.weights.bold,
                          color: colors.primary[700],
                        }}>
                          {(p.partenaireSigle || p.partenaireCode).substring(0, 2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{
                          fontSize: typography.sizes.sm,
                          fontWeight: typography.weights.medium,
                          color: colors.textPrimary,
                        }}>
                          {p.partenaireSigle || p.partenaireCode}
                        </Typography>
                        <Typography sx={{
                          fontSize: typography.sizes.xs,
                          color: colors.textSecondary,
                        }}>
                          {p.partenaireNom}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                        {p.estMaitreOeuvre && (
                          <Chip label="MO" size="small" sx={{
                            height: 18, fontSize: '10px',
                            bgcolor: colors.info[100], color: colors.info[700],
                          }} />
                        )}
                        {p.estMaitreOeuvreDelegue && (
                          <Chip label="MOD" size="small" sx={{
                            height: 18, fontSize: '10px',
                            bgcolor: colors.purple[100], color: colors.purple[700],
                          }} />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, textAlign: 'right' }}>
                      <Box>
                        <Typography sx={{
                          fontSize: typography.sizes.sm,
                          fontWeight: typography.weights.semibold,
                          color: colors.primary[700],
                        }}>
                          {formatCurrencyShort(p.budgetAlloue)}
                        </Typography>
                        <Typography sx={{
                          fontSize: typography.sizes.xs,
                          color: colors.textSecondary,
                        }}>
                          {p.pourcentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <SourceLabel />
                    </Box>
                  </Box>
                ))}
                {/* Total row */}
                {partenaires.length > 1 && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.5,
                    py: 1,
                    bgcolor: colors.primary[25],
                    borderRadius: '6px',
                    border: `1px solid ${colors.primary[100]}`,
                  }}>
                    <Typography sx={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.bold,
                      color: colors.textPrimary,
                    }}>
                      Total partenaires
                    </Typography>
                    <Typography sx={{
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.bold,
                      color: colors.primary[700],
                    }}>
                      {formatCurrencyShort(totalBudgetPartenaires)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </>
      )}
    </Paper>
  )
}

/** Small label indicating data source from parent convention */
function SourceLabel({ label = 'Conv. principale' }: { label?: string }) {
  return (
    <Typography sx={{
      fontSize: '10px',
      color: colors.primary[500],
      fontWeight: typography.weights.medium,
      fontStyle: 'italic',
      mt: 0.25,
      display: 'flex',
      alignItems: 'center',
      gap: 0.25,
    }}>
      <ArrowUpward sx={{ fontSize: 10 }} />
      {label}
    </Typography>
  )
}

export default ParentConventionBanner

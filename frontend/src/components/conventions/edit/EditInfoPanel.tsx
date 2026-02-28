import { Box, Typography, Divider, Tooltip, LinearProgress } from '@mui/material'
import {
  Calendar, Clock, User, Lock, AlertTriangle,
  CheckCircle, FolderTree, Building2, Briefcase, Link2,
} from 'lucide-react'
import { StatusBadge } from '@/components/core'
import { colors, typography, borders } from '@/lib/designSystem'
import { formatDateFR, formatCurrencyMAD, type ConventionMetadata } from './editTypes'

interface EditInfoPanelProps {
  metadata: ConventionMetadata
  budget: number
  tauxCommission: number
  tauxTva: number
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.75 }}>
    <Box sx={{ color: colors.textSecondary, mt: 0.25, flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{
        fontSize: typography.sizes.xs, color: colors.textSecondary,
        fontWeight: typography.weights.medium, textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes.sm, color: colors.textPrimary,
        fontWeight: typography.weights.medium, mt: 0.25, wordBreak: 'break-word',
      }}>
        {value}
      </Typography>
    </Box>
  </Box>
)

const SectionTitle = ({ children }: { children: string }) => (
  <Typography sx={{
    fontSize: typography.sizes.xs, color: colors.textSecondary,
    fontWeight: typography.weights.semibold, textTransform: 'uppercase',
    letterSpacing: '0.04em', mb: 0.5, mt: 0.5,
  }}>
    {children}
  </Typography>
)

const PanelCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{
    bgcolor: colors.surface, border: `1px solid ${colors.border}`,
    borderRadius: borders.radius.lg, overflow: 'hidden',
  }}>
    <Box sx={{
      px: 2, py: 1.5, bgcolor: colors.neutral[50],
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <Typography sx={{
        fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
        color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ p: 2 }}>{children}</Box>
  </Box>
)

const EditInfoPanel = ({ metadata, budget, tauxCommission, tauxTva }: EditInfoPanelProps) => {
  const commissionHT = (budget * tauxCommission) / 100
  const commissionTTC = commissionHT * (1 + tauxTva / 100)
  const isRejected = metadata.statut === 'REJETE'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Card 1: Status & Workflow */}
      <PanelCard title="Statut & Workflow">
        <Box sx={{ mb: 1.5 }}>
          <StatusBadge status={metadata.statut} />
        </Box>

        {isRejected && metadata.motifRejet && (
          <Box sx={{
            mb: 1.5, p: 1.5, bgcolor: colors.danger[25],
            border: `1px solid ${colors.danger[200]}`, borderRadius: borders.radius.md,
            borderLeft: `3px solid ${colors.danger[500]}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <AlertTriangle size={13} style={{ color: colors.danger[600] }} />
              <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.danger[700] }}>
                Motif du rejet
              </Typography>
            </Box>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.danger[700], fontStyle: 'italic' }}>
              &ldquo;{metadata.motifRejet}&rdquo;
            </Typography>
          </Box>
        )}

        {metadata.isLocked && (
          <Box sx={{
            mb: 1.5, p: 1, bgcolor: colors.warning[50],
            border: `1px solid ${colors.warning[200]}`, borderRadius: borders.radius.md,
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <Lock size={13} style={{ color: colors.warning[600] }} />
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.warning[700] }}>
              {metadata.motifVerrouillage || 'Convention verrouillee'}
            </Typography>
          </Box>
        )}

        <Divider sx={{ borderColor: colors.divider, my: 1 }} />

        <SectionTitle>Tracabilite</SectionTitle>
        <InfoRow icon={<User size={14} />} label="Cree par" value={metadata.createdBy || '-'} />
        <InfoRow icon={<Calendar size={14} />} label="Date de creation" value={formatDateFR(metadata.createdAt)} />
        <InfoRow icon={<Clock size={14} />} label="Derniere modification" value={formatDateFR(metadata.updatedAt)} />

        {metadata.dateSoumission && (
          <InfoRow icon={<CheckCircle size={14} />} label="Soumise le" value={formatDateFR(metadata.dateSoumission)} />
        )}

        {metadata.dateValidation && (
          <InfoRow
            icon={<CheckCircle size={14} />}
            label="Validee le"
            value={
              <Box>
                {formatDateFR(metadata.dateValidation)}
                {metadata.valideParNom && (
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.success[600] }}>
                    par {metadata.valideParNom}
                  </Typography>
                )}
              </Box>
            }
          />
        )}

        {metadata.parentConventionCode && (
          <>
            <Divider sx={{ borderColor: colors.divider, my: 1 }} />
            <InfoRow
              icon={<Link2 size={14} />}
              label="Convention parente"
              value={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FolderTree size={12} style={{ color: colors.purple[500] }} />
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.purple[600], fontWeight: typography.weights.semibold }}>
                    {metadata.parentConventionCode}
                  </Typography>
                </Box>
              }
            />
            {metadata.heriteParametres && (
              <Tooltip title="Les parametres financiers (taux commission, base de calcul, TVA) sont herites de la convention parente">
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  p: 0.75, mt: 0.5, bgcolor: colors.purple[50],
                  borderRadius: borders.radius.md, cursor: 'help',
                }}>
                  <Link2 size={12} style={{ color: colors.purple[500] }} />
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.purple[700] }}>
                    Parametres herites du parent
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </>
        )}
      </PanelCard>

      {/* Card 2: Financial Summary */}
      <PanelCard title="Resume Financier">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Budget</Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
              {formatCurrencyMAD(budget)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Taux</Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary }}>
              {tauxCommission}%
            </Typography>
          </Box>
          <Divider sx={{ borderColor: colors.divider, my: 0.25 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Commission HT</Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.info[600] }}>
              {formatCurrencyMAD(commissionHT)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Commission TTC</Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.success[600] }}>
              {formatCurrencyMAD(commissionTTC)}
            </Typography>
          </Box>
        </Box>

        {budget > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                Ratio commission/budget
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.primary[600] }}>
                {tauxCommission}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(tauxCommission, 100)}
              sx={{
                height: 4, borderRadius: 2, bgcolor: colors.neutral[100],
                '& .MuiLinearProgress-bar': { bgcolor: colors.primary[500], borderRadius: 2 },
              }}
            />
          </Box>
        )}
      </PanelCard>

      {/* Card 3: Related entities */}
      {(metadata.sousConventionsCount > 0 || metadata.nombreProjets > 0 || metadata.nombreMarches > 0) && (
        <PanelCard title="Entites liees">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {metadata.sousConventionsCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FolderTree size={14} style={{ color: colors.purple[500] }} />
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                  <Typography component="span" sx={{ fontWeight: typography.weights.bold, color: colors.purple[600] }}>
                    {metadata.sousConventionsCount}
                  </Typography>
                  {' '}sous-convention{metadata.sousConventionsCount > 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
            {metadata.nombreProjets > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Briefcase size={14} style={{ color: colors.info[500] }} />
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                  <Typography component="span" sx={{ fontWeight: typography.weights.bold, color: colors.info[600] }}>
                    {metadata.nombreProjets}
                  </Typography>
                  {' '}projet{metadata.nombreProjets > 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
            {metadata.nombreMarches > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Building2 size={14} style={{ color: colors.success[500] }} />
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                  <Typography component="span" sx={{ fontWeight: typography.weights.bold, color: colors.success[600] }}>
                    {metadata.nombreMarches}
                  </Typography>
                  {' '}marche{metadata.nombreMarches > 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Box>
        </PanelCard>
      )}
    </Box>
  )
}

export default EditInfoPanel

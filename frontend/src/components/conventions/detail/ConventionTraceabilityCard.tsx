import { Box, Typography, Alert } from '@mui/material'
import { Lock as LockIcon, CallMade as LinkIcon } from '@mui/icons-material'
import { colors, typography, borders, spacing } from '@/lib/designSystem'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConventionTraceabilityCardProps {
  createdByNom?: string
  createdAt?: string
  valideParNom?: string
  dateValidation?: string
  dateSoumission?: string
  updatedAt?: string
  version?: string
  isLocked?: boolean
  motifRejet?: string
  tauxCommission: number
  tauxCommissionEffectif?: number
  baseCalcul: string
  baseCalculEffective?: string
  tauxTva: number
  tauxTvaLignes?: number
  heriteParametres?: boolean
  parentConventionNumero?: string
  parentConventionId?: number
  dureeJours?: number
  estActive?: boolean
  dateDebut?: string
  dateFin?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDatetime(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? '-'
    : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtPct(v: number): string {
  return `${v.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`
}

const BASE_LABELS: Record<string, string> = {
  HT: 'HT (Hors Taxes)',
  TTC: 'TTC (Toutes Taxes)',
  DECAISSEMENTS: 'HT (Décaissements)',
  ENGAGEMENTS: 'HT (Engagements)',
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const sectionSx = {
  fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
  color: colors.textSecondary, textTransform: 'uppercase' as const,
  letterSpacing: '0.06em', mb: spacing.mui.sm,
} as const

const lbl = {
  fontSize: typography.sizes.sm, color: colors.textSecondary,
  lineHeight: typography.lineHeights.normal, whiteSpace: 'nowrap' as const,
} as const

const val = {
  fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
  color: colors.textPrimary, lineHeight: typography.lineHeights.normal,
} as const

const dividerSx = {
  borderBottom: `${borders.width.thin} solid ${colors.divider}`,
  mb: spacing.mui.md, pb: spacing.mui.xs,
} as const

// ---------------------------------------------------------------------------
// Micro sub-components
// ---------------------------------------------------------------------------

function Row({ label, children, label2, children2 }: {
  label: string; children: React.ReactNode; label2?: string; children2?: React.ReactNode
}) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: label2 ? '140px 1fr 120px 1fr' : '140px 1fr', alignItems: 'baseline', py: spacing.mui.xs, gap: spacing.mui.sm }}>
      <Typography sx={lbl}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing.mui.xs, flexWrap: 'wrap' }}>{children}</Box>
      {label2 && (
        <>
          <Typography sx={lbl}>{label2}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing.mui.xs, flexWrap: 'wrap' }}>{children2}</Box>
        </>
      )}
    </Box>
  )
}

function Tag({ label, color: c, bg }: { label: string; color: string; bg: string }) {
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', px: spacing.mui.sm, py: spacing.mui['2xs'],
      borderRadius: borders.radius.sm, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
      color: c, bgcolor: bg, lineHeight: typography.lineHeights.tight,
    }}>
      {label}
    </Box>
  )
}

function Dot({ active, label }: { active: boolean; label: string }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: spacing.mui.xs }}>
      <Box sx={{ width: 8, height: 8, borderRadius: borders.radius.full, bgcolor: active ? colors.success[500] : colors.neutral[400], flexShrink: 0 }} />
      <Typography sx={val}>{label}</Typography>
    </Box>
  )
}

function Struck({ text }: { text: string }) {
  return <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textDisabled, textDecoration: 'line-through' }}>{text}</Typography>
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ConventionTraceabilityCard(props: ConventionTraceabilityCardProps) {
  const {
    createdByNom, createdAt, valideParNom, dateValidation, dateSoumission, updatedAt,
    version, isLocked = false, motifRejet,
    tauxCommission, tauxCommissionEffectif, baseCalcul, baseCalculEffective, tauxTva, tauxTvaLignes,
    heriteParametres = false, parentConventionNumero, parentConventionId,
    dureeJours, estActive, dateDebut, dateFin,
  } = props

  const isInherited = heriteParametres && parentConventionNumero != null
  const commOverridden = isInherited && tauxCommissionEffectif != null && tauxCommissionEffectif !== tauxCommission
  const baseOverridden = isInherited && baseCalculEffective != null && baseCalculEffective !== baseCalcul

  const computedDuration = dureeJours != null
    ? dureeJours
    : dateDebut && dateFin
      ? Math.ceil((new Date(dateFin).getTime() - new Date(dateDebut).getTime()) / 86_400_000)
      : null

  return (
    <Box sx={{ border: `${borders.width.thin} solid ${colors.border}`, borderRadius: borders.radius.lg, bgcolor: colors.surface, overflow: 'hidden' }}>
      {motifRejet && (
        <Alert severity="error" sx={{ borderRadius: 0, fontSize: typography.sizes.sm, py: spacing.mui.xs, '& .MuiAlert-message': { fontSize: typography.sizes.sm } }}>
          Rejet : {motifRejet}
        </Alert>
      )}

      <Box sx={{ p: spacing.mui.lg }}>
        {/* -- Section 1: Informations de suivi -- */}
        <Typography sx={sectionSx}>Informations de suivi</Typography>
        <Box sx={dividerSx} />

        {createdByNom && createdAt && (
          <Row label="Créé par">
            <Typography sx={val}>{createdByNom}</Typography>
            <Typography sx={{ ...lbl, fontSize: typography.sizes.xs }}>le {fmtDate(createdAt)}</Typography>
          </Row>
        )}
        {dateSoumission && (
          <Row label="Soumis le"><Typography sx={val}>{fmtDate(dateSoumission)}</Typography></Row>
        )}
        {valideParNom && dateValidation && (
          <Row label="Validé par">
            <Typography sx={val}>{valideParNom}</Typography>
            <Typography sx={{ ...lbl, fontSize: typography.sizes.xs }}>le {fmtDate(dateValidation)}</Typography>
          </Row>
        )}
        {updatedAt && (
          <Row label="Dernière modif."><Typography sx={val}>{fmtDatetime(updatedAt)}</Typography></Row>
        )}

        <Row label="Version" label2="Verrouillé">
          <Typography sx={val}>{version ?? 'V0'}</Typography>
          <>
            {isLocked ? (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: spacing.mui.xs }}>
                <LockIcon sx={{ fontSize: 14, color: colors.warning[600] }} />
                <Typography sx={{ ...val, color: colors.warning[600] }}>Oui</Typography>
              </Box>
            ) : (
              <Typography sx={val}>Non</Typography>
            )}
          </>
        </Row>

        {/* -- Section 2: Paramètres financiers -- */}
        <Typography sx={{ ...sectionSx, mt: spacing.mui.lg }}>Paramètres financiers</Typography>
        <Box sx={dividerSx} />

        <Row label="Taux commission" label2="Base calcul">
          <Typography sx={val}>{fmtPct(tauxCommissionEffectif ?? tauxCommission)}</Typography>
          {commOverridden && <Struck text={`(parent: ${fmtPct(tauxCommission)})`} />}
          <>
            <Typography sx={val}>{BASE_LABELS[baseCalculEffective ?? baseCalcul] ?? (baseCalculEffective ?? baseCalcul)}</Typography>
            {baseOverridden && <Struck text={`(parent: ${BASE_LABELS[baseCalcul] ?? baseCalcul})`} />}
          </>
        </Row>

        <Row label="TVA" label2="TVA lignes">
          <Typography sx={val}>{fmtPct(tauxTva)}</Typography>
          <Typography sx={val}>{fmtPct(tauxTvaLignes ?? tauxTva)}</Typography>
        </Row>

        <Box sx={{ mt: spacing.mui.sm, display: 'flex', alignItems: 'center', gap: spacing.mui.xs }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Source :</Typography>
          {isInherited ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: spacing.mui.xs }}>
              <Tag label={`Hérité de ${parentConventionNumero}`} color={colors.purple[700]} bg={colors.purple[50]} />
              {parentConventionId != null && <LinkIcon sx={{ fontSize: 14, color: colors.purple[500] }} />}
            </Box>
          ) : (
            <Tag label="Convention directe" color={colors.neutral[600]} bg={colors.neutral[100]} />
          )}
        </Box>

        {/* -- Section 3: Durée -- */}
        {(computedDuration != null || dateDebut || dateFin || estActive != null) && (
          <>
            <Box sx={{ borderBottom: `${borders.width.thin} solid ${colors.divider}`, mt: spacing.mui.lg, mb: spacing.mui.md }} />
            <Row label="Durée" label2="Statut">
              <Typography sx={val}>{computedDuration != null ? `${computedDuration.toLocaleString('fr-FR')} jours` : '-'}</Typography>
              <>{estActive != null ? <Dot active={estActive} label={estActive ? 'Active' : 'Inactive'} /> : <Typography sx={val}>-</Typography>}</>
            </Row>
            {(dateDebut || dateFin) && (
              <Row label="Période">
                <Typography sx={val}>{dateDebut ? fmtDate(dateDebut) : '-'} – {dateFin ? fmtDate(dateFin) : 'en cours'}</Typography>
              </Row>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}

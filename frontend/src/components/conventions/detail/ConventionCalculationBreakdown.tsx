import { useState, useMemo } from 'react'
import { Box, Paper, Typography, Collapse, Button } from '@mui/material'
import { ChevronDown, ChevronUp, Calculator, Info } from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'

// --------------- Types ---------------

interface ConventionCalculationBreakdownProps {
  budget: number
  tauxCommission: number
  tauxCommissionEffectif?: number
  tauxTva: number
  baseCalcul: string
  montantTotalMarches: number
  tauxRealisation: number
  heriteParametres?: boolean
  parentConventionNumero?: string
}

interface StepProps {
  step: number
  label: string
  value: string
  source: string
  isRate?: boolean
}

interface TotalProps {
  label: string
  value: string
  formula?: string
  valueColor?: string
  isGrand?: boolean
}

interface MetricProps {
  label: string
  value: string
  valueColor?: string
}

// --------------- Formatters ---------------

const fmtMAD = (n: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)

const fmtPct = (n: number): string =>
  `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}%`

const fmtNum = (n: number): string =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)

const BASE_LABELS: Record<string, string> = {
  DECAISSEMENTS_HT: 'Decaissements HT',
  DECAISSEMENTS_TTC: 'Decaissements TTC',
  MONTANT_HT: 'Montant HT',
  MONTANT_TTC: 'Montant TTC',
  MONTANT_MARCHE: 'Montant Marche',
}

// --------------- Sub-components ---------------

const Step = ({ step, label, value, source, isRate }: StepProps) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Typography sx={{ fontSize: typography.sizes.base, color: colors.textPrimary }}>
        <Box component="span" sx={{ color: colors.textSecondary, mr: 1 }}>{step}.</Box>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes.base, fontWeight: typography.weights.semibold,
        color: colors.textPrimary, fontFamily: isRate ? typography.fontFamilyMono : 'inherit',
        whiteSpace: 'nowrap', ml: 2,
      }}>
        {isRate ? `\u00D7 ${value}` : value}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, ml: 2.5 }}>
      <Info size={12} color={colors.textDisabled} style={{ flexShrink: 0 }} />
      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textDisabled, ml: 0.5, fontStyle: 'italic' }}>
        Source : {source}
      </Typography>
    </Box>
  </Box>
)

const Divider = () => <Box sx={{ borderBottom: `1px dashed ${colors.border}`, my: 2 }} />

const Total = ({ label, value, formula, valueColor, isGrand }: TotalProps) => (
  <Box sx={{ mb: formula ? 1.5 : 2, ...(isGrand && { borderTop: `2px solid ${colors.neutral[300]}`, pt: 1.5, mt: 1 }) }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Typography sx={{
        fontSize: isGrand ? typography.sizes.md : typography.sizes.base,
        fontWeight: typography.weights.bold, color: colors.textPrimary,
      }}>
        = {label}
      </Typography>
      <Typography sx={{
        fontSize: isGrand ? typography.sizes.md : typography.sizes.base,
        fontWeight: typography.weights.bold, color: valueColor ?? colors.textPrimary,
        whiteSpace: 'nowrap', ml: 2,
      }}>
        {value}
      </Typography>
    </Box>
    {formula && (
      <Typography sx={{
        fontSize: typography.sizes.xs, color: colors.textSecondary,
        fontFamily: typography.fontFamilyMono, ml: 2, mt: 0.25,
      }}>
        Formule : {formula}
      </Typography>
    )}
  </Box>
)

const Metric = ({ label, value, valueColor }: MetricProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.5 }}>
    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>{label}</Typography>
    <Typography sx={{
      fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
      color: valueColor ?? colors.textPrimary, whiteSpace: 'nowrap', ml: 2, fontVariantNumeric: 'tabular-nums',
    }}>
      {value}
    </Typography>
  </Box>
)

// --------------- Main Component ---------------

const ConventionCalculationBreakdown = ({
  budget, tauxCommission, tauxCommissionEffectif, tauxTva,
  baseCalcul, montantTotalMarches, tauxRealisation,
  heriteParametres, parentConventionNumero,
}: ConventionCalculationBreakdownProps) => {
  const [expanded, setExpanded] = useState(false)

  const calc = useMemo(() => {
    const rate = tauxCommissionEffectif ?? tauxCommission
    const commHT = budget * (rate / 100)
    const tva = commHT * (tauxTva / 100)
    const commTTC = commHT + tva
    const commEng = montantTotalMarches * (rate / 100)
    const reste = budget - montantTotalMarches
    return { rate, commHT, tva, commTTC, commEng, reste }
  }, [budget, tauxCommission, tauxCommissionEffectif, tauxTva, montantTotalMarches])

  const tauxSource = heriteParametres && parentConventionNumero
    ? `Herite de ${parentConventionNumero}`
    : 'Convention directe'

  return (
    <Paper sx={{ border: `1px solid ${colors.border}`, borderRadius: borders.radius.lg, overflow: 'hidden', bgcolor: colors.surface }}>
      {/* Toggle header */}
      <Box
        onClick={() => setExpanded((p: boolean) => !p)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, py: 1.5, cursor: 'pointer', userSelect: 'none',
          '&:hover': { bgcolor: colors.neutral[25] }, transition: 'background-color 150ms ease-out',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calculator size={18} color={colors.primary[600]} />
          <Typography sx={{ fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
            {expanded ? 'Masquer le detail du calcul' : 'Voir le detail du calcul'}
          </Typography>
        </Box>
        <Button
          size="small" variant="text"
          endIcon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          sx={{ color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'none', pointerEvents: 'none' }}
        >
          {expanded ? 'Masquer' : 'Detail'}
        </Button>
      </Box>

      {/* Collapsible body */}
      <Collapse in={expanded}>
        <Box sx={{ px: 3, pb: 3, pt: 0, borderTop: `1px solid ${colors.borderSubtle}` }}>

          {/* Section 1: Commission HT */}
          <Box sx={{ mt: 2 }}>
            <Step step={1} label={`Budget Convention (${BASE_LABELS[baseCalcul] ?? baseCalcul})`}
              value={fmtMAD(budget)} source="Parametres de la convention" />
            <Step step={2} label="Taux de commission"
              value={fmtPct(calc.rate)} source={tauxSource} isRate />
          </Box>

          <Divider />

          <Total label="Commission HT" value={fmtMAD(calc.commHT)}
            formula={`${fmtNum(budget)} \u00D7 ${fmtPct(calc.rate)}`} />

          {/* Section 2: TVA */}
          <Step step={3} label="TVA sur commission"
            value={fmtPct(tauxTva)} source="Taux standard services" isRate />
          <Box sx={{ ml: 2.5, mb: 1 }}>
            <Metric label="= Montant TVA" value={fmtMAD(calc.tva)} />
          </Box>

          <Divider />

          <Total label="Commission TTC" value={fmtMAD(calc.commTTC)}
            formula={`${fmtNum(calc.commHT)} + ${fmtNum(calc.tva)}`}
            valueColor={colors.success[600]} />

          {/* Section 3: Engagements */}
          <Box sx={{ bgcolor: colors.neutral[50], borderRadius: borders.radius.md, p: 2, mt: 2 }}>
            <Typography sx={{
              fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
              color: colors.textSecondary, textTransform: 'uppercase',
              letterSpacing: typography.letterSpacing.wide, mb: 1.5,
            }}>
              Engagements actuels
            </Typography>

            <Metric label="Total marches" value={fmtMAD(montantTotalMarches)} />
            <Metric label="Commission sur engagements" value={fmtMAD(calc.commEng)} />
            <Metric label="Taux de realisation" value={fmtPct(tauxRealisation)}
              valueColor={tauxRealisation >= 80 ? colors.success[600] : tauxRealisation >= 50 ? colors.warning[600] : colors.danger[600]} />

            <Box sx={{ borderTop: `2px solid ${colors.neutral[300]}`, mt: 1.5, pt: 1.5 }}>
              <Metric label="Reste a engager" value={fmtMAD(calc.reste)}
                valueColor={calc.reste >= 0 ? colors.success[700] : colors.danger[600]} />
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default ConventionCalculationBreakdown

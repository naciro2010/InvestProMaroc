import { colors } from '@/lib/designSystem'

interface DualProgressProps {
  /** Part engagée (0–100), barre laiton clair en dessous */
  engaged: number
  /** Part payée (0–100), barre bleu nuit superposée */
  paid?: number
  height?: number
  label?: string
}

const clamp = (v: number) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0))

/**
 * DualProgress - Barre de progression « Registre » : fond #ece5d6,
 * engagé #c9b27a en dessous, payé #1c2a44 superposé.
 */
const DualProgress = ({ engaged, paid, height = 6, label }: DualProgressProps) => (
  <div
    role="img"
    aria-label={label ?? `Engagé ${clamp(engaged).toFixed(1)} %${paid !== undefined ? `, payé ${clamp(paid).toFixed(1)} %` : ''}`}
    style={{ position: 'relative', height, borderRadius: 999, background: colors.neutral[100], overflow: 'hidden', minWidth: 60 }}
  >
    <span style={{ position: 'absolute', inset: 0, width: `${clamp(engaged)}%`, background: colors.brass.light, borderRadius: 999 }} />
    {paid !== undefined && (
      <span style={{ position: 'absolute', inset: 0, width: `${clamp(paid)}%`, background: colors.ink.main, borderRadius: 999 }} />
    )}
  </div>
)

export default DualProgress

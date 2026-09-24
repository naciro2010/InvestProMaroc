import { ReactNode } from 'react'
import { colors, gradients, borders } from '@/lib/designSystem'

interface HighlightBlockProps {
  label: ReactNode
  value: ReactNode
  /** Taille du chiffre (21–24px) */
  size?: number
}

/**
 * HighlightBlock - Bloc « Net / Disponible / Reste à payer » : dégradé
 * bleu nuit, halo laiton interne, chiffre ivoire.
 */
const HighlightBlock = ({ label, value, size = 24 }: HighlightBlockProps) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12,
      flexWrap: 'wrap',
      padding: '14px 16px',
      borderRadius: borders.radius.lg,
      background: gradients.highlight,
      boxShadow: `inset 0 0 0 1px ${colors.brass.halo}`,
    }}
  >
    <span style={{ fontSize: 12, color: colors.onDark.secondary }}>{label}</span>
    <span style={{ fontSize: size, fontWeight: 600, color: colors.onDark.primary, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
      {value}
    </span>
  </div>
)

export default HighlightBlock

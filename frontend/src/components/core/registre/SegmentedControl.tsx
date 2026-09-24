import { colors, shadows, borders } from '@/lib/designSystem'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
  /** Libellé affiché avant les options (ex. « Grouper ») */
  label?: string
  ariaLabel: string
}

/**
 * SegmentedControl - Contrôle segmenté « Registre » : conteneur #ece5d6,
 * option active sur fond ivoire, 600, ombre légère.
 */
function SegmentedControl<T extends string>({ value, options, onChange, label, ariaLabel }: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: 3,
        borderRadius: borders.radius.base,
        background: colors.neutral[100],
        flexWrap: 'wrap',
      }}
    >
      {label && (
        <span style={{ fontSize: 13, color: colors.textSecondary, padding: '0 8px 0 6px' }}>{label}</span>
      )}
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            style={{
              height: 28,
              padding: '0 11px',
              border: 0,
              borderRadius: borders.radius.sm,
              background: active ? colors.surface : 'transparent',
              boxShadow: active ? shadows.raised : 'none',
              color: active ? colors.textPrimary : colors.textSecondary,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background .12s ease, color .12s ease',
            }}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: active ? colors.textSecondary : colors.textTertiary }}>
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl

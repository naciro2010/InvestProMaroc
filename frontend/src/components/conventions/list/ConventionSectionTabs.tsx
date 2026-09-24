import { Box } from '@mui/material'
import { colors, typography, transitions } from '@/lib/designSystem'

export type ConventionSection = 'actives' | 'en_attente' | 'terminees' | 'brouillons_locaux'

interface SectionConfig {
  key: ConventionSection
  label: string
  description: string
}

const SECTIONS: SectionConfig[] = [
  { key: 'actives', label: 'Actives', description: 'Validées et en exécution' },
  { key: 'en_attente', label: 'En attente', description: 'Brouillons, soumises et rejetées' },
  { key: 'terminees', label: 'Terminées', description: 'Achevées et annulées' },
  { key: 'brouillons_locaux', label: 'Brouillons locaux', description: 'Assistants en cours sur ce poste' },
]

interface ConventionSectionTabsProps {
  activeSection: ConventionSection
  onSectionChange: (section: ConventionSection) => void
  counts: Record<ConventionSection, number>
}

/**
 * Onglets de section de la liste des conventions (`?section=`).
 * Onglet actif : soulignement laiton 2px, compteur sur fond bleu nuit.
 */
const ConventionSectionTabs = ({ activeSection, onSectionChange, counts }: ConventionSectionTabsProps) => (
  <Box role="tablist" aria-label="Sections des conventions" sx={{ display: 'flex', gap: 0.5, borderBottom: `1px solid ${colors.border}`, overflowX: 'auto' }}>
    {SECTIONS.map(section => {
      const isActive = activeSection === section.key
      const count = counts[section.key]

      // L'onglet des brouillons locaux n'apparaît que s'il y en a
      if (section.key === 'brouillons_locaux' && count === 0) return null

      return (
        <Box
          component="button"
          type="button"
          role="tab"
          aria-selected={isActive}
          title={section.description}
          key={section.key}
          onClick={() => onSectionChange(section.key)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontSize: '15px',
            fontFamily: typography.fontFamily,
            fontWeight: isActive ? typography.weights.bold : typography.weights.medium,
            color: isActive ? colors.textPrimary : colors.textSecondary,
            boxShadow: isActive ? `inset 0 -2px 0 ${colors.brass.main}` : 'none',
            transition: `color ${transitions.fast}`,
            '&:hover': { color: colors.textPrimary },
          }}
        >
          {section.label}
          <Box
            component="span"
            sx={{
              minWidth: 20,
              height: 18,
              px: 0.75,
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              bgcolor: isActive ? colors.ink.main : 'transparent',
              color: isActive ? colors.onDark.primary : colors.textTertiary,
            }}
          >
            {count}
          </Box>
        </Box>
      )
    })}
  </Box>
)

export default ConventionSectionTabs
export { SECTIONS }

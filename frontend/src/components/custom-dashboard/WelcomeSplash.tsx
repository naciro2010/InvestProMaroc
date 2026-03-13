/**
 * WelcomeSplash - Premium welcome screen with rich suggestion categories.
 *
 * Features:
 * - Clean centered layout with gradient icon
 * - 6 suggestion categories covering all use cases
 * - Quick-click examples organized by intent
 * - Tips and keyboard shortcut hints
 */

import { Box, Typography, Paper } from '@mui/material'
import {
  BarChart3, Table2, PieChart as PieIcon, TrendingUp,
  Sparkles, Search, Zap, LayoutDashboard, Filter,
} from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'

interface WelcomeSplashProps {
  onSuggestionClick: (text: string) => void
}

interface SuggestionCard {
  icon: React.ReactNode
  title: string
  description: string
  examples: string[]
  color: string
  bgColor: string
}

const SUGGESTION_CARDS: SuggestionCard[] = [
  {
    icon: <Table2 className="w-5 h-5" />,
    title: 'Explorer les données',
    description: 'Tableaux filtrés et détaillés',
    examples: [
      'Liste des conventions validées',
      'Tableau des fournisseurs',
      'Marchés en cours d\'exécution',
    ],
    color: '#4F46E5',
    bgColor: '#EEF2FF',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Comparer des valeurs',
    description: 'Classements et comparaisons en barres',
    examples: [
      'Top 10 fournisseurs par montant',
      'Marchés par type en barres',
      'Compare les conventions par budget',
    ],
    color: '#0891B2',
    bgColor: '#ECFEFF',
  },
  {
    icon: <PieIcon className="w-5 h-5" />,
    title: 'Voir les répartitions',
    description: 'Parts et proportions visuelles',
    examples: [
      'Répartition des conventions par type',
      'Camembert des décomptes par statut',
      'Distribution des budgets par projet',
    ],
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Suivre les tendances',
    description: 'Évolution temporelle et courbes',
    examples: [
      'Évolution des paiements par mois',
      'Marchés par année en courbe',
      'Tendance des décomptes mensuels',
    ],
    color: '#D97706',
    bgColor: '#FFFBEB',
  },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    title: 'Synthèse rapide',
    description: 'KPIs et indicateurs clés',
    examples: [
      'Combien de marchés au total ?',
      'Bilan des paiements',
      'Résumé des conventions',
    ],
    color: '#7C3AED',
    bgColor: '#F5F3FF',
  },
  {
    icon: <Filter className="w-5 h-5" />,
    title: 'Filtrer et analyser',
    description: 'Croisements avancés avec filtres',
    examples: [
      'Marchés validés par fournisseur',
      'Conventions cadre par zone',
      'Quels sont les projets les plus coûteux ?',
    ],
    color: '#DC2626',
    bgColor: '#FEF2F2',
  },
]

const WelcomeSplash = ({ onSuggestionClick }: WelcomeSplashProps) => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      py: 5,
      px: 2,
      flex: 1,
      minHeight: 400,
    }}>
      {/* Header */}
      <Box sx={{
        width: 56,
        height: 56,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2.5,
        boxShadow: '0 8px 30px rgba(79,70,229,0.25)',
      }}>
        <Sparkles className="w-7 h-7" style={{ color: 'white' }} />
      </Box>

      <Typography sx={{
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        mb: 0.5,
        textAlign: 'center',
      }}>
        Générateur de Dashboard
      </Typography>

      <Typography sx={{
        fontSize: typography.sizes.sm,
        color: colors.neutral[400],
        textAlign: 'center',
        maxWidth: 480,
        mb: 4,
        lineHeight: 1.6,
      }}>
        Décrivez en français ce que vous souhaitez visualiser.
        Filtrez par statut, comparez par zone, suivez les tendances — tout est possible.
      </Typography>

      {/* Suggestion Cards Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
        gap: 2,
        maxWidth: 900,
        width: '100%',
      }}>
        {SUGGESTION_CARDS.map((card) => (
          <Paper
            key={card.title}
            sx={{
              p: 2,
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: '14px',
              backgroundColor: colors.surface,
              boxShadow: 'none',
              cursor: 'default',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              '&:hover': {
                borderColor: colors.neutral[300],
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              },
            }}
          >
            {/* Card header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
              <Box sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                backgroundColor: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                flexShrink: 0,
              }}>
                {card.icon}
              </Box>
              <Box>
                <Typography sx={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.semibold,
                  color: colors.textPrimary,
                  lineHeight: 1.2,
                }}>
                  {card.title}
                </Typography>
                <Typography sx={{
                  fontSize: typography.sizes['2xs'],
                  color: colors.neutral[400],
                  lineHeight: 1.3,
                }}>
                  {card.description}
                </Typography>
              </Box>
            </Box>

            {/* Example buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {card.examples.map((example) => (
                <Box
                  key={example}
                  component="button"
                  onClick={() => onSuggestionClick(example)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.12s ease',
                    '&:hover': {
                      backgroundColor: card.bgColor,
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  <Zap className="w-3 h-3" style={{ color: card.color, opacity: 0.5, flexShrink: 0 }} />
                  <Typography sx={{
                    fontSize: typography.sizes.xs,
                    color: colors.textSecondary,
                    lineHeight: 1.4,
                  }}>
                    {example}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Quick tips */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mt: 3.5,
        px: 2,
        py: 1,
        borderRadius: borders.radius.full,
        backgroundColor: colors.neutral[50],
        border: `1px solid ${colors.neutral[100]}`,
      }}>
        <Search className="w-3.5 h-3.5" style={{ color: colors.neutral[400] }} />
        <Typography sx={{
          fontSize: typography.sizes['2xs'],
          color: colors.neutral[400],
        }}>
          Astuce : Dites &laquo; change en camembert &raquo;, &laquo; top 5 &raquo; ou &laquo; filtre les validés &raquo; pour modifier un résultat
        </Typography>
      </Box>
    </Box>
  )
}

export default WelcomeSplash

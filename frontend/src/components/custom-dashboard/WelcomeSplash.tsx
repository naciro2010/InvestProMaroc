/**
 * WelcomeSplash - Claude-inspired welcome screen with card-based suggestions.
 *
 * Features:
 * - Clean centered layout
 * - Card-based suggestion categories (like Claude's conversation starters)
 * - Quick-click examples organized by intent
 */

import { Box, Typography, Paper } from '@mui/material'
import {
  BarChart3, Table2, PieChart as PieIcon, TrendingUp,
  Sparkles, Search, Zap,
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
    description: 'Afficher des tableaux de données filtrées',
    examples: [
      'Liste des conventions par statut',
      'Tableau des fournisseurs',
      'Afficher les marchés en cours',
    ],
    color: colors.primary[600],
    bgColor: colors.primary[50],
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Comparer des valeurs',
    description: 'Visualiser des montants et volumes en barres',
    examples: [
      'Top 10 fournisseurs par montant',
      'Marchés par type en barres',
      'Nombre de projets par statut',
    ],
    color: colors.info[600],
    bgColor: colors.info[50],
  },
  {
    icon: <PieIcon className="w-5 h-5" />,
    title: 'Voir les répartitions',
    description: 'Répartition en camembert ou proportions',
    examples: [
      'Répartition des conventions par type',
      'Camembert des décomptes par statut',
      'Distribution des budgets par projet',
    ],
    color: colors.success[600],
    bgColor: colors.success[50],
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
    color: colors.warning[600],
    bgColor: colors.warning[50],
  },
]

const WelcomeSplash = ({ onSuggestionClick }: WelcomeSplashProps) => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      py: 6,
      px: 2,
      flex: 1,
      minHeight: 400,
    }}>
      {/* Header */}
      <Box sx={{
        width: 52,
        height: 52,
        borderRadius: borders.radius.xl,
        backgroundColor: colors.primary[50],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2.5,
      }}>
        <Sparkles className="w-6 h-6" style={{ color: colors.primary[600] }} />
      </Box>

      <Typography sx={{
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
        mb: 0.75,
        textAlign: 'center',
      }}>
        Générateur de Dashboard
      </Typography>

      <Typography sx={{
        fontSize: typography.sizes.sm,
        color: colors.neutral[400],
        textAlign: 'center',
        maxWidth: 420,
        mb: 4,
        lineHeight: 1.5,
      }}>
        Décrivez en français ce que vous souhaitez visualiser.
        Choisissez un exemple ci-dessous ou tapez votre propre instruction.
      </Typography>

      {/* Suggestion Cards Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 2,
        maxWidth: 720,
        width: '100%',
      }}>
        {SUGGESTION_CARDS.map((card) => (
          <Paper
            key={card.title}
            sx={{
              p: 2,
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: borders.radius.lg,
              backgroundColor: colors.surface,
              boxShadow: 'none',
              cursor: 'default',
              transition: 'border-color 0.15s ease',
              '&:hover': {
                borderColor: colors.neutral[300],
              },
            }}
          >
            {/* Card header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: borders.radius.base,
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
                    borderRadius: borders.radius.base,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background-color 0.1s ease',
                    '&:hover': {
                      backgroundColor: colors.neutral[50],
                    },
                  }}
                >
                  <Zap className="w-3 h-3" style={{ color: colors.neutral[300], flexShrink: 0 }} />
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
        mt: 3,
        px: 2,
        py: 1,
        borderRadius: borders.radius.full,
        backgroundColor: colors.neutral[50],
      }}>
        <Search className="w-3.5 h-3.5" style={{ color: colors.neutral[400] }} />
        <Typography sx={{
          fontSize: typography.sizes['2xs'],
          color: colors.neutral[400],
        }}>
          Astuce: Dites &laquo; change en camembert &raquo; ou &laquo; top 5 &raquo; pour modifier le dernier résultat
        </Typography>
      </Box>
    </Box>
  )
}

export default WelcomeSplash

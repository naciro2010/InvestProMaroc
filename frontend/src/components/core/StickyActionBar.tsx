import { ReactNode } from 'react'
import { Box, Stack, Typography, CircularProgress, Button } from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { colors, typography, componentStyles, shadows, borders } from '@/lib/designSystem'

// ==================== TYPES ====================

interface StickyActionBarProps {
  /** Titre affiché à gauche de la barre */
  title?: string
  /** Afficher le bouton retour */
  showBack?: boolean
  /** URL de retour (par défaut: -1 = page précédente) */
  backUrl?: string
  /** Label du bouton retour */
  backLabel?: string
  /** Boutons d'action personnalisés (remplace les boutons par défaut) */
  actions?: ReactNode
  /** Le formulaire est en cours de soumission */
  isSubmitting?: boolean
  /** Texte du bouton d'envoi */
  submitLabel?: string
  /** Texte pendant la soumission */
  submittingLabel?: string
  /** Callback annulation */
  onCancel?: () => void
  /** Callback soumission (si pas dans un <form>) */
  onSubmit?: () => void
  /** Type du bouton submit (pour <form>) */
  submitType?: 'button' | 'submit'
  /** Bouton submit désactivé */
  submitDisabled?: boolean
  /** Actions supplémentaires entre Annuler et Enregistrer */
  extraActions?: ReactNode
}

/**
 * StickyActionBar - Barre d'actions sticky en haut de page.
 *
 * Composant micro-frontend pour les formulaires et pages de détail.
 * Reste collé en haut de la page pendant le scroll.
 *
 * DEUX MODES:
 * 1. Mode formulaire (par défaut): Affiche Annuler + Enregistrer
 * 2. Mode custom: Passer `actions` pour des boutons personnalisés
 *
 * PRINCIPES:
 * - Sticky en haut pendant le scroll
 * - Fond blanc, bordure bottom
 * - Titre à gauche, actions à droite
 * - Boutons plats (pas de gradient)
 * - Indicateur de chargement intégré
 *
 * @example Mode formulaire:
 * <form onSubmit={handleSubmit}>
 *   <StickyActionBar
 *     title="Nouvelle Convention"
 *     showBack
 *     backUrl="/conventions"
 *     isSubmitting={isSubmitting}
 *     submitType="submit"
 *   />
 *   {/* Form fields */}
 * </form>
 *
 * @example Mode custom:
 * <StickyActionBar
 *   title="Convention CONV-001"
 *   showBack
 *   actions={
 *     <>
 *       <Button onClick={soumettre}>Soumettre</Button>
 *       <Button onClick={valider}>Valider</Button>
 *     </>
 *   }
 * />
 */
const StickyActionBar = ({
  title,
  showBack = false,
  backUrl,
  backLabel = 'Retour',
  actions,
  isSubmitting = false,
  submitLabel = 'Enregistrer',
  submittingLabel = 'Enregistrement...',
  onCancel,
  onSubmit,
  submitType = 'submit',
  submitDisabled = false,
  extraActions,
}: StickyActionBarProps) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl)
    } else {
      navigate(-1)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      handleBack()
    }
  }

  return (
    <Box
      sx={{
        ...componentStyles.stickyActionBar,
        boxShadow: shadows.sm,
        borderRadius: `${borders.radius.lg} ${borders.radius.lg} 0 0`,
      }}
    >
      {/* Left side: Back + Title */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
        {showBack && (
          <Button
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
            onClick={handleBack}
            size="small"
            sx={{
              color: colors.gray[600],
              textTransform: 'none',
              fontWeight: typography.weights.medium,
              fontSize: typography.sizes.sm,
              minWidth: 'auto',
              px: 1,
              '&:hover': {
                backgroundColor: colors.gray[100],
              },
            }}
          >
            {backLabel}
          </Button>
        )}

        {title && (
          <Typography
            sx={{
              fontWeight: typography.weights.semibold,
              color: colors.gray[800],
              fontSize: typography.sizes.md,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>
        )}
      </Stack>

      {/* Right side: Actions */}
      <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
        {actions ? (
          // Mode custom
          actions
        ) : (
          // Mode formulaire standard
          <>
            {extraActions}

            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
              size="small"
              sx={{
                ...componentStyles.buttonSecondary,
                textTransform: 'none',
                px: 2,
              }}
            >
              Annuler
            </Button>

            <Button
              type={submitType}
              variant="contained"
              onClick={submitType === 'button' ? onSubmit : undefined}
              disabled={isSubmitting || submitDisabled}
              size="small"
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={16} sx={{ color: 'inherit' }} />
                ) : (
                  <Save sx={{ fontSize: 18 }} />
                )
              }
              sx={{
                ...componentStyles.buttonPrimary,
                textTransform: 'none',
                px: 2,
              }}
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </>
        )}
      </Stack>
    </Box>
  )
}

export default StickyActionBar

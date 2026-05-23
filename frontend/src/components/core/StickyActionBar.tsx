import { ReactNode } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
 * StickyActionBar - Barre d'actions sticky en haut de page (style ocr-sage100).
 *
 * Reste collée en haut pendant le scroll. Deux modes :
 * 1. Mode formulaire (défaut) : Annuler + Enregistrer
 * 2. Mode custom : passer `actions`
 *
 * @example Mode formulaire:
 * <form onSubmit={handleSubmit}>
 *   <StickyActionBar title="Nouvelle Convention" showBack backUrl="/conventions" isSubmitting={isSubmitting} submitType="submit" />
 * </form>
 *
 * @example Mode custom:
 * <StickyActionBar title="Convention CONV-001" showBack actions={<>...</>} />
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
    <div className="sticky-actionbar">
      {/* Left side: Back + Title */}
      <div className="sticky-actionbar-left">
        {showBack && (
          <button type="button" className="ocr-btn ocr-btn--ghost ocr-btn--sm" onClick={handleBack}>
            <ArrowLeft size={16} />
            {backLabel}
          </button>
        )}

        {title && <span className="sticky-actionbar-title">{title}</span>}
      </div>

      {/* Right side: Actions */}
      <div className="sticky-actionbar-right">
        {actions ? (
          // Mode custom
          actions
        ) : (
          // Mode formulaire standard
          <>
            {extraActions}

            <button
              type="button"
              className="ocr-btn ocr-btn--secondary ocr-btn--sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Annuler
            </button>

            <button
              type={submitType}
              className="ocr-btn ocr-btn--primary ocr-btn--sm"
              onClick={submitType === 'button' ? onSubmit : undefined}
              disabled={isSubmitting || submitDisabled}
            >
              {isSubmitting ? <span className="ocr-spinner" /> : <Save size={16} />}
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default StickyActionBar

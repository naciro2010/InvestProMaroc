import { ReactNode } from 'react'

// ==================== TYPES ====================

interface FormLayoutProps {
  /** Contenu du formulaire */
  children: ReactNode
  /** Largeur maximale (défaut: 960px) */
  maxWidth?: number | string
}

interface FormSectionProps {
  /** Titre de la section */
  title: string
  /** Description optionnelle */
  description?: string
  /** Contenu de la section */
  children: ReactNode
  /** Afficher un séparateur au-dessus */
  divider?: boolean
}

interface FormGroupProps {
  /** Contenu: FormField ou autres composants */
  children: ReactNode
  /** Nombre de colonnes (défaut: 2 sur desktop, 1 sur mobile) */
  columns?: 1 | 2 | 3
}

interface FormFieldProps {
  /** Le champ de formulaire (TextField, Select, etc.) */
  children: ReactNode
  /** Occuper toute la largeur (2 colonnes) */
  fullWidth?: boolean
}

interface FormFieldLabelProps {
  /** Texte du label */
  label: string
  /** Champ requis */
  required?: boolean
  /** Texte d'aide sous le label */
  helpText?: string
}

// ==================== COMPOSANTS ====================

/**
 * FormLayout - Conteneur principal de formulaire (style ocr-sage100).
 *
 * Fond blanc, bordure subtile, espacement cohérent. A utiliser après
 * le StickyActionBar.
 *
 * @example
 * <FormLayout>
 *   <FormPageSection title="Informations générales">
 *     <FormGroup>
 *       <FormField><TextField label="Code" /></FormField>
 *     </FormGroup>
 *   </FormPageSection>
 * </FormLayout>
 */
export const FormLayout = ({ children, maxWidth = 960 }: FormLayoutProps) => {
  return (
    <div className="form-layout" style={{ maxWidth }}>
      <div className="form-layout-inner">{children}</div>
    </div>
  )
}

/**
 * FormPageSection - Section de formulaire avec titre et séparateur.
 */
export const FormPageSection = ({
  title,
  description,
  children,
  divider = true,
}: FormSectionProps) => {
  return (
    <div className="form-section">
      {divider && <hr className="form-section-divider" />}

      <div className="form-section-head">
        <div className="form-section-title">{title}</div>
        {description && <div className="form-section-desc">{description}</div>}
      </div>

      {children}
    </div>
  )
}

/**
 * FormGroup - Grille de champs responsive (1/2/3 colonnes).
 */
export const FormGroup = ({ children, columns = 2 }: FormGroupProps) => {
  const className = columns === 1 ? 'form-grid' : `form-grid form-grid--${columns}`
  return <div className={className}>{children}</div>
}

/**
 * FormField - Wrapper d'un champ. `fullWidth` occupe toutes les colonnes.
 */
export const FormField = ({ children, fullWidth = false }: FormFieldProps) => {
  return <div className={fullWidth ? 'form-field--full' : undefined}>{children}</div>
}

/**
 * FormFieldLabel - Label personnalisé avec indicateur requis.
 *
 * @example
 * <FormFieldLabel label="Montant" required helpText="En dirhams (MAD)" />
 */
export const FormFieldLabel = ({ label, required = false, helpText }: FormFieldLabelProps) => {
  return (
    <div className="form-field-label">
      <span className="form-field-label-text">
        {label}
        {required && <span className="form-field-label-required">*</span>}
      </span>
      {helpText && <div className="form-field-label-help">{helpText}</div>}
    </div>
  )
}

export default FormLayout

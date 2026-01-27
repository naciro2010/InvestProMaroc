import { ReactNode } from 'react'
import { Box, Typography, Divider } from '@mui/material'
import { colors, typography, spacing, componentStyles, borders, shadows } from '@/lib/designSystem'

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
 * FormLayout - Conteneur principal de formulaire.
 *
 * Fournit un fond blanc, des bordures subtiles et un espacement cohérent.
 * A utiliser directement dans la page, après le StickyActionBar.
 *
 * @example
 * <form onSubmit={handleSubmit}>
 *   <StickyActionBar title="Nouvelle Convention" />
 *   <FormLayout>
 *     <FormPageSection title="Informations générales">
 *       <FormGroup>
 *         <FormField><TextField label="Code" /></FormField>
 *         <FormField><TextField label="Libellé" /></FormField>
 *       </FormGroup>
 *     </FormPageSection>
 *   </FormLayout>
 * </form>
 */
export const FormLayout = ({ children, maxWidth = 960 }: FormLayoutProps) => {
  return (
    <Box
      sx={{
        maxWidth,
        mx: 'auto',
        backgroundColor: colors.surface,
        borderRadius: `0 0 ${borders.radius.lg} ${borders.radius.lg}`,
        border: `1px solid ${colors.border}`,
        borderTop: 'none',
        boxShadow: shadows.sm,
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    </Box>
  )
}

/**
 * FormPageSection - Section de formulaire avec titre.
 *
 * Sépare visuellement les groupes de champs avec un titre
 * et une description optionnelle. Séparateur horizontal entre sections.
 *
 * @example
 * <FormPageSection title="Type et Budget" description="Paramètres financiers de la convention">
 *   <FormGroup>
 *     <FormField><TextField label="Montant" /></FormField>
 *     <FormField><TextField label="Taux" /></FormField>
 *   </FormGroup>
 * </FormPageSection>
 */
export const FormPageSection = ({
  title,
  description,
  children,
  divider = true,
}: FormSectionProps) => {
  return (
    <Box sx={{ ...componentStyles.formSection }}>
      {divider && <Divider sx={{ mb: spacing.mui.xl }} />}

      <Box sx={{ mb: spacing.mui.lg }}>
        <Typography
          sx={{
            fontWeight: typography.weights.semibold,
            color: colors.gray[800],
            fontSize: typography.sizes.lg,
            mb: description ? 0.5 : 0,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            sx={{
              color: colors.gray[500],
              fontSize: typography.sizes.sm,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {children}
    </Box>
  )
}

/**
 * FormGroup - Grille de champs de formulaire.
 *
 * Organise les champs en colonnes responsives.
 * Par défaut: 2 colonnes sur desktop, 1 sur mobile.
 *
 * @example
 * <FormGroup columns={2}>
 *   <FormField><TextField label="Nom" /></FormField>
 *   <FormField><TextField label="Prénom" /></FormField>
 *   <FormField fullWidth><TextField label="Adresse" /></FormField>
 * </FormGroup>
 */
export const FormGroup = ({ children, columns = 2 }: FormGroupProps) => {
  const gridCols = {
    1: '1fr',
    2: { xs: '1fr', md: '1fr 1fr' },
    3: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: gridCols[columns],
        gap: spacing.mui.lg,
        mb: spacing.mui.lg,
      }}
    >
      {children}
    </Box>
  )
}

/**
 * FormField - Wrapper pour un champ de formulaire.
 *
 * Contrôle la largeur du champ dans la grille.
 * `fullWidth` fait que le champ occupe toutes les colonnes.
 *
 * @example
 * <FormGroup>
 *   <FormField><TextField label="Code" required /></FormField>
 *   <FormField fullWidth>
 *     <TextField label="Description" multiline rows={3} />
 *   </FormField>
 * </FormGroup>
 */
export const FormField = ({ children, fullWidth = false }: FormFieldProps) => {
  return (
    <Box
      sx={{
        ...(fullWidth ? componentStyles.formFieldFullWidth : {}),
      }}
    >
      {children}
    </Box>
  )
}

/**
 * FormFieldLabel - Label personnalisé avec indicateur requis.
 *
 * A utiliser quand on veut un label indépendant du composant MUI.
 *
 * @example
 * <FormFieldLabel label="Montant" required helpText="En dirhams (MAD)" />
 * <DecimalInput value={montant} onChange={setMontant} />
 */
export const FormFieldLabel = ({ label, required = false, helpText }: FormFieldLabelProps) => {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Typography sx={componentStyles.fieldLabel}>
        {label}
        {required && (
          <Typography component="span" sx={componentStyles.requiredMark}>
            *
          </Typography>
        )}
      </Typography>
      {helpText && (
        <Typography
          sx={{
            fontSize: typography.sizes.xs,
            color: colors.gray[400],
          }}
        >
          {helpText}
        </Typography>
      )}
    </Box>
  )
}

export default FormLayout

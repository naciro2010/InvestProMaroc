import {
  Box,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import { FormPageSection, FormGroup, FormField } from '@/components/core'
import DecimalInput from '@/components/ui/DecimalInput'
import { colors, typography, componentStyles, borders, spacing } from '@/lib/designSystem'
import type { MarcheLigne, DimensionAnalytique } from '@/types/entities'

interface Dimension extends DimensionAnalytique {
  valeurs: { code: string; libelle: string }[]
}

interface MarcheFormLignesSectionProps {
  lignes: MarcheLigne[]
  dimensions: Dimension[]
  onAddLigne: () => void
  onRemoveLigne: (index: number) => void
  onUpdateLigne: (index: number, field: keyof MarcheLigne, value: string | number) => void
  onUpdateImputation: (index: number, dimensionCode: string, valeurCode: string) => void
  montantHt: number
  montantTva: number
  montantTtc: number
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

export default function MarcheFormLignesSection({
  lignes,
  dimensions,
  onAddLigne,
  onRemoveLigne,
  onUpdateLigne,
  onUpdateImputation,
  montantHt,
  montantTva,
  montantTtc,
}: MarcheFormLignesSectionProps) {
  return (
    <FormPageSection title={`Lignes du Marche (${lignes.length})`}>
      <Box sx={{ mb: spacing.mui.lg }}>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={onAddLigne}
          sx={componentStyles.buttonSecondary}
        >
          Ajouter une Ligne
        </Button>
      </Box>

      {lignes.map((ligne, index) => (
        <LigneItem
          key={index}
          ligne={ligne}
          index={index}
          dimensions={dimensions}
          onRemove={onRemoveLigne}
          onUpdate={onUpdateLigne}
          onUpdateImputation={onUpdateImputation}
        />
      ))}

      {lignes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: spacing.mui['4xl'], color: colors.textSecondary }}>
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textDisabled }}>
            Aucune ligne ajoutee. Cliquez sur "Ajouter une Ligne" pour commencer.
          </Typography>
        </Box>
      )}

      {lignes.length > 0 && (
        <TotauxBlock montantHt={montantHt} montantTva={montantTva} montantTtc={montantTtc} />
      )}
    </FormPageSection>
  )
}

// ── Ligne Item ──

interface LigneItemProps {
  ligne: MarcheLigne
  index: number
  dimensions: Dimension[]
  onRemove: (index: number) => void
  onUpdate: (index: number, field: keyof MarcheLigne, value: string | number) => void
  onUpdateImputation: (index: number, dimensionCode: string, valeurCode: string) => void
}

function LigneItem({ ligne, index, dimensions, onRemove, onUpdate, onUpdateImputation }: LigneItemProps) {
  return (
    <Box
      sx={{
        mb: spacing.mui.lg,
        p: { xs: 2, sm: 2.5 },
        border: `1px solid ${colors.border}`,
        borderRadius: borders.radius.lg,
        bgcolor: colors.neutral[25],
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
          fontSize: typography.sizes.sm,
        }}>
          Ligne #{ligne.numeroLigne}
        </Typography>
        <IconButton
          onClick={() => onRemove(index)}
          size="small"
          sx={{ color: colors.danger[500], '&:hover': { bgcolor: colors.danger[50] } }}
        >
          <Delete sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <FormGroup columns={1}>
        <FormField fullWidth>
          <TextField
            label="Designation"
            value={ligne.designation}
            onChange={(e) => onUpdate(index, 'designation', e.target.value)}
            required
            fullWidth
            size="small"
            sx={componentStyles.inputField}
          />
        </FormField>
      </FormGroup>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: spacing.mui.md,
        mb: spacing.mui.md,
      }}>
        <TextField
          label="Unite"
          select
          value={ligne.unite || 'u'}
          onChange={(e) => onUpdate(index, 'unite', e.target.value)}
          fullWidth
          size="small"
          sx={componentStyles.inputField}
        >
          <MenuItem value="u">Unite (u)</MenuItem>
          <MenuItem value="m²">m²</MenuItem>
          <MenuItem value="ml">ml</MenuItem>
          <MenuItem value="kg">kg</MenuItem>
          <MenuItem value="forfait">Forfait</MenuItem>
        </TextField>

        <DecimalInput
          label="Quantite"
          value={ligne.quantite || 1}
          onChange={(value) => onUpdate(index, 'quantite', value)}
          fullWidth
          size="small"
          min={0}
          decimalPlaces={3}
          sx={componentStyles.inputField}
        />

        <DecimalInput
          label="Prix Unit. HT (MAD)"
          value={ligne.prixUnitaireHT}
          onChange={(value) => onUpdate(index, 'prixUnitaireHT', value)}
          required
          fullWidth
          size="small"
          min={0}
          decimalPlaces={2}
          sx={componentStyles.inputField}
        />

        <DecimalInput
          label="TVA %"
          value={ligne.tauxTVA}
          onChange={(value) => onUpdate(index, 'tauxTVA', value)}
          fullWidth
          size="small"
          min={0}
          decimalPlaces={2}
          sx={componentStyles.inputField}
        />
      </Box>

      {/* Montants calcules */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: spacing.mui.md,
        mb: dimensions.length > 0 ? spacing.mui.md : 0,
      }}>
        <TextField
          label="Montant HT"
          value={formatCurrency(ligne.montantHT)}
          fullWidth
          size="small"
          disabled
          sx={componentStyles.inputField}
        />
        <TextField
          label="Montant TVA"
          value={formatCurrency(ligne.montantTVA)}
          fullWidth
          size="small"
          disabled
          sx={componentStyles.inputField}
        />
        <TextField
          label="Montant TTC"
          value={formatCurrency(ligne.montantTTC)}
          fullWidth
          size="small"
          disabled
          sx={{
            ...componentStyles.inputField,
            '& .MuiOutlinedInput-root': {
              ...componentStyles.inputField['& .MuiOutlinedInput-root'],
              fontWeight: typography.weights.semibold,
            },
          }}
        />
      </Box>

      {/* Imputation Analytique */}
      {dimensions.length > 0 && (
        <Box sx={{ pt: spacing.mui.md, borderTop: `1px solid ${colors.divider}` }}>
          <Typography sx={{
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.semibold,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: spacing.mui.sm,
          }}>
            Imputation Analytique
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
            gap: spacing.mui.sm,
          }}>
            {dimensions.map(dim => (
              <TextField
                key={dim.code}
                label={dim.libelle}
                select
                required={dim.obligatoire}
                value={ligne.imputationAnalytique?.[dim.code] || ''}
                onChange={(e) => onUpdateImputation(index, dim.code, e.target.value)}
                fullWidth
                size="small"
                sx={componentStyles.inputField}
              >
                <MenuItem value="">
                  <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                    -- Selectionner --
                  </Typography>
                </MenuItem>
                {dim.valeurs.map(val => (
                  <MenuItem key={val.code} value={val.code}>
                    {val.code} - {val.libelle}
                  </MenuItem>
                ))}
              </TextField>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ── Totaux Block ──

interface TotauxBlockProps {
  montantHt: number
  montantTva: number
  montantTtc: number
}

function TotauxBlock({ montantHt, montantTva, montantTtc }: TotauxBlockProps) {
  return (
    <Box sx={{
      mt: spacing.mui.lg,
      pt: spacing.mui.lg,
      borderTop: `2px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <Box sx={{
        width: { xs: '100%', md: '50%', lg: '35%' },
        bgcolor: colors.neutral[25],
        border: `1px solid ${colors.border}`,
        borderRadius: borders.radius.lg,
        p: 2,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
            Total HT
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold }}>
            {formatCurrency(montantHt)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
            Total TVA
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold }}>
            {formatCurrency(montantTva)}
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          pt: 1,
          borderTop: `1px solid ${colors.border}`,
        }}>
          <Typography sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary }}>
            Total TTC
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.primary[600] }}>
            {formatCurrency(montantTtc)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

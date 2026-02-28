import { TextField, MenuItem } from '@mui/material'
import { Handshake as ConventionIcon, Business as FournisseurIcon } from '@mui/icons-material'
import { FormPageSection, FormGroup, FormField, ApiAutocomplete, type AutocompleteOption, type QuickCreateConfig } from '@/components/core'
import RichTextEditor from '@/components/common/RichTextEditor'
import { colors, componentStyles } from '@/lib/designSystem'

interface MarcheFormGeneralSectionProps {
  numeroMarche: string
  onNumeroMarcheChange: (value: string) => void
  numAo: string
  onNumAoChange: (value: string) => void
  dateMarche: string
  onDateMarcheChange: (value: string) => void
  conventionOption: AutocompleteOption | null
  onConventionChange: (opt: AutocompleteOption | null) => void
  conventionOptions: AutocompleteOption[]
  fournisseurOption: AutocompleteOption | null
  onFournisseurChange: (opt: AutocompleteOption | null) => void
  fournisseurOptions: AutocompleteOption[]
  fournisseurQuickCreate: QuickCreateConfig<AutocompleteOption>
  statut: string
  onStatutChange: (value: string) => void
  objet: string
  onObjetChange: (value: string) => void
}

export default function MarcheFormGeneralSection({
  numeroMarche,
  onNumeroMarcheChange,
  numAo,
  onNumAoChange,
  dateMarche,
  onDateMarcheChange,
  conventionOption,
  onConventionChange,
  conventionOptions,
  fournisseurOption,
  onFournisseurChange,
  fournisseurOptions,
  fournisseurQuickCreate,
  statut,
  onStatutChange,
  objet,
  onObjetChange,
}: MarcheFormGeneralSectionProps) {
  return (
    <FormPageSection title="Informations Generales" divider={false}>
      <FormGroup columns={3}>
        <FormField>
          <TextField
            label="N° Marche"
            value={numeroMarche}
            onChange={(e) => onNumeroMarcheChange(e.target.value)}
            required
            fullWidth
            size="small"
            sx={componentStyles.inputField}
          />
        </FormField>
        <FormField>
          <TextField
            label="N° Appel d'Offres"
            value={numAo}
            onChange={(e) => onNumAoChange(e.target.value)}
            fullWidth
            size="small"
            sx={componentStyles.inputField}
          />
        </FormField>
        <FormField>
          <TextField
            label="Date Marche"
            type="date"
            value={dateMarche}
            onChange={(e) => onDateMarcheChange(e.target.value)}
            required
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={componentStyles.inputField}
          />
        </FormField>
      </FormGroup>

      <FormGroup columns={3}>
        <FormField>
          <ApiAutocomplete
            label="Convention"
            placeholder="Rechercher une convention..."
            value={conventionOption}
            onChange={onConventionChange}
            options={conventionOptions}
            optionIcon={<ConventionIcon sx={{ fontSize: 16, color: colors.neutral[400] }} />}
          />
        </FormField>
        <FormField>
          <ApiAutocomplete
            label="Fournisseur"
            placeholder="Rechercher un fournisseur..."
            value={fournisseurOption}
            onChange={onFournisseurChange}
            options={fournisseurOptions}
            required
            optionIcon={<FournisseurIcon sx={{ fontSize: 16, color: colors.neutral[400] }} />}
            quickCreate={fournisseurQuickCreate}
          />
        </FormField>
        <FormField>
          <TextField
            label="Statut"
            select
            required
            value={statut}
            onChange={(e) => onStatutChange(e.target.value)}
            fullWidth
            size="small"
            sx={componentStyles.inputField}
          >
            <MenuItem value="EN_COURS">En cours</MenuItem>
            <MenuItem value="VALIDE">Valide</MenuItem>
            <MenuItem value="TERMINE">Termine</MenuItem>
            <MenuItem value="SUSPENDU">Suspendu</MenuItem>
            <MenuItem value="ANNULE">Annule</MenuItem>
            <MenuItem value="EN_ATTENTE">En attente</MenuItem>
          </TextField>
        </FormField>
      </FormGroup>

      <FormGroup columns={1}>
        <FormField fullWidth>
          <RichTextEditor
            label="Objet du Marche"
            value={objet}
            onChange={onObjetChange}
            required
            placeholder="Description de l'objet du marche..."
            minHeight={120}
          />
        </FormField>
      </FormGroup>
    </FormPageSection>
  )
}

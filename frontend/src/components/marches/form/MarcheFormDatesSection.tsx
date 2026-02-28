import { TextField } from '@mui/material'
import { FormPageSection, FormGroup, FormField } from '@/components/core'
import DecimalInput from '@/components/ui/DecimalInput'
import RichTextEditor from '@/components/common/RichTextEditor'
import { componentStyles } from '@/lib/designSystem'

interface MarcheFormDatesSectionProps {
  dateDebut: string
  onDateDebutChange: (value: string) => void
  dateFinPrevue: string
  onDateFinPrevueChange: (value: string) => void
  delaiExecutionMois: number | null
  onDelaiExecutionMoisChange: (value: number | null) => void
  retenueGarantie: number
  onRetenueGarantieChange: (value: number) => void
  remarques: string
  onRemarquesChange: (value: string) => void
}

export default function MarcheFormDatesSection({
  dateDebut,
  onDateDebutChange,
  dateFinPrevue,
  onDateFinPrevueChange,
  delaiExecutionMois,
  onDelaiExecutionMoisChange,
  retenueGarantie,
  onRetenueGarantieChange,
  remarques,
  onRemarquesChange,
}: MarcheFormDatesSectionProps) {
  return (
    <FormPageSection title="Delais et Parametres">
      <FormGroup columns={3}>
        <FormField>
          <TextField
            label="Date Debut"
            type="date"
            value={dateDebut}
            onChange={(e) => onDateDebutChange(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={componentStyles.inputField}
          />
        </FormField>
        <FormField>
          <TextField
            label="Date Fin Prevue"
            type="date"
            value={dateFinPrevue}
            onChange={(e) => onDateFinPrevueChange(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={componentStyles.inputField}
          />
        </FormField>
        <FormField>
          <DecimalInput
            label="Delai Execution (mois)"
            value={delaiExecutionMois || 0}
            onChange={(value) => onDelaiExecutionMoisChange(value || null)}
            fullWidth
            size="small"
            min={0}
            decimalPlaces={0}
            sx={componentStyles.inputField}
          />
        </FormField>
      </FormGroup>

      <FormGroup columns={2}>
        <FormField>
          <DecimalInput
            label="Retenue Garantie (MAD)"
            value={retenueGarantie}
            onChange={(value) => onRetenueGarantieChange(value)}
            fullWidth
            size="small"
            min={0}
            decimalPlaces={2}
            sx={componentStyles.inputField}
          />
        </FormField>
        <FormField>
          <RichTextEditor
            label="Remarques"
            value={remarques}
            onChange={onRemarquesChange}
            placeholder="Remarques ou observations..."
            minHeight={100}
          />
        </FormField>
      </FormGroup>
    </FormPageSection>
  )
}

import {
  Box,
  Typography,
  Paper,
  Divider,
} from '@mui/material'
import FileUploadZone from '@/components/common/FileUploadZone'
import {
  formatCurrency,
  type ConventionWizardFormData,
  type SetFormDataFunction,
  type WizardTotals,
} from './types'

interface WizardStepRecapitulatifProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  totals: WizardTotals
}

const WizardStepRecapitulatif = ({
  formData,
  setFormData,
  totals,
}: WizardStepRecapitulatifProps) => {
  const isParCategorie = formData.commissionMode === 'PAR_CATEGORIE'

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
          Récapitulatif complet
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Section 1: Identité */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 2 }}>
          Identité de la convention
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Code</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{formData.code}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Numéro</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{formData.numeroConvention || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Type</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
              {formData.type === 'CADRE' ? 'CADRE' : 'NON_CADRE'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Section 2: Budget & Commission */}
      <Paper sx={{ p: 3, bgcolor: '#f0f9ff' }}>
        <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 2 }}>
          Budget & Commission
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Budget Global</Typography>
            <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>{formatCurrency(formData.budgetGlobal)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Mode Commission</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
              {isParCategorie ? 'Par catégorie' : 'Taux global'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {isParCategorie ? 'Taux' : 'Taux Commission'}
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
              {isParCategorie ? 'Variable par ligne' : `${formData.tauxCommission}% (${formData.baseCalcul})`}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Commission HT</Typography>
            <Typography variant="h6" color="info.main" sx={{ mt: 0.5 }}>{formatCurrency(totals.commissionHT)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Commission TTC ({formData.tauxTva}% TVA)
            </Typography>
            <Typography variant="h6" color="success.main" sx={{ mt: 0.5 }}>{formatCurrency(totals.commissionTTC)}</Typography>
          </Box>
        </Box>

        {formData.lignesBudget.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Lignes de budget</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                  {formData.lignesBudget.length} ligne(s) - Total: {formatCurrency(totals.totalLignesTTC)}
                </Typography>
              </Box>
              {totals.differenceGlobalVsLignes !== 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Différence Budget vs Lignes
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={totals.differenceGlobalVsLignes >= 0 ? 'success.main' : 'error.main'}
                    sx={{ mt: 0.5 }}
                  >
                    {formatCurrency(totals.differenceGlobalVsLignes)}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </Paper>

      {/* Section 3: Partenaires */}
      {formData.partenaires.length > 0 && (
        <Paper sx={{ p: 3, bgcolor: '#eff6ff' }}>
          <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 2 }}>
            Partenaires
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Nombre</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{formData.partenaires.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Total alloué</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                {formatCurrency(totals.totalPartenaires)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Reliquat</Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                color={formData.budgetGlobal - totals.totalPartenaires >= 0 ? 'success.main' : 'error.main'}
                sx={{ mt: 0.5 }}
              >
                {formatCurrency(formData.budgetGlobal - totals.totalPartenaires)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Section 4: Subventions */}
      {formData.subventions.length > 0 && (
        <Paper sx={{ p: 3, bgcolor: '#f0fdf4' }}>
          <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 2 }}>
            Subventions
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Nombre</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{formData.subventions.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Total subventions</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{formatCurrency(totals.totalSubventions)}</Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Section 5: Dates */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 2 }}>
          Période
        </Typography>
        <Typography variant="body2">
          Du {new Date(formData.dateDebut).toLocaleDateString('fr-FR')}
          {formData.dateFin && ` au ${new Date(formData.dateFin).toLocaleDateString('fr-FR')}`}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Durée : {formData.dureeMois} mois
        </Typography>
      </Paper>

      {/* File upload */}
      <Paper sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          Pièces jointes
        </Typography>
        <FileUploadZone
          files={formData.files}
          onFilesChange={(files) => setFormData((prev) => ({ ...prev, files }))}
          maxFiles={10}
          maxSizeMB={10}
          label="Documents de la convention"
        />
      </Paper>
    </Box>
  )
}

export default WizardStepRecapitulatif

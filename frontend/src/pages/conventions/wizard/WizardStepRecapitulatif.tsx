import type { ReactNode } from 'react'
import {
  Box,
  Typography,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import FileUploadZone from '@/components/common/FileUploadZone'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import {
  formatCurrency,
  type ConventionWizardFormData,
  type SetFormDataFunction,
  type WizardTotals,
  type BudgetLigne,
} from './types'

interface WizardStepRecapitulatifProps {
  formData: ConventionWizardFormData
  setFormData: SetFormDataFunction
  totals: WizardTotals
}

const computeLineCommission = (
  ligne: BudgetLigne,
  baseCalcul: 'DECAISSEMENTS_TTC' | 'DECAISSEMENTS_HT'
): number => {
  const base = baseCalcul === 'DECAISSEMENTS_HT' ? ligne.montantHT : ligne.montantTTC
  const assiette = ligne.plafond > 0 ? Math.min(base, ligne.plafond) : base
  return (assiette * ligne.tauxCommissionLigne) / 100
}

const SectionTitle = ({ children }: { children: string }) => (
  <Typography variant="subtitle2" sx={{ fontWeight: typography.weights.bold, color: colors.primary[700], mb: 1.5 }}>
    {children}
  </Typography>
)

const FieldLabel = ({ children }: { children: ReactNode }) => (
  <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
    {children}
  </Typography>
)

const FieldValue = ({ children, color }: { children: React.ReactNode; color?: string }) => (
  <Typography variant="body2" sx={{ fontWeight: typography.weights.semibold, mt: 0.5, color }}>
    {children}
  </Typography>
)

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const typeLabels: Record<string, string> = {
  CADRE: 'Convention Cadre',
  NON_CADRE: 'Convention Non-Cadre',
  SPECIFIQUE: 'Convention Spécifique',
  AVENANT: 'Avenant',
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
        <Typography variant="h6" gutterBottom sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>
          Récapitulatif complet
        </Typography>
        <Divider />
      </Box>

      {/* Section 1: Identité */}
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <SectionTitle>Identité de la convention</SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
          <Box>
            <FieldLabel>Code</FieldLabel>
            <FieldValue color={colors.primary[700]}>{formData.code}</FieldValue>
          </Box>
          <Box>
            <FieldLabel>Numéro</FieldLabel>
            <FieldValue>{formData.numeroConvention || '-'}</FieldValue>
          </Box>
          <Box>
            <FieldLabel>Type</FieldLabel>
            <Chip
              label={typeLabels[formData.type] || formData.type}
              size="small"
              color={formData.type === 'CADRE' ? 'primary' : 'info'}
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Libellé</FieldLabel>
          <Typography variant="body2" sx={{ mt: 0.5, fontWeight: typography.weights.medium }}>
            {formData.libelle || '-'}
          </Typography>
        </Box>
        <Box>
          <FieldLabel>Objet</FieldLabel>
          {formData.objetRich ? (
            <Box
              dangerouslySetInnerHTML={{ __html: formData.objetRich }}
              sx={{
                mt: 0.5,
                fontSize: typography.sizes.sm,
                color: colors.textPrimary,
                '& p': { m: 0, mb: 0.5 },
                '& ul, & ol': { pl: 2, m: 0 },
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ mt: 0.5 }}>-</Typography>
          )}
        </Box>
      </Paper>

      {/* Section 2: Dates */}
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <SectionTitle>Période et dates</SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <FieldLabel>Date de signature</FieldLabel>
            <FieldValue>{formatDate(formData.dateSignature)}</FieldValue>
          </Box>
          <Box>
            <FieldLabel>Date de début</FieldLabel>
            <FieldValue>{formatDate(formData.dateDebut)}</FieldValue>
          </Box>
          <Box>
            <FieldLabel>Date de fin</FieldLabel>
            <FieldValue>{formData.dateFin ? formatDate(formData.dateFin) : '-'}</FieldValue>
          </Box>
          <Box>
            <FieldLabel>Durée</FieldLabel>
            <FieldValue>{formData.dureeMois} mois</FieldValue>
          </Box>
        </Box>
      </Paper>

      {/* Section 3: Budget & Commission */}
      <Paper sx={{ ...componentStyles.card, p: 3, border: `2px solid ${colors.primary[200]}` }}>
        <SectionTitle>Budget & Commission</SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
          <Box>
            <FieldLabel>Budget Global</FieldLabel>
            <Typography variant="h6" sx={{ color: colors.primary[700], mt: 0.5 }}>
              {formatCurrency(formData.budgetGlobal)}
            </Typography>
          </Box>
          <Box>
            <FieldLabel>Mode Commission</FieldLabel>
            <FieldValue>{isParCategorie ? 'Par catégorie (avec plafond)' : 'Taux global'}</FieldValue>
          </Box>
          <Box>
            <FieldLabel>{isParCategorie ? 'Taux' : 'Taux Commission'}</FieldLabel>
            <FieldValue>{isParCategorie ? 'Variable par ligne' : `${formData.tauxCommission}%`}</FieldValue>
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
          <Box>
            <FieldLabel>Base de calcul</FieldLabel>
            <FieldValue>
              {formData.baseCalcul === 'DECAISSEMENTS_HT' ? 'Décaissements HT' : 'Décaissements TTC'}
            </FieldValue>
          </Box>
          <Box>
            <FieldLabel>TVA Lignes</FieldLabel>
            <FieldValue>{formData.tauxTvaLignes}%</FieldValue>
          </Box>
          <Box>
            <FieldLabel>Commission HT</FieldLabel>
            <Typography variant="h6" sx={{ color: colors.info[600], mt: 0.5 }}>
              {formatCurrency(totals.commissionHT)}
            </Typography>
          </Box>
          <Box>
            <FieldLabel>Commission TTC ({formData.tauxTva}% TVA)</FieldLabel>
            <Typography variant="h6" sx={{ color: colors.success[600], mt: 0.5 }}>
              {formatCurrency(totals.commissionTTC)}
            </Typography>
          </Box>
        </Box>

        {/* Budget lines detail table */}
        {formData.lignesBudget.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: typography.weights.semibold, mb: 1 }}>
              Lignes de budget ({formData.lignesBudget.length})
            </Typography>
            <TableContainer sx={{ border: `1px solid ${colors.border}`, borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                    <TableCell sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Catégorie</TableCell>
                    <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Montant HT</TableCell>
                    <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>TVA</TableCell>
                    <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Montant TTC</TableCell>
                    {isParCategorie && (
                      <>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Plafond</TableCell>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Taux</TableCell>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Commission</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.lignesBudget.map((ligne, idx) => (
                    <TableRow key={idx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontSize: typography.sizes.sm }}>{ligne.designation}</TableCell>
                      <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>{formatCurrency(ligne.montantHT)}</TableCell>
                      <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>{ligne.tauxTVA}%</TableCell>
                      <TableCell align="right" sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold }}>
                        {formatCurrency(ligne.montantTTC)}
                      </TableCell>
                      {isParCategorie && (
                        <>
                          <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>
                            {ligne.plafond > 0 ? formatCurrency(ligne.plafond) : 'Illimité'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>{ligne.tauxCommissionLigne}%</TableCell>
                          <TableCell align="right" sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.success[600] }}>
                            {formatCurrency(computeLineCommission(ligne, formData.baseCalcul))}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                  {/* Total row */}
                  <TableRow sx={{ bgcolor: colors.primary[25] }}>
                    <TableCell sx={{ fontWeight: typography.weights.bold }}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>{formatCurrency(totals.totalLignesHT)}</TableCell>
                    <TableCell />
                    <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>{formatCurrency(totals.totalLignesTTC)}</TableCell>
                    {isParCategorie && (
                      <>
                        <TableCell />
                        <TableCell />
                        <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.success[700] }}>
                          {formatCurrency(totals.commissionHT)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            {/* Difference alert */}
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FieldLabel>Écart Budget Global vs Lignes :</FieldLabel>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: typography.weights.bold,
                  color: totals.differenceGlobalVsLignes >= 0 ? colors.success[600] : colors.danger[600],
                }}
              >
                {formatCurrency(totals.differenceGlobalVsLignes)}
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Section 4: Partenaires */}
      {formData.partenaires.length > 0 && (
        <Paper sx={{ ...componentStyles.card, p: 3 }}>
          <SectionTitle>Partenaires ({formData.partenaires.length})</SectionTitle>
          <TableContainer sx={{ border: `1px solid ${colors.border}`, borderRadius: 1, mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                  <TableCell sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Partenaire</TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Budget</TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>%</TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>CI (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.partenaires.map((p, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontSize: typography.sizes.sm }}>{p.designation}</TableCell>
                    <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>{formatCurrency(p.budget)}</TableCell>
                    <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>{p.pourcentage.toFixed(2)}%</TableCell>
                    <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>{p.ci}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <Box>
              <FieldLabel>Total alloué</FieldLabel>
              <FieldValue color={colors.primary[700]}>{formatCurrency(totals.totalPartenaires)}</FieldValue>
            </Box>
            <Box>
              <FieldLabel>Reliquat</FieldLabel>
              <FieldValue color={formData.budgetGlobal - totals.totalPartenaires >= 0 ? colors.success[600] : colors.danger[600]}>
                {formatCurrency(formData.budgetGlobal - totals.totalPartenaires)}
              </FieldValue>
            </Box>
            <Box>
              <FieldLabel>Allocation</FieldLabel>
              <FieldValue>
                {formData.budgetGlobal > 0
                  ? `${((totals.totalPartenaires / formData.budgetGlobal) * 100).toFixed(1)}%`
                  : '0%'}
              </FieldValue>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Section 5: Subventions */}
      {formData.subventions.length > 0 && (
        <Paper sx={{ ...componentStyles.card, p: 3 }}>
          <SectionTitle>Subventions ({formData.subventions.length})</SectionTitle>
          <TableContainer sx={{ border: `1px solid ${colors.border}`, borderRadius: 1, mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                  <TableCell sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Organisme</TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Montant</TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>%</TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xs }}>Date obtention</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.subventions.map((s, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontSize: typography.sizes.sm }}>{s.organisme}</TableCell>
                    <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>{formatCurrency(s.montant)}</TableCell>
                    <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>{s.pourcentage.toFixed(2)}%</TableCell>
                    <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>{formatDate(s.dateObtention)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <FieldLabel>Total subventions</FieldLabel>
              <FieldValue color={colors.success[600]}>{formatCurrency(totals.totalSubventions)}</FieldValue>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Section 6: Pièces jointes */}
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <SectionTitle>Pièces jointes</SectionTitle>
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

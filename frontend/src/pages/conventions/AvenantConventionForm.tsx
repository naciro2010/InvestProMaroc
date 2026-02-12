import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Stack,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material'
import { Save, Close, TrendingUp, TrendingDown } from '@mui/icons-material'
import { avenantConventionsAPI, conventionsAPI } from '@/lib/api'
import { AvenantConventionRequest, AvenantConventionResponse } from '@/types/avenantConvention'
import { colors, typography } from '@/lib/designSystem'

interface ConventionDataSnapshot {
  code?: string
  numero?: string
  libelle?: string
  objet?: string
  budget?: number
  tauxCommission?: number
  baseCalcul?: string
  tauxTva?: number
  dateDebut?: string
  dateFin?: string
  statut?: string
}

/** Partenaire data as returned by GET /conventions/{id}/partenaires */
interface PartenaireAllocation {
  id: number
  partenaireId: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  commissionIntervention: number | null
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  remarques: string | null
}

interface AvenantConventionFormProps {
  conventionId: number
  conventionData?: ConventionDataSnapshot
  avenantToEdit?: AvenantConventionResponse
  onSave: () => void
  onCancel: () => void
}

// Helper pour formater les nombres en affichage
const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

// Helper pour parser les nombres depuis l'affichage
const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/\s/g, '').replace(/,/g, '.')
  return parseFloat(cleaned) || 0
}

const AvenantConventionForm = ({
  conventionId,
  conventionData,
  avenantToEdit,
  onSave,
  onCancel,
}: AvenantConventionFormProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [partenaires, setPartenaires] = useState<PartenaireAllocation[]>([])
  const [partenairesLoading, setPartenairesLoading] = useState(false)

  const isEdit = !!avenantToEdit

  const [formData, setFormData] = useState({
    numeroAvenant: '',
    dateAvenant: new Date().toISOString().split('T')[0],
    objet: '',
    motif: '',
    detailsModifications: '',
    ancienBudget: '',
    nouveauBudget: '',
    ancienTauxCommission: '',
    nouveauTauxCommission: '',
    dateEffet: '',
    remarques: '',
  })

  useEffect(() => {
    if (avenantToEdit) {
      setFormData({
        numeroAvenant: avenantToEdit.numeroAvenant,
        dateAvenant: avenantToEdit.dateAvenant,
        objet: avenantToEdit.objet,
        motif: avenantToEdit.motif || '',
        detailsModifications: avenantToEdit.detailsModifications || '',
        ancienBudget: avenantToEdit.ancienBudget ? formatNumber(avenantToEdit.ancienBudget) : '',
        nouveauBudget: avenantToEdit.nouveauBudget ? formatNumber(avenantToEdit.nouveauBudget) : '',
        ancienTauxCommission: avenantToEdit.ancienTauxCommission?.toString() || '',
        nouveauTauxCommission: avenantToEdit.nouveauTauxCommission?.toString() || '',
        dateEffet: avenantToEdit.dateEffet || '',
        remarques: avenantToEdit.remarques || '',
      })
    } else if (conventionData) {
      // Pré-remplir avec les données actuelles de la convention
      setFormData(prev => ({
        ...prev,
        ancienBudget: conventionData.budget ? formatNumber(conventionData.budget) : '',
        ancienTauxCommission: conventionData.tauxCommission?.toString() || '',
      }))
    }
  }, [avenantToEdit, conventionData])

  // Load partenaires for this convention
  useEffect(() => {
    const loadPartenaires = async () => {
      setPartenairesLoading(true)
      try {
        const response = await conventionsAPI.getPartenaires(conventionId)
        const data = response.data?.data ?? response.data ?? []
        if (Array.isArray(data)) {
          setPartenaires(data as PartenaireAllocation[])
        }
      } catch (err: unknown) {
        console.error('Erreur chargement partenaires:', err)
      } finally {
        setPartenairesLoading(false)
      }
    }
    loadPartenaires()
  }, [conventionId])

  // Compute preview of new partenaire allocations when budget changes
  const partenairePreview = useMemo(() => {
    if (partenaires.length === 0) return []

    const nouveauBudgetStr = formData.nouveauBudget
    const ancienBudgetStr = formData.ancienBudget
    const nouveauBudget = nouveauBudgetStr ? parseFormattedNumber(nouveauBudgetStr) : 0
    const ancienBudget = ancienBudgetStr ? parseFormattedNumber(ancienBudgetStr) : 0
    const hasBudgetChange = nouveauBudget > 0 && nouveauBudget !== ancienBudget

    // Use new taux commission if changed, otherwise use current convention taux
    const nouveauTaux = formData.nouveauTauxCommission
      ? parseFloat(formData.nouveauTauxCommission)
      : (conventionData?.tauxCommission ?? 0)

    return partenaires.map((p: PartenaireAllocation) => {
      const nouveauBudgetAlloue = hasBudgetChange
        ? (p.pourcentage / 100) * nouveauBudget
        : p.budgetAlloue

      const nouvelleCommission = nouveauTaux > 0
        ? (nouveauBudgetAlloue * nouveauTaux) / 100
        : p.commissionIntervention ?? 0

      const deltaBudget = nouveauBudgetAlloue - p.budgetAlloue
      const deltaCommission = nouvelleCommission - (p.commissionIntervention ?? 0)

      return {
        id: p.id,
        nom: p.partenaireNom,
        sigle: p.partenaireSigle,
        pourcentage: p.pourcentage,
        budgetActuel: p.budgetAlloue,
        budgetNouveau: nouveauBudgetAlloue,
        deltaBudget,
        commissionActuelle: p.commissionIntervention ?? 0,
        commissionNouvelle: nouvelleCommission,
        deltaCommission,
        estMaitreOeuvre: p.estMaitreOeuvre,
        estMaitreOeuvreDelegue: p.estMaitreOeuvreDelegue,
      }
    })
  }, [partenaires, formData.nouveauBudget, formData.ancienBudget, formData.nouveauTauxCommission, conventionData?.tauxCommission])

  // Check if there is an actual budget or taux change to show preview
  const showPreview = useMemo(() => {
    if (partenaires.length === 0) return false
    const nouveauBudget = formData.nouveauBudget ? parseFormattedNumber(formData.nouveauBudget) : 0
    const ancienBudget = formData.ancienBudget ? parseFormattedNumber(formData.ancienBudget) : 0
    const hasBudgetChange = nouveauBudget > 0 && nouveauBudget !== ancienBudget

    const hasTauxChange = formData.nouveauTauxCommission !== '' &&
      formData.nouveauTauxCommission !== formData.ancienTauxCommission

    return hasBudgetChange || hasTauxChange
  }, [partenaires, formData.nouveauBudget, formData.ancienBudget, formData.nouveauTauxCommission, formData.ancienTauxCommission])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Créer le snapshot des données avant
      const donneesAvant = conventionData ? {
        code: conventionData.code,
        numero: conventionData.numero,
        libelle: conventionData.libelle,
        objet: conventionData.objet,
        budget: conventionData.budget,
        tauxCommission: conventionData.tauxCommission,
        baseCalcul: conventionData.baseCalcul,
        tauxTva: conventionData.tauxTva,
        dateDebut: conventionData.dateDebut,
        dateFin: conventionData.dateFin,
        statut: conventionData.statut,
      } : undefined

      // Créer l'objet des modifications
      const modifications: Record<string, number> = {}

      if (formData.nouveauBudget && formData.ancienBudget !== formData.nouveauBudget) {
        modifications.budget = parseFormattedNumber(formData.nouveauBudget)
      }

      if (formData.nouveauTauxCommission && formData.ancienTauxCommission !== formData.nouveauTauxCommission) {
        modifications.tauxCommission = parseFloat(formData.nouveauTauxCommission)
      }

      const payload: AvenantConventionRequest = {
        conventionId,
        numeroAvenant: formData.numeroAvenant,
        dateAvenant: formData.dateAvenant,
        objet: formData.objet,
        motif: formData.motif || undefined,
        donneesAvant,
        modifications: Object.keys(modifications).length > 0 ? modifications : undefined,
        detailsModifications: formData.detailsModifications || undefined,
        ancienBudget: formData.ancienBudget ? parseFormattedNumber(formData.ancienBudget) : undefined,
        nouveauBudget: formData.nouveauBudget ? parseFormattedNumber(formData.nouveauBudget) : undefined,
        ancienTauxCommission: formData.ancienTauxCommission ? parseFloat(formData.ancienTauxCommission) : undefined,
        nouveauTauxCommission: formData.nouveauTauxCommission ? parseFloat(formData.nouveauTauxCommission) : undefined,
        dateEffet: formData.dateEffet || undefined,
        remarques: formData.remarques || undefined,
      }

      if (isEdit && avenantToEdit) {
        await avenantConventionsAPI.update(avenantToEdit.id, payload)
      } else {
        await avenantConventionsAPI.create(payload)
      }

      onSave()
    } catch (err: unknown) {
      console.error('Erreur sauvegarde avenant:', err)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleNumberChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[\d\s,.]*$/.test(value) || value === '') {
      setFormData({ ...formData, [field]: value })
    }
  }

  const formatNumberOnBlur = (field: string) => () => {
    const value = formData[field as keyof typeof formData] as string
    if (value) {
      const num = parseFormattedNumber(value)
      setFormData({ ...formData, [field]: formatNumber(num) })
    }
  }

  const calculateDelta = () => {
    if (formData.ancienBudget && formData.nouveauBudget) {
      const ancien = parseFormattedNumber(formData.ancienBudget)
      const nouveau = parseFormattedNumber(formData.nouveauBudget)
      const delta = nouveau - ancien
      return formatNumber(delta)
    }
    return '0,00'
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {isEdit ? 'Modifier l\'avenant' : 'Nouvel avenant de convention'}
        </Typography>
        {avenantToEdit && (
          <Chip
            label={avenantToEdit.statut}
            color={
              avenantToEdit.statut === 'VALIDE' ? 'success' :
              avenantToEdit.statut === 'SOUMIS' ? 'warning' : 'default'
            }
            size="small"
          />
        )}
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <TextField
            label="Numéro d'avenant"
            value={formData.numeroAvenant}
            onChange={(e) => setFormData({ ...formData, numeroAvenant: e.target.value })}
            required
            fullWidth
            disabled={!avenantToEdit?.isEditable && isEdit}
            helperText="Ex: AVE-CONV-001"
          />

          <TextField
            label="Date de l'avenant"
            type="date"
            value={formData.dateAvenant}
            onChange={(e) => setFormData({ ...formData, dateAvenant: e.target.value })}
            required
            fullWidth
            disabled={!avenantToEdit?.isEditable && isEdit}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Objet de l'avenant"
            value={formData.objet}
            onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
            required
            fullWidth
            multiline
            rows={2}
            disabled={!avenantToEdit?.isEditable && isEdit}
            helperText="Décrivez brièvement l'objectif de cet avenant"
          />

          <TextField
            label="Motif / Justification"
            value={formData.motif}
            onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
            fullWidth
            multiline
            rows={3}
            disabled={!avenantToEdit?.isEditable && isEdit}
            helperText="Justification détaillée de l'avenant"
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Impacts financiers
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <TextField
              label="Budget actuel"
              value={formData.ancienBudget}
              onChange={handleNumberChange('ancienBudget')}
              onBlur={formatNumberOnBlur('ancienBudget')}
              fullWidth
              disabled={!avenantToEdit?.isEditable && isEdit}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
            />

            <TextField
              label="Nouveau budget"
              value={formData.nouveauBudget}
              onChange={handleNumberChange('nouveauBudget')}
              onBlur={formatNumberOnBlur('nouveauBudget')}
              fullWidth
              disabled={!avenantToEdit?.isEditable && isEdit}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
            />

            <TextField
              label="Variation"
              value={calculateDelta()}
              fullWidth
              disabled
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Taux commission actuel"
              value={formData.ancienTauxCommission}
              onChange={(e) => setFormData({ ...formData, ancienTauxCommission: e.target.value })}
              fullWidth
              type="number"
              disabled={!avenantToEdit?.isEditable && isEdit}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{ step: '0.01', min: '0', max: '100' }}
            />

            <TextField
              label="Nouveau taux commission"
              value={formData.nouveauTauxCommission}
              onChange={(e) => setFormData({ ...formData, nouveauTauxCommission: e.target.value })}
              fullWidth
              type="number"
              disabled={!avenantToEdit?.isEditable && isEdit}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{ step: '0.01', min: '0', max: '100' }}
            />
          </Box>

          {/* Repartition Budget Preview */}
          {partenairesLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" sx={{ color: colors.primary[600] }}>
                Chargement des partenaires...
              </Typography>
            </Box>
          )}

          {partenaires.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: typography.weights.semibold, color: colors.primary[800] }}>
                Repartition Budget Partenaires
              </Typography>

              {showPreview && (
                <Box sx={{
                  mb: 1.5,
                  px: 2,
                  py: 1,
                  borderRadius: '6px',
                  bgcolor: colors.info[50],
                  border: `1px solid ${colors.info[200]}`,
                }}>
                  <Typography variant="body2" sx={{ color: colors.info[700], fontSize: typography.sizes.xs }}>
                    Apercu de la nouvelle repartition. Les montants seront recalcules automatiquement
                    lors de la validation de l&apos;avenant en conservant les pourcentages actuels.
                  </Typography>
                </Box>
              )}

              <TableContainer component={Paper} variant="outlined" sx={{ borderColor: colors.primary[100] }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: colors.primary[25] }}>
                      <TableCell sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.primary[700] }}>
                        Partenaire
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.primary[700] }}>
                        %
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.primary[700] }}>
                        Budget actuel (DH)
                      </TableCell>
                      {showPreview && (
                        <>
                          <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.primary[700] }}>
                            Nouveau budget (DH)
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.primary[700] }}>
                            Variation (DH)
                          </TableCell>
                        </>
                      )}
                      <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.primary[700] }}>
                        Commission actuelle (DH)
                      </TableCell>
                      {showPreview && (
                        <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.primary[700] }}>
                          Nouvelle commission (DH)
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partenairePreview.map((row) => {
                      const isPositive = row.deltaBudget > 0
                      const isNegative = row.deltaBudget < 0
                      const deltaColor = isPositive ? colors.success[600] : isNegative ? colors.danger[600] : colors.primary[600]

                      return (
                        <TableRow key={row.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontSize: typography.sizes.sm }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {row.nom}
                              {row.sigle && (
                                <Typography component="span" sx={{ color: colors.primary[400], fontSize: typography.sizes.xs }}>
                                  ({row.sigle})
                                </Typography>
                              )}
                              {row.estMaitreOeuvre && (
                                <Chip label="MO" size="small" sx={{ ml: 0.5, height: 18, fontSize: '0.65rem', bgcolor: colors.primary[50], color: colors.primary[700] }} />
                              )}
                              {row.estMaitreOeuvreDelegue && (
                                <Chip label="MOD" size="small" sx={{ ml: 0.5, height: 18, fontSize: '0.65rem', bgcolor: colors.purple[50], color: colors.purple[700] }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: typography.sizes.sm, color: colors.primary[600] }}>
                            {row.pourcentage.toFixed(2)}%
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>
                            {formatNumber(row.budgetActuel)}
                          </TableCell>
                          {showPreview && (
                            <>
                              <TableCell align="right" sx={{
                                fontSize: typography.sizes.sm,
                                fontWeight: typography.weights.semibold,
                                color: isPositive ? colors.success[700] : isNegative ? colors.danger[700] : colors.primary[800],
                              }}>
                                {formatNumber(row.budgetNouveau)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: deltaColor }}>
                                  {isPositive && <TrendingUp sx={{ fontSize: 14 }} />}
                                  {isNegative && <TrendingDown sx={{ fontSize: 14 }} />}
                                  {isPositive ? '+' : ''}{formatNumber(row.deltaBudget)}
                                </Box>
                              </TableCell>
                            </>
                          )}
                          <TableCell align="right" sx={{ fontSize: typography.sizes.sm }}>
                            {formatNumber(row.commissionActuelle)}
                          </TableCell>
                          {showPreview && (
                            <TableCell align="right" sx={{
                              fontSize: typography.sizes.sm,
                              fontWeight: typography.weights.semibold,
                              color: row.deltaCommission > 0 ? colors.success[700] : row.deltaCommission < 0 ? colors.danger[700] : colors.primary[800],
                            }}>
                              {formatNumber(row.commissionNouvelle)}
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <TextField
            label="Détails des modifications"
            value={formData.detailsModifications}
            onChange={(e) => setFormData({ ...formData, detailsModifications: e.target.value })}
            fullWidth
            multiline
            rows={3}
            disabled={!avenantToEdit?.isEditable && isEdit}
            helperText="Description textuelle complète des modifications apportées"
          />

          <TextField
            label="Date d'effet"
            type="date"
            value={formData.dateEffet}
            onChange={(e) => setFormData({ ...formData, dateEffet: e.target.value })}
            fullWidth
            disabled={!avenantToEdit?.isEditable && isEdit}
            InputLabelProps={{ shrink: true }}
            helperText="Date d'entrée en vigueur de l'avenant (optionnel)"
          />

          <TextField
            label="Remarques"
            value={formData.remarques}
            onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
            fullWidth
            multiline
            rows={2}
            disabled={!avenantToEdit?.isEditable && isEdit}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Close />}
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </Button>

            {(!isEdit || avenantToEdit?.isEditable) && (
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            )}
          </Box>
        </Stack>
      </form>
    </Paper>
  )
}

export default AvenantConventionForm

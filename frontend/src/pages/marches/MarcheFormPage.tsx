import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  IconButton,
  Autocomplete,
  CircularProgress,
  Alert,
} from '@mui/material'
import { Add, Delete, PersonAdd } from '@mui/icons-material'
import AppLayout from '@/components/layout/AppLayout'
import { StickyActionBar, FormLayout, FormPageSection, FormGroup, FormField } from '@/components/core'
import LocationPicker from '@/components/ui/LocationPicker'
import DecimalInput from '@/components/ui/DecimalInput'
import FournisseurDialog from '@/components/marches/FournisseurDialog'
import { fournisseursAPI, conventionsAPI, dimensionsAPI } from '@/lib/api'
import { colors, typography, componentStyles, borders, spacing } from '@/lib/designSystem'
import RichTextEditor from '@/components/common/RichTextEditor'
import { MarcheLigne, DimensionAnalytique } from '@/types/entities'

interface Dimension extends DimensionAnalytique {
  valeurs: { code: string; libelle: string }[]
}

interface ConventionOption {
  id: number
  code: string
  libelle: string
}

interface FournisseurOption {
  id: number
  code: string
  raisonSociale: string
  ice: string | null
}

export default function MarcheFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  // Loading and error state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reference data
  const [conventions, setConventions] = useState<ConventionOption[]>([])
  const [fournisseurs, setFournisseurs] = useState<FournisseurOption[]>([])
  const [dimensions, setDimensions] = useState<Dimension[]>([])

  // Fournisseur dialog
  const [fournisseurDialogOpen, setFournisseurDialogOpen] = useState(false)

  // Form state
  const [numeroMarche, setNumeroMarche] = useState('')
  const [numAo, setNumAo] = useState('')
  const [dateMarche, setDateMarche] = useState(new Date().toISOString().split('T')[0])
  const [conventionId, setConventionId] = useState<number | null>(null)
  const [fournisseurId, setFournisseurId] = useState<number | null>(null)
  const [objet, setObjet] = useState('')
  const [montantHt, setMontantHt] = useState(0)
  const [tauxTva, setTauxTva] = useState(20)
  const [montantTva, setMontantTva] = useState(0)
  const [montantTtc, setMontantTtc] = useState(0)
  const [statut, setStatut] = useState('EN_COURS')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFinPrevue, setDateFinPrevue] = useState('')
  const [delaiExecutionMois, setDelaiExecutionMois] = useState<number | null>(null)
  const [retenueGarantie, setRetenueGarantie] = useState(0)
  const [remarques, setRemarques] = useState('')

  // Geolocation state
  const [adresse, setAdresse] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>(undefined)
  const [longitude, setLongitude] = useState<number | undefined>(undefined)
  const [zoneGeographique, setZoneGeographique] = useState('')

  // Line items state
  const [lignes, setLignes] = useState<MarcheLigne[]>([])

  useEffect(() => {
    fetchData()
    if (isEdit) {
      fetchMarche()
    }
  }, [id])

  useEffect(() => {
    calculerMontants()
  }, [lignes])

  const fetchData = async () => {
    try {
      const [convRes, fournRes, dimRes] = await Promise.all([
        conventionsAPI.getAll(),
        fournisseursAPI.getAll(),
        dimensionsAPI.getAll()
      ])
      const convData = convRes.data.data || convRes.data || []
      setConventions(Array.isArray(convData) ? convData : [])

      const fournData = fournRes.data.data || fournRes.data || []
      setFournisseurs(Array.isArray(fournData) ? fournData.map((f: FournisseurOption) => ({
        id: f.id,
        code: f.code,
        raisonSociale: f.raisonSociale,
        ice: f.ice || null,
      })) : [])

      const dimData = dimRes.data.data || dimRes.data || []
      setDimensions(Array.isArray(dimData) ? dimData : [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur chargement données: ${msg}`)
    }
  }

  const fetchMarche = async () => {
    try {
      setLoading(true)
      const api = (await import('@/lib/api')).default
      const res = await api.get(`/marches/${id}`)
      const marche = res.data.data || res.data

      setNumeroMarche(marche.numeroMarche || '')
      setNumAo(marche.numAO || '')
      setDateMarche(marche.dateMarche || '')
      setConventionId(marche.convention?.id || marche.conventionId || null)
      setFournisseurId(marche.fournisseur?.id || marche.fournisseurId || null)
      setObjet(marche.objet || '')
      setMontantHt(marche.montantHT || marche.montantHt || 0)
      setTauxTva(marche.tauxTVA || marche.tauxTva || 20)
      setMontantTva(marche.montantTVA || marche.montantTva || 0)
      setMontantTtc(marche.montantTTC || marche.montantTtc || 0)
      setStatut(marche.statut || 'EN_COURS')
      setDateDebut(marche.dateDebut || '')
      setDateFinPrevue(marche.dateFinPrevue || '')
      setDelaiExecutionMois(marche.delaiExecutionMois)
      setRetenueGarantie(marche.retenueGarantie || 0)
      setRemarques(marche.remarques || '')
      setAdresse(marche.adresse || '')
      setLatitude(marche.latitude)
      setLongitude(marche.longitude)
      setZoneGeographique(marche.zoneGeographique || '')
      setLignes(marche.lignes || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur chargement marché: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const calculerMontants = () => {
    const totalHT = lignes.reduce((sum, l) => sum + (l.montantHT || 0), 0)
    const totalTVA = lignes.reduce((sum, l) => sum + (l.montantTVA || 0), 0)
    const totalTTC = lignes.reduce((sum, l) => sum + (l.montantTTC || 0), 0)
    setMontantHt(totalHT)
    setMontantTva(totalTVA)
    setMontantTtc(totalTTC)
  }

  const ajouterLigne = () => {
    const nouvelleLigne: MarcheLigne = {
      numeroLigne: lignes.length + 1,
      designation: '',
      unite: 'u',
      quantite: 1,
      prixUnitaireHT: 0,
      montantHT: 0,
      tauxTVA: 20,
      montantTVA: 0,
      montantTTC: 0,
      imputationAnalytique: {}
    }
    setLignes([...lignes, nouvelleLigne])
  }

  const supprimerLigne = (index: number) => {
    const newLignes = lignes.filter((_, i) => i !== index)
    newLignes.forEach((l, i) => l.numeroLigne = i + 1)
    setLignes(newLignes)
  }

  const updateLigne = (index: number, field: keyof MarcheLigne, value: string | number) => {
    const newLignes = [...lignes]
    newLignes[index] = { ...newLignes[index], [field]: value }

    if (['quantite', 'prixUnitaireHT', 'tauxTVA'].includes(field)) {
      const ligne = newLignes[index]
      const qte = ligne.quantite || 1
      ligne.montantHT = qte * ligne.prixUnitaireHT
      ligne.montantTVA = ligne.montantHT * ligne.tauxTVA / 100
      ligne.montantTTC = ligne.montantHT + ligne.montantTVA
    }
    setLignes(newLignes)
  }

  const updateImputationLigne = (index: number, dimensionCode: string, valeurCode: string) => {
    const newLignes = [...lignes]
    newLignes[index].imputationAnalytique = {
      ...newLignes[index].imputationAnalytique,
      [dimensionCode]: valeurCode
    }
    setLignes(newLignes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      setLoading(true)
      const api = (await import('@/lib/api')).default

      const data = {
        numeroMarche,
        numAo: numAo || null,
        dateMarche,
        conventionId,
        fournisseurId,
        objet,
        montantHt,
        tauxTva,
        montantTva,
        montantTtc,
        statut,
        dateDebut: dateDebut || null,
        dateFinPrevue: dateFinPrevue || null,
        delaiExecutionMois,
        retenueGarantie,
        remarques: remarques || null,
        adresse: adresse || null,
        latitude,
        longitude,
        zoneGeographique: zoneGeographique || null,
        lignes
      }

      if (isEdit) {
        await api.put(`/marches/${id}`, data)
      } else {
        await api.post('/marches', data)
      }

      navigate('/marches')
    } catch (err: unknown) {
      if (err instanceof Error) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || err.message)
      } else {
        setError('Erreur lors de la sauvegarde')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount)
  }

  const selectedFournisseur = fournisseurs.find(f => f.id === fournisseurId) || null

  if (loading && isEdit) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <form onSubmit={handleSubmit}>
        <StickyActionBar
          title={isEdit ? 'Modifier le Marché' : 'Nouveau Marché'}
          showBack
          backUrl="/marches"
          isSubmitting={loading}
          submitType="submit"
        />

        <FormLayout maxWidth={1100}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Section 1: Informations Générales */}
          <FormPageSection title="Informations Générales" divider={false}>
            <FormGroup columns={3}>
              <FormField>
                <TextField
                  label="N° Marché"
                  value={numeroMarche}
                  onChange={(e) => setNumeroMarche(e.target.value)}
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
                  onChange={(e) => setNumAo(e.target.value)}
                  fullWidth
                  size="small"
                  sx={componentStyles.inputField}
                />
              </FormField>
              <FormField>
                <TextField
                  label="Date Marché"
                  type="date"
                  value={dateMarche}
                  onChange={(e) => setDateMarche(e.target.value)}
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
                <TextField
                  label="Convention"
                  select
                  value={conventionId || ''}
                  onChange={(e) => setConventionId(e.target.value ? Number(e.target.value) : null)}
                  fullWidth
                  size="small"
                  sx={componentStyles.inputField}
                >
                  <MenuItem value="">
                    <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
                      -- Aucune --
                    </Typography>
                  </MenuItem>
                  {conventions.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.code} - {c.libelle}
                    </MenuItem>
                  ))}
                </TextField>
              </FormField>
              <FormField>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Autocomplete
                    options={fournisseurs}
                    value={selectedFournisseur}
                    onChange={(_, newValue) => setFournisseurId(newValue?.id || null)}
                    getOptionLabel={(option) =>
                      `${option.raisonSociale}${option.ice ? ` (ICE: ${option.ice})` : ''}`
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Fournisseur"
                        required
                        size="small"
                        sx={componentStyles.inputField}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option.id}>
                        <Box>
                          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
                            {option.raisonSociale}
                          </Typography>
                          {option.ice && (
                            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                              ICE: {option.ice}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    noOptionsText="Aucun fournisseur trouvé"
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    onClick={() => setFournisseurDialogOpen(true)}
                    size="small"
                    title="Créer un nouveau fournisseur"
                    sx={{
                      mt: 0.5,
                      bgcolor: colors.primary[50],
                      color: colors.primary[600],
                      border: `1px solid ${colors.primary[200]}`,
                      borderRadius: borders.radius.base,
                      width: 38,
                      height: 38,
                      '&:hover': {
                        bgcolor: colors.primary[100],
                      },
                    }}
                  >
                    <PersonAdd sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </FormField>
              <FormField>
                <TextField
                  label="Statut"
                  select
                  required
                  value={statut}
                  onChange={(e) => setStatut(e.target.value)}
                  fullWidth
                  size="small"
                  sx={componentStyles.inputField}
                >
                  <MenuItem value="EN_COURS">En cours</MenuItem>
                  <MenuItem value="VALIDE">Validé</MenuItem>
                  <MenuItem value="TERMINE">Terminé</MenuItem>
                  <MenuItem value="SUSPENDU">Suspendu</MenuItem>
                  <MenuItem value="ANNULE">Annulé</MenuItem>
                  <MenuItem value="EN_ATTENTE">En attente</MenuItem>
                </TextField>
              </FormField>
            </FormGroup>

            <FormGroup columns={1}>
              <FormField fullWidth>
                <RichTextEditor
                  label="Objet du Marché"
                  value={objet}
                  onChange={setObjet}
                  required
                  placeholder="Description de l'objet du marché..."
                  minHeight={120}
                />
              </FormField>
            </FormGroup>
          </FormPageSection>

          {/* Section 2: Délais et Paramètres */}
          <FormPageSection title="Délais et Paramètres">
            <FormGroup columns={3}>
              <FormField>
                <TextField
                  label="Date Début"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={componentStyles.inputField}
                />
              </FormField>
              <FormField>
                <TextField
                  label="Date Fin Prévue"
                  type="date"
                  value={dateFinPrevue}
                  onChange={(e) => setDateFinPrevue(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={componentStyles.inputField}
                />
              </FormField>
              <FormField>
                <DecimalInput
                  label="Délai Exécution (mois)"
                  value={delaiExecutionMois || 0}
                  onChange={(value) => setDelaiExecutionMois(value || null)}
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
                  onChange={(value) => setRetenueGarantie(value)}
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
                  onChange={setRemarques}
                  placeholder="Remarques ou observations..."
                  minHeight={100}
                />
              </FormField>
            </FormGroup>
          </FormPageSection>

          {/* Section 3: Localisation */}
          <FormPageSection title="Localisation">
            <Box sx={{ mb: spacing.mui.lg }}>
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                adresse={adresse}
                onLocationChange={(location) => {
                  setLatitude(location.latitude)
                  setLongitude(location.longitude)
                  setAdresse(location.adresse)
                }}
              />
            </Box>
            <FormGroup columns={1}>
              <FormField fullWidth>
                <TextField
                  label="Zone Géographique"
                  value={zoneGeographique}
                  onChange={(e) => setZoneGeographique(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Ex: Casablanca, Rabat-Salé-Kénitra, Région du Nord..."
                  helperText="Indiquez la région ou zone administrative du marché"
                  sx={componentStyles.inputField}
                />
              </FormField>
            </FormGroup>
          </FormPageSection>

          {/* Section 4: Lignes du Marché */}
          <FormPageSection title={`Lignes du Marché (${lignes.length})`}>
            <Box sx={{ mb: spacing.mui.lg }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={ajouterLigne}
                sx={componentStyles.buttonSecondary}
              >
                Ajouter une Ligne
              </Button>
            </Box>

            {lignes.map((ligne, index) => (
              <Box
                key={index}
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
                    onClick={() => supprimerLigne(index)}
                    size="small"
                    sx={{ color: colors.danger[500], '&:hover': { bgcolor: colors.danger[50] } }}
                  >
                    <Delete sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                <FormGroup columns={1}>
                  <FormField fullWidth>
                    <TextField
                      label="Désignation"
                      value={ligne.designation}
                      onChange={(e) => updateLigne(index, 'designation', e.target.value)}
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
                    label="Unité"
                    select
                    value={ligne.unite || 'u'}
                    onChange={(e) => updateLigne(index, 'unite', e.target.value)}
                    fullWidth
                    size="small"
                    sx={componentStyles.inputField}
                  >
                    <MenuItem value="u">Unité (u)</MenuItem>
                    <MenuItem value="m²">m²</MenuItem>
                    <MenuItem value="ml">ml</MenuItem>
                    <MenuItem value="kg">kg</MenuItem>
                    <MenuItem value="forfait">Forfait</MenuItem>
                  </TextField>

                  <DecimalInput
                    label="Quantité"
                    value={ligne.quantite || 1}
                    onChange={(value) => updateLigne(index, 'quantite', value)}
                    fullWidth
                    size="small"
                    min={0}
                    decimalPlaces={3}
                    sx={componentStyles.inputField}
                  />

                  <DecimalInput
                    label="Prix Unit. HT (MAD)"
                    value={ligne.prixUnitaireHT}
                    onChange={(value) => updateLigne(index, 'prixUnitaireHT', value)}
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
                    onChange={(value) => updateLigne(index, 'tauxTVA', value)}
                    fullWidth
                    size="small"
                    min={0}
                    decimalPlaces={2}
                    sx={componentStyles.inputField}
                  />
                </Box>

                {/* Montants calculés */}
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
                  <Box sx={{
                    pt: spacing.mui.md,
                    borderTop: `1px solid ${colors.divider}`,
                  }}>
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
                          onChange={(e) => updateImputationLigne(index, dim.code, e.target.value)}
                          fullWidth
                          size="small"
                          sx={componentStyles.inputField}
                        >
                          <MenuItem value="">
                            <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                              -- Sélectionner --
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
            ))}

            {lignes.length === 0 && (
              <Box sx={{
                textAlign: 'center',
                py: spacing.mui['4xl'],
                color: colors.textSecondary,
              }}>
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textDisabled }}>
                  Aucune ligne ajoutée. Cliquez sur "Ajouter une Ligne" pour commencer.
                </Typography>
              </Box>
            )}

            {/* Totaux */}
            {lignes.length > 0 && (
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
            )}
          </FormPageSection>
        </FormLayout>
      </form>

      {/* Fournisseur Creation Dialog */}
      <FournisseurDialog
        open={fournisseurDialogOpen}
        onClose={() => setFournisseurDialogOpen(false)}
        onSuccess={(newFournisseur) => {
          setFournisseurs(prev => [...prev, newFournisseur])
          setFournisseurId(newFournisseur.id)
        }}
      />
    </AppLayout>
  )
}

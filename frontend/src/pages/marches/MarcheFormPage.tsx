import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, CircularProgress, Alert } from '@mui/material'
import { Business as FournisseurIcon } from '@mui/icons-material'
import AppLayout from '@/components/layout/AppLayout'
import {
  StickyActionBar,
  FormLayout,
  ControlPanel,
  type AutocompleteOption,
  type QuickCreateConfig,
} from '@/components/core'
import {
  MarcheFormGeneralSection,
  MarcheFormDatesSection,
  MarcheFormLocationSection,
  MarcheFormLignesSection,
} from '@/components/marches/form'
import { fournisseursAPI, conventionsAPI, dimensionsAPI } from '@/lib/api'
import { colors } from '@/lib/designSystem'
import type { MarcheLigne, DimensionAnalytique } from '@/types/entities'

interface Dimension extends DimensionAnalytique {
  valeurs: { code: string; libelle: string }[]
}

interface ConventionOptionData {
  id: number
  code: string
  libelle: string
}

interface FournisseurOptionData {
  id: number
  code: string
  raisonSociale: string
  ice: string | null
}

export default function MarcheFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reference data
  const [conventions, setConventions] = useState<ConventionOptionData[]>([])
  const [fournisseurs, setFournisseurs] = useState<FournisseurOptionData[]>([])
  const [dimensions, setDimensions] = useState<Dimension[]>([])

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

  // Geolocation
  const [adresse, setAdresse] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>(undefined)
  const [longitude, setLongitude] = useState<number | undefined>(undefined)
  const [zoneGeographique, setZoneGeographique] = useState('')

  // Line items
  const [lignes, setLignes] = useState<MarcheLigne[]>([])

  useEffect(() => {
    fetchData()
    if (isEdit) fetchMarche()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { calculerMontants() }, [lignes])

  const fetchData = async () => {
    try {
      const [convRes, fournRes, dimRes] = await Promise.all([
        conventionsAPI.getAll(),
        fournisseursAPI.getAll(),
        dimensionsAPI.getAll(),
      ])
      const convData = convRes.data.data || convRes.data || []
      setConventions(Array.isArray(convData) ? convData : [])

      const fournData = fournRes.data.data || fournRes.data || []
      setFournisseurs(Array.isArray(fournData) ? fournData.map((f: FournisseurOptionData) => ({
        id: f.id, code: f.code, raisonSociale: f.raisonSociale, ice: f.ice || null,
      })) : [])

      const dimData = dimRes.data.data || dimRes.data || []
      setDimensions(Array.isArray(dimData) ? dimData : [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur chargement donnees: ${msg}`)
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
      setError(`Erreur chargement marche: ${msg}`)
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
      imputationAnalytique: {},
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
      [dimensionCode]: valeurCode,
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
        numeroMarche, numAo: numAo || null, dateMarche, conventionId, fournisseurId,
        objet, montantHt, tauxTva, montantTva, montantTtc, statut,
        dateDebut: dateDebut || null, dateFinPrevue: dateFinPrevue || null,
        delaiExecutionMois, retenueGarantie, remarques: remarques || null,
        adresse: adresse || null, latitude, longitude,
        zoneGeographique: zoneGeographique || null, lignes,
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

  // Map reference data to AutocompleteOption
  const conventionOptions: AutocompleteOption[] = conventions.map((c) => ({
    id: c.id, label: c.libelle || c.code, secondaryLabel: c.code,
  }))
  const fournisseurOptions: AutocompleteOption[] = fournisseurs.map((f) => ({
    id: f.id, label: f.raisonSociale, secondaryLabel: f.ice ? `ICE: ${f.ice}` : f.code,
  }))

  const selectedConventionOption = conventionOptions.find((o) => o.id === conventionId) ?? null
  const selectedFournisseurOption = fournisseurOptions.find((o) => o.id === fournisseurId) ?? null

  const fournisseurQuickCreate: QuickCreateConfig<AutocompleteOption> = {
    dialogTitle: 'Nouveau fournisseur',
    icon: <FournisseurIcon sx={{ color: colors.primary[600] }} />,
    fields: [
      { name: 'code', label: 'Code', required: true, placeholder: 'FOURN-001', autoFocus: true },
      { name: 'raisonSociale', label: 'Raison sociale', required: true },
      { name: 'ice', label: 'ICE (15 chiffres)', placeholder: '000000000000000' },
    ],
    infoMessage: 'Le fournisseur sera cree et immediatement selectionne.',
    onCreate: async (vals) => {
      const res = await fournisseursAPI.create({
        code: vals.code, raisonSociale: vals.raisonSociale, ice: vals.ice || undefined,
      })
      const created = res.data.data || res.data
      const newF: FournisseurOptionData = {
        id: created.id, code: created.code, raisonSociale: created.raisonSociale, ice: created.ice || null,
      }
      setFournisseurs((prev) => [...prev, newF])
      setFournisseurId(newF.id)
      return { id: newF.id, label: newF.raisonSociale, secondaryLabel: newF.ice ? `ICE: ${newF.ice}` : newF.code }
    },
  }

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
      <ControlPanel
        breadcrumbs={[
          { label: 'Marches', path: '/marches' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
        hideBottomRow
      />
      <form onSubmit={handleSubmit}>
        <StickyActionBar
          title={isEdit ? 'Modifier le Marche' : 'Nouveau Marche'}
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

          <MarcheFormGeneralSection
            numeroMarche={numeroMarche}
            onNumeroMarcheChange={setNumeroMarche}
            numAo={numAo}
            onNumAoChange={setNumAo}
            dateMarche={dateMarche}
            onDateMarcheChange={setDateMarche}
            conventionOption={selectedConventionOption}
            onConventionChange={(opt) => setConventionId(opt?.id ?? null)}
            conventionOptions={conventionOptions}
            fournisseurOption={selectedFournisseurOption}
            onFournisseurChange={(opt) => setFournisseurId(opt?.id ?? null)}
            fournisseurOptions={fournisseurOptions}
            fournisseurQuickCreate={fournisseurQuickCreate}
            statut={statut}
            onStatutChange={setStatut}
            objet={objet}
            onObjetChange={setObjet}
          />

          <MarcheFormDatesSection
            dateDebut={dateDebut}
            onDateDebutChange={setDateDebut}
            dateFinPrevue={dateFinPrevue}
            onDateFinPrevueChange={setDateFinPrevue}
            delaiExecutionMois={delaiExecutionMois}
            onDelaiExecutionMoisChange={setDelaiExecutionMois}
            retenueGarantie={retenueGarantie}
            onRetenueGarantieChange={setRetenueGarantie}
            remarques={remarques}
            onRemarquesChange={setRemarques}
          />

          <MarcheFormLocationSection
            latitude={latitude}
            longitude={longitude}
            adresse={adresse}
            zoneGeographique={zoneGeographique}
            onLocationChange={(loc) => {
              setLatitude(loc.latitude)
              setLongitude(loc.longitude)
              setAdresse(loc.adresse)
            }}
            onZoneGeographiqueChange={setZoneGeographique}
          />

          <MarcheFormLignesSection
            lignes={lignes}
            dimensions={dimensions}
            onAddLigne={ajouterLigne}
            onRemoveLigne={supprimerLigne}
            onUpdateLigne={updateLigne}
            onUpdateImputation={updateImputationLigne}
            montantHt={montantHt}
            montantTva={montantTva}
            montantTtc={montantTtc}
          />
        </FormLayout>
      </form>
    </AppLayout>
  )
}

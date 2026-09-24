import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Alert, Skeleton, Button } from '@mui/material'
import { ArrowLeft, Plus } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import {
  ControlPanel, FieldGroup, Notebook, StatusBadge, StatusCircuit, Panel,
  InlineEditField, EditFieldDialog, Chatter, useEntityHistory,
  type StatusStep, type InlineEditFieldConfig,
} from '@/components/core'
import { marchesAPI, conventionsAPI, fournisseursAPI } from '@/lib/api'
import { colors, componentStyles } from '@/lib/designSystem'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/contexts/ToastContext'
import MarcheSmartButtons from './components/MarcheSmartButtons'
import MarcheConventionCard from './components/MarcheConventionCard'
import MarcheInfoCard from './components/MarcheInfoCard'
import MarcheOrdresServiceSection from './components/MarcheOrdresServiceSection'
import MarcheLignesSection from './components/MarcheLignesSection'
import MarcheSituationPaiementCard from './components/MarcheSituationPaiementCard'
import MarcheDecomptesSection from './components/MarcheDecomptesSection'
import MarchePaiementsSection from './components/MarchePaiementsSection'
import MarcheAvenantsSection from './components/MarcheAvenantsSection'
import MarcheMontantsPanel from './components/MarcheMontantsPanel'
import { useTrackRecentRecord } from '@/hooks/useRecentRecords'

// ==================== TYPES ====================

interface MarcheData {
  id: number; numeroMarche: string; objet: string; statut: string; dateMarche: string
  conventionId: number | null; conventionCode: string | null
  fournisseurId: number | null; fournisseurNom: string | null
  montantHt: number | null; montantTtc: number | null; montantTva: number | null; tauxTva: number | null
  typeMarche: string | null; natureMarche: string | null; naturePrestation: string | null
  delaiExecution: number | null; numAo: string | null; dateSignature: string | null
  dateDebut: string | null; dateFinPrevue: string | null
  retenueGarantie: number | null; remarques: string | null
  nbLignes?: number; nbDecomptes?: number; nbPaiements?: number; nbAvenants?: number; montantPaye?: number
}

interface ConventionRef { id: number; code: string; objet: string }
interface FournisseurRef { id: number; code: string; raisonSociale: string }

interface DialogFieldState {
  key: string; label: string; value: string; mode: 'richtext' | 'textarea'
}

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' }, { value: 'EN_COURS', label: 'En cours' },
  { value: 'VALIDE', label: 'Validé' }, { value: 'TERMINE', label: 'Terminé' },
]
const STATUT_OPTIONS = STATUS_STEPS.map(s => ({ value: s.value, label: s.label }))


// ==================== COMPONENT ====================

const MarcheDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const [marche, setMarche] = useState<MarcheData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conventions, setConventions] = useState<ConventionRef[]>([])
  const [fournisseurs, setFournisseurs] = useState<FournisseurRef[]>([])
  const [dialogField, setDialogField] = useState<DialogFieldState | null>(null)
  const marcheId = id ? parseInt(id) : 0
  const { activities: chatterActivities, loading: chatterLoading, refresh: refreshChatter } = useEntityHistory('MARCHE', marcheId)

  const loadMarche = useCallback(async (mid: number) => {
    try {
      setLoading(true); setError(null)
      const res = await marchesAPI.getById(mid)
      const r = res.data?.data || res.data
      setMarche({
        id: r.id, numeroMarche: r.numeroMarche || '', objet: r.objet || '',
        statut: r.statut || 'BROUILLON', dateMarche: r.dateMarche || '',
        conventionId: r.convention?.id || r.conventionId || null,
        conventionCode: r.convention?.code || r.conventionCode || null,
        fournisseurId: r.fournisseur?.id || r.fournisseurId || null,
        fournisseurNom: r.fournisseur?.raisonSociale || r.fournisseurNom || null,
        montantHt: r.montantHT ?? r.montantHt ?? null, montantTtc: r.montantTTC ?? r.montantTtc ?? null,
        montantTva: r.montantTVA ?? r.montantTva ?? null, tauxTva: r.tauxTVA ?? r.tauxTva ?? null,
        typeMarche: r.typeMarche || null, natureMarche: r.natureMarche || null,
        naturePrestation: r.naturePrestation || null, numAo: r.numAo || null,
        dateSignature: r.dateSignature || null,
        delaiExecution: r.delaiExecutionMois ?? r.delaiExecution ?? null,
        dateDebut: r.dateDebut || null, dateFinPrevue: r.dateFinPrevue || null,
        retenueGarantie: r.retenueGarantie ?? null, remarques: r.remarques || null,
        nbLignes: r.nbLignes ?? undefined, nbDecomptes: r.nbDecomptes ?? undefined,
        nbPaiements: r.nbPaiements ?? undefined, nbAvenants: r.nbAvenants ?? undefined,
        montantPaye: r.montantPaye ?? undefined,
      })
    } catch { setError('Erreur lors du chargement du marche') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (marcheId) loadMarche(marcheId) }, [marcheId, loadMarche])

  const loadReferenceData = useCallback(async () => {
    try {
      const [convRes, fournRes] = await Promise.all([conventionsAPI.getAll(), fournisseursAPI.getAll()])
      const convArr = convRes.data?.data || convRes.data || []
      setConventions(Array.isArray(convArr) ? convArr.map((c: ConventionRef) => ({ id: c.id, code: c.code, objet: c.objet })) : [])
      const fournArr = fournRes.data?.data || fournRes.data || []
      setFournisseurs(Array.isArray(fournArr) ? fournArr.map((f: FournisseurRef) => ({ id: f.id, code: f.code, raisonSociale: f.raisonSociale })) : [])
    } catch { showToast('Erreur chargement des donnees de reference', 'error') }
  }, [showToast])

  const canEdit = marche ? marche.statut === 'BROUILLON' || marche.statut === 'EN_COURS' : false

  useEffect(() => { if (canEdit) loadReferenceData() }, [canEdit, loadReferenceData])

  const handleFieldSave = async (fieldKey: string, value: string | number | null) => {
    if (!marche) return
    const payload: Record<string, unknown> = {
      numeroMarche: marche.numeroMarche, objet: marche.objet, statut: marche.statut,
      typeMarche: marche.typeMarche, natureMarche: marche.natureMarche,
      naturePrestation: marche.naturePrestation, numAo: marche.numAo,
      montantHt: marche.montantHt, tauxTva: marche.tauxTva, montantTtc: marche.montantTtc,
      conventionId: marche.conventionId, fournisseurId: marche.fournisseurId,
      dateMarche: marche.dateMarche, dateSignature: marche.dateSignature,
      dateDebut: marche.dateDebut, dateFinPrevue: marche.dateFinPrevue,
      delaiExecutionMois: marche.delaiExecution, retenueGarantie: marche.retenueGarantie,
      remarques: marche.remarques,
      [fieldKey]: value,
    }
    await marchesAPI.update(marche.id, payload)
    await loadMarche(marche.id)
    showToast('Marche mis a jour', 'success')
  }

  const openFieldDialog = (fieldKey: string, value: string) => {
    setDialogField({ key: fieldKey, label: 'Remarques', value, mode: 'textarea' })
  }

  const handleDialogSave = async (fieldKey: string, value: string) => {
    await handleFieldSave(fieldKey, value)
  }

  const field = (config: InlineEditFieldConfig) => (
    <InlineEditField config={config} onSave={handleFieldSave} onOpenDialog={openFieldDialog} />
  )

  // « Consultés récemment » dans le menu
  useTrackRecentRecord(marche ? {
    key: `marche-${marche.id}`, type: 'marche', code: marche.numeroMarche,
    label: marche.objet?.replace(/<[^>]+>/g, '') ?? '', path: `/marches/${marche.id}`,
  } : null)

  // --- Render guards ---
  if (!id) return <AppLayout><Box sx={{ p: 4 }}><Alert severity="error">ID du marché manquant</Alert></Box></AppLayout>

  if (loading) return (
    <AppLayout>
      <Skeleton variant="text" width={320} height={48} />
      <Skeleton variant="rounded" height={36} sx={{ mb: 2.5, maxWidth: 520 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' }, gap: 2.5 }}>
        <Skeleton variant="rounded" height={420} />
        <Skeleton variant="rounded" height={420} />
      </Box>
    </AppLayout>
  )

  if (error || !marche) return (
    <AppLayout>
      <Alert severity="error" sx={{ mb: 2 }}>{error || 'Marché non trouvé'}</Alert>
      <Button onClick={() => navigate('/marches')} sx={componentStyles.buttonSecondary}>Retour aux marchés</Button>
    </AppLayout>
  )

  const convOptions = conventions.map(c => ({ value: c.id, label: `${c.code} - ${c.objet}` }))
  const fournOptions = fournisseurs.map(f => ({ value: f.id, label: `${f.code} - ${f.raisonSociale}` }))

  // Build effective steps: insert SUSPENDU/ANNULE into the pipeline when active
  const effectiveSteps: StatusStep[] = (() => {
    if (marche.statut === 'SUSPENDU') return [
      ...STATUS_STEPS.slice(0, 3),
      { value: 'SUSPENDU', label: 'Suspendu', variant: 'danger' as const },
    ]
    if (marche.statut === 'ANNULE') return [
      ...STATUS_STEPS.slice(0, 3),
      { value: 'ANNULE', label: 'Annulé', variant: 'danger' as const },
    ]
    return STATUS_STEPS
  })()

  const detailFields = (
    <>
      <FieldGroup title="Informations générales" columns={3}>
        {field({ fieldKey: 'numeroMarche', label: 'Numéro', type: 'text', value: marche.numeroMarche, editable: false })}
        {field({ fieldKey: 'objet', label: 'Objet', type: 'text', value: marche.objet || '', editable: canEdit, fullWidth: true })}
        {field({ fieldKey: 'statut', label: 'Statut', type: 'select', value: marche.statut, options: STATUT_OPTIONS, displayValue: <StatusBadge status={marche.statut} />, editable: canEdit })}
        {field({ fieldKey: 'typeMarche', label: 'Type', type: 'text', value: marche.typeMarche || '', editable: canEdit })}
        {field({ fieldKey: 'natureMarche', label: 'Nature', type: 'text', value: marche.natureMarche || '', editable: canEdit })}
        {field({ fieldKey: 'naturePrestation', label: 'Nature prestation', type: 'text', value: marche.naturePrestation || '', editable: canEdit })}
        {field({ fieldKey: 'numAo', label: 'N° AO', type: 'text', value: marche.numAo || '', editable: canEdit })}
        {field({ fieldKey: 'conventionId', label: 'Convention', type: 'select', value: marche.conventionId, options: convOptions, emptyLabel: '-- Aucune --', displayValue: marche.conventionCode || '-', isLink: !!marche.conventionId && !canEdit, onLinkClick: () => marche.conventionId && navigate(`/conventions/${marche.conventionId}`), editable: canEdit })}
        {field({ fieldKey: 'fournisseurId', label: 'Fournisseur', type: 'select', value: marche.fournisseurId, options: fournOptions, emptyLabel: '-- Aucun --', displayValue: marche.fournisseurNom || '-', editable: canEdit })}
      </FieldGroup>
      <FieldGroup title="Montants" columns={3}>
        {field({ fieldKey: 'montantHt', label: 'Montant HT', type: 'number', value: marche.montantHt ?? 0, isMoney: true, displayValue: marche.montantHt ? formatCurrency(marche.montantHt) : '-', editable: canEdit })}
        {field({ fieldKey: 'tauxTva', label: 'Taux TVA (%)', type: 'number', value: marche.tauxTva ?? 0, displayValue: marche.tauxTva != null ? `${marche.tauxTva}%` : '-', editable: canEdit })}
        {field({ fieldKey: 'montantTtc', label: 'Montant TTC', type: 'number', value: marche.montantTtc ?? 0, isMoney: true, displayValue: marche.montantTtc ? formatCurrency(marche.montantTtc) : '-', editable: canEdit })}
      </FieldGroup>
      <FieldGroup title="Dates et délais" columns={3}>
        {field({ fieldKey: 'dateSignature', label: 'Date signature', type: 'date', value: marche.dateSignature || '', editable: canEdit })}
        {field({ fieldKey: 'dateMarche', label: 'Date marché', type: 'date', value: marche.dateMarche || '', editable: canEdit })}
        {field({ fieldKey: 'dateDebut', label: 'Date début', type: 'date', value: marche.dateDebut || '', editable: canEdit })}
        {field({ fieldKey: 'dateFinPrevue', label: 'Date fin prévue', type: 'date', value: marche.dateFinPrevue || '', editable: canEdit })}
        {field({ fieldKey: 'delaiExecution', label: 'Délai exécution (mois)', type: 'number', value: marche.delaiExecution ?? 0, displayValue: marche.delaiExecution != null ? `${marche.delaiExecution} mois` : '-', editable: canEdit })}
        {field({ fieldKey: 'retenueGarantie', label: 'Retenue garantie (%)', type: 'number', value: marche.retenueGarantie ?? 0, displayValue: marche.retenueGarantie != null ? `${marche.retenueGarantie}%` : '-', editable: canEdit })}
      </FieldGroup>
      <FieldGroup title="Notes">
        {field({ fieldKey: 'remarques', label: 'Remarques', type: 'richtext', value: marche.remarques || '', displayValue: marche.remarques || '-', editable: canEdit, fullWidth: true })}
      </FieldGroup>
    </>
  )

  const objetTexte = marche.objet?.replace(/<[^>]+>/g, '') || marche.numeroMarche

  return (
    <AppLayout>
      <ControlPanel
        breadcrumbs={[
          { label: 'Marchés', path: '/marches' },
          { label: marche.numeroMarche || `#${marche.id}` },
        ]}
        overline={
          <>
            <span>{marche.numeroMarche}{marche.numAo ? ` · ${marche.numAo}` : ''}</span>
            <StatusBadge status={marche.statut} />
            {marche.typeMarche && <StatusBadge status={marche.typeMarche} />}
          </>
        }
        title={objetTexte}
        subtitle={
          <>
            {marche.fournisseurNom || 'Fournisseur non renseigné'}
            {marche.conventionId && marche.conventionCode && (
              <> · convention{' '}
                <Box component="a" href={`/conventions/${marche.conventionId}`}
                  onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate(`/conventions/${marche.conventionId}`) }}
                  sx={{ fontWeight: 700, color: colors.textPrimary }}>
                  {marche.conventionCode}
                </Box>
              </>
            )}
          </>
        }
        actions={
          <>
            <Button startIcon={<ArrowLeft size={14} />} onClick={() => navigate('/marches')} sx={componentStyles.buttonGhost}>
              Liste
            </Button>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate(`/marches/${marcheId}/decomptes/nouveau`)} sx={componentStyles.buttonPrimary}>
              Nouveau décompte
            </Button>
          </>
        }
        hideBottomRow
      />

      <Box sx={{ mb: 2.5 }}>
        <StatusCircuit steps={effectiveSteps} currentStatus={marche.statut} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' }, gap: 2.5, alignItems: 'start' }}>
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <MarcheSmartButtons
            marcheId={marcheId}
            nombreLignes={marche.nbLignes ?? 0}
            nombreDecomptes={marche.nbDecomptes ?? 0}
            nombrePaiements={marche.nbPaiements ?? 0}
            nombreAvenants={marche.nbAvenants ?? 0}
            montantTtc={marche.montantTtc ?? 0}
            montantPaye={marche.montantPaye ?? 0}
            fournisseurNom={marche.fournisseurNom ?? undefined}
            onScrollToTab={(tab) => setSearchParams(prev => { const next = new URLSearchParams(prev); next.set('tab', tab); return next }, { replace: true })}
          />

          {/* Onglets : chaque onglet charge ses propres données */}
          <Panel flush>
            <Box sx={{ px: 2 }}>
              <Notebook syncParam="tab" tabs={[
                { id: 'situation', label: 'Situation des paiements', count: marche.nbDecomptes, content: (<Box><MarcheSituationPaiementCard marcheId={marcheId} /><Box sx={{ mt: 3 }}><MarcheDecomptesSection marcheId={marcheId} /></Box><Box sx={{ mt: 3 }}><MarchePaiementsSection marcheId={marcheId} /></Box></Box>) },
                { id: 'bordereau', label: 'Bordereau des prix', count: marche.nbLignes, content: <MarcheLignesSection marcheId={marcheId} /> },
                { id: 'avenants', label: 'Avenants', count: marche.nbAvenants, content: <MarcheAvenantsSection marcheId={marcheId} /> },
                { id: 'detail', label: 'Détail', content: (<Box>{detailFields}<Box sx={{ mt: 3 }}><MarcheConventionCard marcheId={marcheId} /></Box><Box sx={{ mt: 3 }}><MarcheInfoCard marcheId={marcheId} /></Box><Box sx={{ mt: 3 }}><MarcheOrdresServiceSection marcheId={marcheId} /></Box></Box>) },
              ]} />
            </Box>
          </Panel>

          <Panel title="Historique">
            <Chatter
              entityType="marche" entityId={marcheId}
              activities={chatterActivities} loading={chatterLoading}
              onRefresh={refreshChatter}
            />
          </Panel>
        </Box>

        <Box sx={{ minWidth: 0, position: { lg: 'sticky' }, top: { lg: 'calc(var(--app-header-h, 0px) + 20px)' } }}>
          <MarcheMontantsPanel marcheId={marcheId} montantHt={marche.montantHt} montantTva={marche.montantTva} montantTtc={marche.montantTtc} />
        </Box>
      </Box>
      {dialogField && (
        <EditFieldDialog
          open
          onClose={() => setDialogField(null)}
          onSave={handleDialogSave}
          fieldKey={dialogField.key}
          fieldLabel={dialogField.label}
          currentValue={dialogField.value}
          mode={dialogField.mode}
        />
      )}
    </AppLayout>
  )
}

export default MarcheDetailPageModern

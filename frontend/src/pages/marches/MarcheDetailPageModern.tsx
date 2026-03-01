import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Alert, Skeleton, Typography, Button, Container } from '@mui/material'
import { CalendarMonth } from '@mui/icons-material'
import { ArrowLeft } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import {
  ControlPanel, FormView, FieldGroup, Notebook, StatusBadge,
  InlineEditField, EditFieldDialog,
  type StatusStep, type InlineEditFieldConfig,
} from '@/components/core'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { marchesAPI, conventionsAPI, fournisseursAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
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
  { value: 'VALIDE', label: 'Valide' }, { value: 'TERMINE', label: 'Termine' },
]
const STATUT_OPTIONS = STATUS_STEPS.map(s => ({ value: s.value, label: s.label }))

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

// ==================== COMPONENT ====================

const MarcheDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [marche, setMarche] = useState<MarcheData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conventions, setConventions] = useState<ConventionRef[]>([])
  const [fournisseurs, setFournisseurs] = useState<FournisseurRef[]>([])
  const [dialogField, setDialogField] = useState<DialogFieldState | null>(null)
  const marcheId = id ? parseInt(id) : 0

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

  // --- Render guards ---
  if (!id) return <AppLayout><Box sx={{ p: 4 }}><Alert severity="error">ID du marche manquant</Alert></Box></AppLayout>

  if (loading) return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 3, py: 1.5 }}>
          <Skeleton variant="text" width={300} height={32} />
        </Box>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Container>
      </Box>
    </AppLayout>
  )

  if (error || !marche) return (
    <AppLayout><Container maxWidth="xl" sx={{ py: 4 }}>
      <Alert severity="error" sx={{ mb: 2 }}>{error || 'Marche non trouve'}</Alert>
      <Button onClick={() => navigate('/marches')} sx={componentStyles.buttonSecondary}>Retour aux marches</Button>
    </Container></AppLayout>
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
      { value: 'ANNULE', label: 'Annule', variant: 'danger' as const },
    ]
    return STATUS_STEPS
  })()

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <ControlPanel
          breadcrumbs={[
            { label: 'Marches', path: '/marches' },
            { label: marche.numeroMarche || `#${marche.id}` },
          ]}
          actions={
            <Button size="small" startIcon={<ArrowLeft size={14} />} onClick={() => navigate('/marches')}
              sx={{ ...componentStyles.buttonGhost, textTransform: 'none', fontSize: typography.sizes.sm }}>
              Liste
            </Button>
          }
          hideBottomRow
        />

        <Container maxWidth="xl" sx={{ py: 2 }}>
          <FormView isEditing={false} statusSteps={effectiveSteps} currentStatus={marche.statut}>

            {/* Title + Description + Metadata (Odoo-style) */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary, mb: 0.5 }}>
                <RichTextDisplay html={marche.objet || marche.numeroMarche} variant="compact" allowExpand={false} />
              </Box>

              {/* Metadata bar with separators */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, py: 0.75, borderTop: `1px solid ${colors.borderSubtle}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>N:</Typography>
                  <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{marche.numeroMarche}</Typography>
                </Box>
                {marche.numAo && (
                  <>
                    <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>AO:</Typography>
                      <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{marche.numAo}</Typography>
                    </Box>
                  </>
                )}
                <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
                {marche.typeMarche && <StatusBadge status={marche.typeMarche} size="small" />}
                {(marche.naturePrestation || marche.natureMarche) && (
                  <>
                    <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
                    <StatusBadge status={marche.naturePrestation || marche.natureMarche || ''} size="small" />
                  </>
                )}
                {(marche.dateSignature || marche.dateMarche) && (
                  <>
                    <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarMonth sx={{ fontSize: 13, color: colors.textSecondary }} />
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                        {new Date(marche.dateSignature || marche.dateMarche).toLocaleDateString('fr-FR')}
                        {marche.dateDebut && ` — ${new Date(marche.dateDebut).toLocaleDateString('fr-FR')}`}
                        {marche.dateFinPrevue && ` → ${new Date(marche.dateFinPrevue).toLocaleDateString('fr-FR')}`}
                      </Typography>
                    </Box>
                  </>
                )}
                {marche.fournisseurNom && (
                  <>
                    <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Fournisseur:</Typography>
                      <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{marche.fournisseurNom}</Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            {/* Smart Buttons - Odoo style (entity counts) */}
            <Box sx={{ mb: 2 }}>
              <MarcheSmartButtons
                marcheId={marcheId}
                nombreLignes={marche.nbLignes ?? 0}
                nombreDecomptes={marche.nbDecomptes ?? 0}
                nombrePaiements={marche.nbPaiements ?? 0}
                nombreAvenants={marche.nbAvenants ?? 0}
                montantTtc={marche.montantTtc ?? 0}
                montantPaye={marche.montantPaye ?? 0}
                fournisseurNom={marche.fournisseurNom ?? undefined}
              />
            </Box>

            {/* Inline-editable fields */}
            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Informations generales" columns={3}>
                {field({ fieldKey: 'numeroMarche', label: 'Numero', type: 'text', value: marche.numeroMarche, editable: false })}
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
              <FieldGroup title="Dates et delais" columns={3}>
                {field({ fieldKey: 'dateSignature', label: 'Date signature', type: 'date', value: marche.dateSignature || '', editable: canEdit })}
                {field({ fieldKey: 'dateMarche', label: 'Date marche', type: 'date', value: marche.dateMarche || '', editable: canEdit })}
                {field({ fieldKey: 'dateDebut', label: 'Date debut', type: 'date', value: marche.dateDebut || '', editable: canEdit })}
                {field({ fieldKey: 'dateFinPrevue', label: 'Date fin prevue', type: 'date', value: marche.dateFinPrevue || '', editable: canEdit })}
                {field({ fieldKey: 'delaiExecution', label: 'Delai execution (mois)', type: 'number', value: marche.delaiExecution ?? 0, displayValue: marche.delaiExecution != null ? `${marche.delaiExecution} mois` : '-', editable: canEdit })}
                {field({ fieldKey: 'retenueGarantie', label: 'Retenue garantie (%)', type: 'number', value: marche.retenueGarantie ?? 0, displayValue: marche.retenueGarantie != null ? `${marche.retenueGarantie}%` : '-', editable: canEdit })}
              </FieldGroup>
              <FieldGroup title="Notes">
                {field({ fieldKey: 'remarques', label: 'Remarques', type: 'richtext', value: marche.remarques || '', displayValue: marche.remarques || '-', editable: canEdit, fullWidth: true })}
              </FieldGroup>
            </Box>

            {/* Notebook tabs - each tab loads data independently */}
            <Box sx={{ mt: 3 }}>
              <Notebook tabs={[
                { label: 'Detail', content: (<Box><MarcheConventionCard marcheId={marcheId} /><Box sx={{ mt: 3 }}><MarcheInfoCard marcheId={marcheId} /></Box><Box sx={{ mt: 3 }}><MarcheOrdresServiceSection marcheId={marcheId} /></Box></Box>) },
                { label: 'Lignes', content: <MarcheLignesSection marcheId={marcheId} /> },
                { label: 'Situation Paiement', content: (<Box><MarcheSituationPaiementCard marcheId={marcheId} /><Box sx={{ mt: 3 }}><MarcheDecomptesSection marcheId={marcheId} /></Box><Box sx={{ mt: 3 }}><MarchePaiementsSection marcheId={marcheId} /></Box></Box>) },
                { label: 'Avenants', content: <MarcheAvenantsSection marcheId={marcheId} /> },
              ]} />
            </Box>
          </FormView>
        </Container>
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

import { useState, useEffect, useCallback, ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Alert, Skeleton, Typography, Button, Container, Tooltip, TextField, MenuItem } from '@mui/material'
import { Lock, CalendarMonth } from '@mui/icons-material'
import { Pencil, ArrowLeft } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, FormView, FieldGroup, Field, Notebook, StatusBadge, type StatusStep } from '@/components/core'
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

interface MarcheEditData {
  objet: string; statut: string; typeMarche: string; natureMarche: string
  montantHt: number; tauxTva: number; montantTtc: number
  conventionId: number | null; fournisseurId: number | null
  dateMarche: string; dateDebut: string; dateFinPrevue: string
  delaiExecution: number | null; retenueGarantie: number; remarques: string
}

interface ConventionRef { id: number; code: string; objet: string }
interface FournisseurRef { id: number; code: string; raisonSociale: string }

const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' }, { value: 'EN_COURS', label: 'En cours' },
  { value: 'VALIDE', label: 'Valide' }, { value: 'TERMINE', label: 'Termine' },
]
const STATUT_OPTIONS = STATUS_STEPS.map(s => ({ value: s.value, label: s.label }))

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const buildEditData = (m: MarcheData): MarcheEditData => ({
  objet: m.objet || '', statut: m.statut || 'BROUILLON',
  typeMarche: m.typeMarche || '', natureMarche: m.natureMarche || '',
  montantHt: m.montantHt || 0, tauxTva: m.tauxTva || 20, montantTtc: m.montantTtc || 0,
  conventionId: m.conventionId, fournisseurId: m.fournisseurId,
  dateMarche: m.dateMarche || '', dateDebut: m.dateDebut || '', dateFinPrevue: m.dateFinPrevue || '',
  delaiExecution: m.delaiExecution, retenueGarantie: m.retenueGarantie || 0, remarques: m.remarques || '',
})

// ==================== COMPONENT ====================

const MarcheDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [marche, setMarche] = useState<MarcheData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState<MarcheEditData | null>(null)
  const [conventions, setConventions] = useState<ConventionRef[]>([])
  const [fournisseurs, setFournisseurs] = useState<FournisseurRef[]>([])
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

  const loadReferenceData = async () => {
    try {
      const [convRes, fournRes] = await Promise.all([conventionsAPI.getAll(), fournisseursAPI.getAll()])
      const convArr = convRes.data?.data || convRes.data || []
      setConventions(Array.isArray(convArr) ? convArr.map((c: ConventionRef) => ({ id: c.id, code: c.code, objet: c.objet })) : [])
      const fournArr = fournRes.data?.data || fournRes.data || []
      setFournisseurs(Array.isArray(fournArr) ? fournArr.map((f: FournisseurRef) => ({ id: f.id, code: f.code, raisonSociale: f.raisonSociale })) : [])
    } catch { showToast('Erreur chargement des donnees de reference', 'error') }
  }

  const handleToggleEdit = async () => {
    if (!marche) return
    setEditData(buildEditData(marche))
    await loadReferenceData()
    setIsEditing(true)
  }
  const handleCancel = () => { setIsEditing(false); setEditData(null) }

  const handleSave = async () => {
    if (!editData || !marche) return
    try {
      setIsSaving(true)
      await marchesAPI.update(marche.id, {
        numeroMarche: marche.numeroMarche, objet: editData.objet, statut: editData.statut,
        typeMarche: editData.typeMarche || null, natureMarche: editData.natureMarche || null,
        montantHt: editData.montantHt, tauxTva: editData.tauxTva, montantTtc: editData.montantTtc,
        conventionId: editData.conventionId, fournisseurId: editData.fournisseurId,
        dateMarche: editData.dateMarche || null, dateDebut: editData.dateDebut || null,
        dateFinPrevue: editData.dateFinPrevue || null, delaiExecutionMois: editData.delaiExecution,
        retenueGarantie: editData.retenueGarantie, remarques: editData.remarques || null,
      })
      showToast('Marche mis a jour avec succes', 'success')
      setIsEditing(false); setEditData(null)
      await loadMarche(marche.id)
    } catch { showToast('Erreur lors de la sauvegarde', 'error') }
    finally { setIsSaving(false) }
  }

  const updateField = <K extends keyof MarcheEditData>(field: K, value: MarcheEditData[K]) => {
    setEditData(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const textInput = (field: keyof MarcheEditData, type = 'text', opts?: { multiline?: boolean; disabled?: boolean }): ReactNode => {
    if (!editData) return null
    return (
      <TextField size="small" fullWidth type={type} disabled={opts?.disabled}
        multiline={opts?.multiline} rows={opts?.multiline ? 3 : undefined}
        value={editData[field] ?? ''} onChange={e => {
          const v = e.target.value
          if (type === 'number') updateField(field, (v === '' ? 0 : Number(v)) as MarcheEditData[typeof field])
          else updateField(field, v as MarcheEditData[typeof field])
        }} />
    )
  }

  const selectInput = (field: keyof MarcheEditData, options: { value: string; label: string }[]): ReactNode => {
    if (!editData) return null
    return (
      <TextField select size="small" fullWidth value={editData[field] ?? ''}
        onChange={e => updateField(field, e.target.value as MarcheEditData[typeof field])}>
        {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
      </TextField>
    )
  }

  const refSelect = (field: 'conventionId' | 'fournisseurId', items: { id: number; label: string }[], empty: string): ReactNode => {
    if (!editData) return null
    return (
      <TextField select size="small" fullWidth value={editData[field] ?? ''}
        onChange={e => updateField(field, e.target.value ? Number(e.target.value) : null)}>
        <MenuItem value="">{empty}</MenuItem>
        {items.map(i => <MenuItem key={i.id} value={i.id}>{i.label}</MenuItem>)}
      </TextField>
    )
  }

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

  const canEdit = marche.statut === 'BROUILLON' || marche.statut === 'EN_COURS'
  const ed = isEditing && editData !== null
  const convItems = conventions.map(c => ({ id: c.id, label: `${c.code} - ${c.objet}` }))
  const fournItems = fournisseurs.map(f => ({ id: f.id, label: `${f.code} - ${f.raisonSociale}` }))

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
            <>
              <Tooltip title={!canEdit ? 'Statut ne permet pas la modification' : 'Modifier'}>
                <span>
                  <Button
                    variant="outlined" size="small" disabled={!canEdit}
                    onClick={() => navigate(`/marches/${id}/modifier`)}
                    sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}
                  >
                    {canEdit
                      ? <Pencil size={14} style={{ marginRight: 4 }} />
                      : <Lock sx={{ fontSize: 14, mr: 0.5 }} />
                    }
                    Modifier
                  </Button>
                </span>
              </Tooltip>
              <Button size="small" startIcon={<ArrowLeft size={14} />} onClick={() => navigate('/marches')}
                sx={{ ...componentStyles.buttonGhost, textTransform: 'none', fontSize: typography.sizes.sm }}>
                Liste
              </Button>
            </>
          }
          hideBottomRow
        />

        <Container maxWidth="xl" sx={{ py: 2 }}>
          <FormView isEditing={ed} onToggleEdit={canEdit ? handleToggleEdit : undefined}
            onSave={handleSave} onCancel={handleCancel} isSaving={isSaving}
            statusSteps={effectiveSteps} currentStatus={marche.statut}>

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
                <Field label="Numero" value={marche.numeroMarche} isEditing={ed}
                  editContent={<TextField size="small" fullWidth value={marche.numeroMarche} disabled />} />
                <Field label="Objet" value={marche.objet || '-'} isEditing={ed} editContent={textInput('objet')} fullWidth required />
                <Field label="Statut" value={<StatusBadge status={marche.statut} />} isEditing={ed}
                  editContent={selectInput('statut', STATUT_OPTIONS)} />
                <Field label="Type" value={marche.typeMarche || '-'} isEditing={ed} editContent={textInput('typeMarche')} />
                <Field label="Nature" value={marche.natureMarche || '-'} isEditing={ed} editContent={textInput('natureMarche')} />
                <Field label="Convention" value={marche.conventionCode || '-'}
                  isLink={!!marche.conventionId} onLinkClick={() => marche.conventionId && navigate(`/conventions/${marche.conventionId}`)}
                  isEditing={ed} editContent={refSelect('conventionId', convItems, '-- Aucune --')} />
                <Field label="Fournisseur" value={marche.fournisseurNom || '-'} isEditing={ed}
                  editContent={refSelect('fournisseurId', fournItems, '-- Aucun --')} />
              </FieldGroup>
              <FieldGroup title="Montants" columns={3}>
                <Field label="Montant HT" value={marche.montantHt ? formatCurrency(marche.montantHt) : '-'} isMoney
                  isEditing={ed} editContent={textInput('montantHt', 'number')} />
                <Field label="Taux TVA (%)" value={marche.tauxTva != null ? `${marche.tauxTva}%` : '-'}
                  isEditing={ed} editContent={textInput('tauxTva', 'number')} />
                <Field label="Montant TTC" value={marche.montantTtc ? formatCurrency(marche.montantTtc) : '-'} isMoney
                  isEditing={ed} editContent={textInput('montantTtc', 'number')} />
              </FieldGroup>
              <FieldGroup title="Dates et delais" columns={3}>
                <Field label="Date marche" value={marche.dateMarche || '-'} isEditing={ed} editContent={textInput('dateMarche', 'date')} />
                <Field label="Date debut" value={marche.dateDebut || '-'} isEditing={ed} editContent={textInput('dateDebut', 'date')} />
                <Field label="Date fin prevue" value={marche.dateFinPrevue || '-'} isEditing={ed} editContent={textInput('dateFinPrevue', 'date')} />
                <Field label="Delai execution (mois)" value={marche.delaiExecution != null ? `${marche.delaiExecution} mois` : '-'}
                  isEditing={ed} editContent={textInput('delaiExecution', 'number')} />
                <Field label="Retenue garantie (%)" value={marche.retenueGarantie != null ? `${marche.retenueGarantie}%` : '-'}
                  isEditing={ed} editContent={textInput('retenueGarantie', 'number')} />
              </FieldGroup>
              <FieldGroup title="Notes">
                <Field label="Remarques" value={marche.remarques || '-'} fullWidth isEditing={ed}
                  editContent={textInput('remarques', 'text', { multiline: true })} />
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
    </AppLayout>
  )
}

export default MarcheDetailPageModern

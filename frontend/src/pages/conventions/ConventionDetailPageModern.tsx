import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Alert,
  Skeleton,
  Tooltip,
  Divider,
} from '@mui/material'
import {
  Edit,
  Add,
  Lock,
} from '@mui/icons-material'
import { Plus, Pencil, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import AppLayout from '../../components/layout/AppLayout'
import {
  ConfirmDialog,
  StatusBadge,
  ControlPanel,
  FormView,
  FieldGroup,
  Field,
  Notebook,
  InlineTable,
} from '../../components/core'
import type { StatusStep } from '../../components/core'
import { api, conventionsAPI, avenantConventionsAPI, versementsPrevisionnelsAPI, projetConventionsAPI } from '../../lib/api'
import {
  ConventionInfoCardLazy,
  ConventionFinancesCard,
  ConventionStatsCard,
  ConventionSousConventionsCard,
  ConventionAvenantsTab,
  ConventionHistoryCard,
  ConventionPartenairesCard,
  ConventionSubventionsCard,
  ConventionImputationsCard,
  ConventionWorkflowActions,
  ConventionVersementsCard,
  ConventionProjetsTab,
  ConventionMarchesTab,
  ParentConventionBanner,
} from '../../components/conventions/detail'
import { colors, typography, componentStyles } from '../../lib/designSystem'
import RichTextDisplay from '../../components/ui/RichTextDisplay'
import BudgetRepartitionCard from '../../components/conventions/BudgetRepartitionCard'
import AddPartenaireDialog from '../../components/conventions/AddPartenaireDialog'
import LinkProjetDialog from '../../components/conventions/LinkProjetDialog'
import LinkMarcheDialog from '../../components/conventions/LinkMarcheDialog'
import SousConventionFormSimple from './SousConventionFormSimple'
import VersementFormDialog from '../../components/conventions/VersementFormDialog'

interface Convention {
  id: number; code: string; numero: string; libelle: string; objet: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'; statut: string
  tauxCommission: number; baseCalcul: string; budget: number
  dateSignature: string; dateDebut: string; dateFin?: string; tauxTva: number
  parentConventionId?: number | null; parentConventionNumero?: string | null
  heriteParametres?: boolean
}

interface SousConvention { id: number; code: string; numero: string; libelle: string; statut: string; budget: number; dateDebut: string }
interface Avenant { id: number; numeroAvenant: string; dateAvenant: string; statut: string; objet: string; type: string }
interface Projet { id: number; code: string; designation: string; budgetTotal: number; statut: string }
interface Marche { id: number; numeroMarche: string; objet: string; montantTtc: number; statut: string; fournisseurNom?: string }
interface VersementPrevisionnel { id: number; partenaireId?: number; partenaireNom?: string; partenaireSigle?: string; volet?: string; dateVersement: string; montant: number; montantPrevu?: number; remarques?: string }
interface ProjetConventionAssociation { projetId: number; projetCode: string; projetNom: string; projetBudgetTotal: number; projetStatut: string }

const getStatusColor = (statut: string | undefined): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  if (!statut) return 'default'
  const map: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    BROUILLON: 'default', SOUMIS: 'info', VALIDEE: 'success', VALIDE: 'success',
    EN_COURS: 'primary', EN_EXECUTION: 'primary', ACHEVE: 'secondary', TERMINE: 'secondary',
    REJETE: 'error', ANNULE: 'error',
  }
  return map[statut.toUpperCase()] || 'default'
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)
const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

// Status pipeline steps for conventions
const STATUS_STEPS: StatusStep[] = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDEE', label: 'Validee' },
  { value: 'EN_EXECUTION', label: 'En execution' },
  { value: 'ACHEVE', label: 'Acheve' },
]

const ConventionDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin, isManager } = useAuth()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [convention, setConvention] = useState<Convention | null>(null)
  const [avenants, setAvenants] = useState<Avenant[]>([])
  const [sousConventions, setSousConventions] = useState<SousConvention[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [marches, setMarches] = useState<Marche[]>([])
  const [versements, setVersements] = useState<VersementPrevisionnel[]>([])
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [addPartenaireDialogOpen, setAddPartenaireDialogOpen] = useState(false)
  const [editPartenaireData, setEditPartenaireData] = useState<{ id: number; partenaireId: number; partenaireNom: string; budgetAlloue: number; pourcentage: number; estMaitreOeuvre: boolean; estMaitreOeuvreDelegue: boolean; remarques?: string } | null>(null)
  const [linkProjetDialogOpen, setLinkProjetDialogOpen] = useState(false)
  const [linkMarcheDialogOpen, setLinkMarcheDialogOpen] = useState(false)
  const [partenairesRefreshKey, setPartenairesRefreshKey] = useState(0)
  const [sousConventionDialogOpen, setSousConventionDialogOpen] = useState(false)
  const [editingSousConvention, setEditingSousConvention] = useState<SousConvention | null>(null)
  const [versementDialogOpen, setVersementDialogOpen] = useState(false)
  const [editingVersement, setEditingVersement] = useState<VersementPrevisionnel | null>(null)
  const [confirmState, setConfirmState] = useState<{ open: boolean; type: 'unlinkProjet' | 'unlinkMarche' | 'deleteVersement' | null; id: number | null }>({ open: false, type: null, id: null })

  const tabsRef = useRef<HTMLDivElement>(null)

  const handleStatClick = (statType: 'projets' | 'marches' | 'sousConventions') => {
    setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  // Data loading
  useEffect(() => { if (id) loadConvention(parseInt(id)) }, [id])

  const loadConvention = async (cid: number) => {
    try {
      setLoading(true)
      const res = await conventionsAPI.getById(cid)
      setConvention(res.data.data || res.data)
      Promise.all([loadAvenants(cid), loadSousConventions(cid), loadProjets(cid), loadMarches(cid), loadVersements(cid)])
    } catch { setError('Erreur lors du chargement de la convention') }
    finally { setLoading(false) }
  }

  const loadAvenants = async (cid: number) => { try { const r = await avenantConventionsAPI.getByConvention(cid); setAvenants(r.data.data || r.data || []) } catch { setAvenants([]) } }
  const loadSousConventions = async (cid: number) => { try { const r = await conventionsAPI.getSousConventions(cid); setSousConventions(r.data.data || []) } catch { /* ignored */ } }
  const loadProjets = async (cid: number) => {
    try {
      const r = await projetConventionsAPI.getByConvention(cid)
      const associations: ProjetConventionAssociation[] = r.data.data || r.data || []
      setProjets(associations.map((a: ProjetConventionAssociation) => ({ id: a.projetId, code: a.projetCode, designation: a.projetNom, budgetTotal: a.projetBudgetTotal, statut: a.projetStatut })))
    } catch { setProjets([]) }
  }
  const loadMarches = async (cid: number) => { try { const r = await api.get(`/marches/convention/${cid}`); setMarches(r.data.data || r.data || []) } catch { setMarches([]) } }
  const loadVersements = async (cid: number) => { try { const r = await versementsPrevisionnelsAPI.getByConvention(cid); setVersements(r.data.data || r.data || []) } catch { setVersements([]) } }

  const handleUnlinkProjet = (projetId: number) => { if (convention) setConfirmState({ open: true, type: 'unlinkProjet', id: projetId }) }
  const handleUnlinkMarche = (marcheId: number) => { if (convention) setConfirmState({ open: true, type: 'unlinkMarche', id: marcheId }) }
  const handleDeleteVersement = (versementId: number) => { if (convention) setConfirmState({ open: true, type: 'deleteVersement', id: versementId }) }

  const handleConfirmAction = async () => {
    if (!convention || !confirmState.id || !confirmState.type) return
    try {
      switch (confirmState.type) {
        case 'unlinkProjet': await conventionsAPI.unlinkProjet(confirmState.id, convention.id); showSuccess('Projet delie'); loadProjets(convention.id); break
        case 'unlinkMarche': await conventionsAPI.unlinkMarche(convention.id, confirmState.id); showSuccess('Marche delie'); loadMarches(convention.id); break
        case 'deleteVersement': await versementsPrevisionnelsAPI.delete(confirmState.id); showSuccess('Versement supprime'); loadVersements(convention.id); break
      }
    } catch { showError('Erreur lors de l\'operation') }
    finally { setConfirmState({ open: false, type: null, id: null }) }
  }

  const getConfirmDialogProps = () => {
    switch (confirmState.type) {
      case 'unlinkProjet': return { title: 'Delier le projet', message: 'Voulez-vous delier ce projet ?', variant: 'warning' as const, confirmLabel: 'Delier' }
      case 'unlinkMarche': return { title: 'Delier le marche', message: 'Voulez-vous delier ce marche ?', variant: 'warning' as const, confirmLabel: 'Delier' }
      case 'deleteVersement': return { title: 'Supprimer le versement', message: 'Action irreversible. Continuer ?', variant: 'danger' as const, confirmLabel: 'Supprimer' }
      default: return { title: '', message: '', variant: 'info' as const, confirmLabel: 'Confirmer' }
    }
  }

  useEffect(() => { if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t) } }, [error])

  if (loading) return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 3, py: 1.5 }}>
          <Skeleton variant="text" width={300} height={32} />
        </Box>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
          </Box>
        </Container>
      </Box>
    </AppLayout>
  )

  if (!convention) return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Convention non trouvee'}</Alert>
      </Container>
    </AppLayout>
  )

  const canEdit = convention.statut === 'BROUILLON'

  // Build breadcrumbs - always show full navigation path
  const breadcrumbs = [
    { label: 'Conventions', path: '/conventions' },
    ...(convention.parentConventionId && convention.parentConventionNumero
      ? [{ label: convention.parentConventionNumero, path: `/conventions/${convention.parentConventionId}` }]
      : []),
    { label: convention.code },
  ]

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        {/* Control Panel - Always visible breadcrumbs + actions */}
        <ControlPanel
          breadcrumbs={breadcrumbs}
          actions={
            <>
              <ConventionWorkflowActions
                conventionId={convention.id}
                statut={convention.statut}
                userId={user?.id}
                isAdmin={isAdmin}
                isManager={isManager}
                onSuccess={(msg: string) => showSuccess(msg)}
                onError={(msg: string) => showError(msg)}
                onReload={() => loadConvention(convention.id)}
              />
              <Tooltip title="Ajouter un avenant">
                <Button variant="outlined" size="small" onClick={() => navigate(`/conventions/${id}/avenants/nouveau`)}
                  sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}>
                  <Plus size={14} style={{ marginRight: 4 }} /> Avenant
                </Button>
              </Tooltip>
              {convention.typeConvention === 'CADRE' && (
                <Button variant="outlined" size="small" onClick={() => { setEditingSousConvention(null); setSousConventionDialogOpen(true) }}
                  sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}>
                  <Plus size={14} style={{ marginRight: 4 }} /> Sous-conv.
                </Button>
              )}
              <Tooltip title={!canEdit ? 'Statut BROUILLON requis' : 'Modifier'}>
                <span>
                  <Button variant="outlined" size="small" disabled={!canEdit} onClick={() => navigate(`/conventions/${id}/edit`)}
                    sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.5 }}>
                    {canEdit ? <Pencil size={14} style={{ marginRight: 4 }} /> : <Lock sx={{ fontSize: 14, mr: 0.5 }} />}
                    Modifier
                  </Button>
                </span>
              </Tooltip>
            </>
          }
          hideBottomRow
        />

        {/* Messages */}
        {error && (
          <Container maxWidth="xl" sx={{ mt: 2 }}>
            <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
          </Container>
        )}

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Form View - with status pipeline */}
          <FormView
            isEditing={false}
            onToggleEdit={canEdit ? () => navigate(`/conventions/${id}/edit`) : undefined}
            statusSteps={STATUS_STEPS}
            currentStatus={convention.statut}
          >
            {/* Title */}
            <Typography sx={{
              fontSize: typography.sizes['2xl'],
              fontWeight: typography.weights.bold,
              color: colors.textPrimary,
              mb: 0.5,
            }}>
              {convention.libelle || convention.code}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3 }}>
              {convention.objet}
            </Typography>

            {/* Parent Convention Banner */}
            {convention.parentConventionId && convention.parentConventionNumero && (
              <Box sx={{ mb: 3 }}>
                <ParentConventionBanner
                  parentConventionId={convention.parentConventionId}
                  parentConventionNumero={convention.parentConventionNumero}
                  heriteParametres={convention.heriteParametres ?? false}
                />
              </Box>
            )}

            {/* Field Groups */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <FieldGroup title="Informations generales">
                <Field label="Code" value={convention.code} />
                <Field label="Numero" value={convention.numero} />
                <Field label="Type" value={<StatusBadge status={convention.typeConvention} />} />
                <Field label="Statut" value={<StatusBadge status={convention.statut} />} />
                {convention.parentConventionId && convention.parentConventionNumero && (
                  <Field
                    label="Convention parent"
                    value={convention.parentConventionNumero}
                    isLink
                    onLinkClick={() => navigate(`/conventions/${convention.parentConventionId}`)}
                  />
                )}
              </FieldGroup>

              <FieldGroup title="Finances">
                <Field label="Budget" value={formatCurrency(convention.budget)} isMoney />
                <Field label="Taux commission" value={`${convention.tauxCommission}%`} />
                <Field label="Base de calcul" value={convention.baseCalcul} />
                <Field label="TVA" value={`${convention.tauxTva}%`} />
              </FieldGroup>
            </Box>

            <FieldGroup title="Dates" columns={1}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 0 }}>
                <Field label="Date signature" value={convention.dateSignature ? formatDate(convention.dateSignature) : '-'} />
                <Field label="Date debut" value={convention.dateDebut ? formatDate(convention.dateDebut) : '-'} />
                <Field label="Date fin" value={convention.dateFin ? formatDate(convention.dateFin) : '-'} />
              </Box>
            </FieldGroup>

            {/* Micro-component cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3, mb: 3 }}>
              <ConventionInfoCardLazy conventionId={convention.id} canEdit={canEdit} getStatusColor={getStatusColor} />
              <ConventionFinancesCard conventionId={convention.id} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <BudgetRepartitionCard conventionId={convention.id} conventionBudget={convention.budget} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <ConventionStatsCard conventionId={convention.id} onStatClick={handleStatClick} />
            </Box>

            {/* Notebook (tabs) */}
            <Box ref={tabsRef}>
              <Notebook
                tabs={[
                  {
                    label: 'Detail',
                    content: (
                      <Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                          <ConventionPartenairesCard
                            key={partenairesRefreshKey}
                            conventionId={convention.id}
                            parentConventionId={convention.parentConventionId ?? undefined}
                            onAddClick={() => setAddPartenaireDialogOpen(true)}
                            onEditClick={(p) => {
                              setEditPartenaireData({ id: p.id, partenaireId: p.partenaireId, partenaireNom: p.partenaireNom, budgetAlloue: p.budgetAlloue, pourcentage: p.pourcentage, estMaitreOeuvre: p.estMaitreOeuvre, estMaitreOeuvreDelegue: p.estMaitreOeuvreDelegue, remarques: p.remarques || undefined })
                              setAddPartenaireDialogOpen(true)
                            }}
                          />
                          <ConventionSubventionsCard conventionId={convention.id} />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <ConventionImputationsCard conventionId={convention.id} onRefresh={() => loadConvention(convention.id)} />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <ConventionVersementsCard versements={versements} onAdd={() => { setEditingVersement(null); setVersementDialogOpen(true) }} onEdit={(v) => { setEditingVersement(v); setVersementDialogOpen(true) }} onDelete={handleDeleteVersement} />
                        </Box>
                      </Box>
                    ),
                  },
                  {
                    label: 'Sous-conventions',
                    count: sousConventions.length,
                    content: (
                      <Box>
                        <InlineTable
                          headers={[
                            { label: 'Code', width: '20%' },
                            { label: 'Libelle' },
                            { label: 'Statut', width: 120 },
                            { label: 'Budget', width: 150, align: 'right' },
                            { label: 'Actions', width: 100, align: 'center' },
                          ]}
                          rows={sousConventions.map(sc => [
                            <Typography sx={{ color: colors.primary[600], fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>{sc.code}</Typography>,
                            <Typography sx={{ fontSize: typography.sizes.sm }}>{sc.libelle}</Typography>,
                            <StatusBadge status={sc.statut} size="small" />,
                            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(sc.budget)}</Typography>,
                            sc.statut === 'BROUILLON' ? (
                              <Button size="small" onClick={(e) => { e.stopPropagation(); setEditingSousConvention(sc); setSousConventionDialogOpen(true) }}
                                sx={{ textTransform: 'none', fontSize: typography.sizes.xs, color: colors.primary[600], minWidth: 0 }}>
                                Modifier
                              </Button>
                            ) : null,
                          ])}
                          onRowClick={(idx) => navigate(`/conventions/${sousConventions[idx].id}`)}
                          emptyMessage="Aucune sous-convention"
                          showAddLine={convention.typeConvention === 'CADRE'}
                          onAddLine={() => { setEditingSousConvention(null); setSousConventionDialogOpen(true) }}
                        />
                      </Box>
                    ),
                  },
                  {
                    label: 'Avenants',
                    count: avenants.length,
                    content: (
                      <ConventionAvenantsTab convention={convention} avenants={avenants} formatCurrency={formatCurrency} formatDate={formatDate} getStatusColor={getStatusColor} />
                    ),
                  },
                  {
                    label: 'Projets',
                    count: projets.length,
                    content: (
                      <ConventionProjetsTab projets={projets} onLinkProjet={() => setLinkProjetDialogOpen(true)} onUnlinkProjet={handleUnlinkProjet} />
                    ),
                  },
                  {
                    label: 'Marches',
                    count: marches.length,
                    content: (
                      <ConventionMarchesTab marches={marches} onLinkMarche={() => setLinkMarcheDialogOpen(true)} onUnlinkMarche={handleUnlinkMarche} />
                    ),
                  },
                ]}
              />
            </Box>
          </FormView>
        </Container>
      </Box>

      {/* Dialogs */}
      {convention && (
        <>
          <AddPartenaireDialog open={addPartenaireDialogOpen} conventionId={convention.id} conventionBudget={convention.budget} onClose={() => { setAddPartenaireDialogOpen(false); setEditPartenaireData(null) }} onSuccess={() => { setPartenairesRefreshKey((k: number) => k + 1); setEditPartenaireData(null) }} editData={editPartenaireData} />
          <LinkProjetDialog open={linkProjetDialogOpen} conventionId={convention.id} onClose={() => setLinkProjetDialogOpen(false)} onSuccess={() => loadProjets(convention.id)} />
          <LinkMarcheDialog open={linkMarcheDialogOpen} conventionId={convention.id} onClose={() => setLinkMarcheDialogOpen(false)} onSuccess={() => loadMarches(convention.id)} />
          <SousConventionFormSimple open={sousConventionDialogOpen} onClose={() => { setSousConventionDialogOpen(false); setEditingSousConvention(null) }} onSuccess={() => { loadSousConventions(convention.id); setSousConventionDialogOpen(false); setEditingSousConvention(null) }} parentConvention={{ id: convention.id, numero: convention.numero, libelle: convention.libelle, tauxCommission: convention.tauxCommission, baseCalcul: convention.baseCalcul, tauxTva: convention.tauxTva, budget: convention.budget }} editingSousConvention={editingSousConvention} />
          <VersementFormDialog open={versementDialogOpen} conventionId={convention.id} onClose={() => { setVersementDialogOpen(false); setEditingVersement(null) }} onSuccess={() => { loadVersements(convention.id); setVersementDialogOpen(false); setEditingVersement(null) }} editingVersement={editingVersement} />
        </>
      )}

      <ConfirmDialog
        open={confirmState.open}
        {...getConfirmDialogProps()}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState({ open: false, type: null, id: null })}
      />
    </AppLayout>
  )
}

export default ConventionDetailPageModern

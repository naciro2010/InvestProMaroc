import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Alert,
  Skeleton,
  Tooltip,
  Divider,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Add,
  Description,
  Assignment,
  History,
  AccountBalance,
  Business,
  Lock,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import AppLayout from '../../components/layout/AppLayout'
import ConfirmDialog from '../../components/core/ConfirmDialog'
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
} from '../../components/conventions/detail'
import { colors, typography, componentStyles } from '../../lib/designSystem'
import StatusBadge from '../../components/core/StatusBadge'
import BudgetRepartitionCard from '../../components/conventions/BudgetRepartitionCard'
import AddPartenaireDialog from '../../components/conventions/AddPartenaireDialog'
import LinkProjetDialog from '../../components/conventions/LinkProjetDialog'
import LinkMarcheDialog from '../../components/conventions/LinkMarcheDialog'
import SousConventionFormSimple from './SousConventionFormSimple'
import VersementFormDialog from '../../components/conventions/VersementFormDialog'

interface Convention {
  id: number; code: string; numero: string; libelle: string; objet: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'; statut: string
  tauxCommission: number; baseCalcul: string; montant: number
  dateSignature: string; dateDebut: string; dateFin?: string; tauxTva: number
}

interface SousConvention { id: number; code: string; numero: string; libelle: string; statut: string; montant: number; dateDebut: string }
interface Avenant { id: number; numeroAvenant: string; dateAvenant: string; statut: string; objet: string; type: string }
interface Projet { id: number; code: string; designation: string; budgetTotal: number; statut: string }
interface Marche { id: number; numeroMarche: string; objet: string; montantTtc: number; statut: string; fournisseurNom?: string }
interface VersementPrevisionnel { id: number; partenaireId?: number; partenaireNom?: string; partenaireSigle?: string; volet?: string; dateVersement: string; montant: number; montantPrevu?: number; remarques?: string }
interface ProjetConventionAssociation { projetId: number; projetCode: string; projetNom: string; projetBudgetTotal: number; projetStatut: string }

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box sx={{ py: 3 }}>{children}</Box>}</div>
}

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

const ConventionDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin, isManager } = useAuth()
  const { showSuccess, showError } = useToast()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [convention, setConvention] = useState<Convention | null>(null)
  const [avenants, setAvenants] = useState<Avenant[]>([])
  const [sousConventions, setSousConventions] = useState<SousConvention[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [marches, setMarches] = useState<Marche[]>([])
  const [versements, setVersements] = useState<VersementPrevisionnel[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{ open: boolean; type: 'unlinkProjet' | 'unlinkMarche' | 'deleteVersement' | null; id: number | null }>({ open: false, type: null, id: null })

  const tabsRef = useRef<HTMLDivElement>(null)

  const handleStatClick = (statType: 'projets' | 'marches' | 'sousConventions') => {
    const tabIndex = statType === 'sousConventions' ? 1 : statType === 'projets' ? 3 : 4
    setActiveTab(tabIndex)
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
      const mapped: Projet[] = associations.map((assoc: ProjetConventionAssociation) => ({
        id: assoc.projetId,
        code: assoc.projetCode,
        designation: assoc.projetNom,
        budgetTotal: assoc.projetBudgetTotal,
        statut: assoc.projetStatut,
      }))
      setProjets(mapped)
    } catch { setProjets([]) }
  }
  const loadMarches = async (cid: number) => { try { const r = await api.get(`/marches/convention/${cid}`); setMarches(r.data.data || r.data || []) } catch { setMarches([]) } }
  const loadVersements = async (cid: number) => { try { const r = await versementsPrevisionnelsAPI.getByConvention(cid); setVersements(r.data.data || r.data || []) } catch { setVersements([]) } }

  const handleUnlinkProjet = (projetId: number) => {
    if (!convention) return
    setConfirmState({ open: true, type: 'unlinkProjet', id: projetId })
  }

  const handleUnlinkMarche = (marcheId: number) => {
    if (!convention) return
    setConfirmState({ open: true, type: 'unlinkMarche', id: marcheId })
  }

  const handleDeleteVersement = (versementId: number) => {
    if (!convention) return
    setConfirmState({ open: true, type: 'deleteVersement', id: versementId })
  }

  const handleConfirmAction = async () => {
    if (!convention || !confirmState.id || !confirmState.type) return
    try {
      switch (confirmState.type) {
        case 'unlinkProjet':
          await conventionsAPI.unlinkProjet(confirmState.id, convention.id)
          showSuccess('Projet delie avec succes')
          loadProjets(convention.id)
          break
        case 'unlinkMarche':
          await conventionsAPI.unlinkMarche(convention.id, confirmState.id)
          showSuccess('Marche delie avec succes')
          loadMarches(convention.id)
          break
        case 'deleteVersement':
          await versementsPrevisionnelsAPI.delete(confirmState.id)
          showSuccess('Versement supprime avec succes')
          loadVersements(convention.id)
          break
      }
    } catch {
      showError('Erreur lors de l\'operation')
    } finally {
      setConfirmState({ open: false, type: null, id: null })
    }
  }

  const getConfirmDialogProps = () => {
    switch (confirmState.type) {
      case 'unlinkProjet':
        return { title: 'Delier le projet', message: 'Voulez-vous delier ce projet de la convention ?', variant: 'warning' as const, confirmLabel: 'Delier' }
      case 'unlinkMarche':
        return { title: 'Delier le marche', message: 'Voulez-vous delier ce marche de la convention ?', variant: 'warning' as const, confirmLabel: 'Delier' }
      case 'deleteVersement':
        return { title: 'Supprimer le versement', message: 'Cette action est irreversible. Voulez-vous continuer ?', variant: 'danger' as const, confirmLabel: 'Supprimer' }
      default:
        return { title: '', message: '', variant: 'info' as const, confirmLabel: 'Confirmer' }
    }
  }

  // Auto-clear messages
  useEffect(() => { if (successMessage) { const t = setTimeout(() => setSuccessMessage(null), 5000); return () => clearTimeout(t) } }, [successMessage])
  useEffect(() => { if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t) } }, [error])

  if (loading) return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '12px', mb: 3 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '12px' }} />
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '12px' }} />
          </Box>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
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

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        {/* Top bar */}
        <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: { xs: 2, md: 4 }, py: 2 }}>
          <Container maxWidth="xl" disableGutters>
            {/* Breadcrumb */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.link, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/dashboard')}>Accueil</Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>/</Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.link, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/conventions')}>Conventions</Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>/</Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{convention.code}</Typography>
            </Box>
            {/* Title row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.textPrimary }}>
                  {convention.code}
                </Typography>
                <StatusBadge status={convention.statut} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: { xs: 'none', md: 'block' } }} />
                <Tooltip title="Ajouter un avenant">
                  <Button variant="outlined" size="small" onClick={() => navigate(`/conventions/${id}/avenants/nouveau`)}
                    sx={{ textTransform: 'none', borderColor: colors.neutral[200], color: colors.textSecondary, '&:hover': { borderColor: colors.primary[300], color: colors.primary[600] } }}>
                    <Add sx={{ fontSize: 18, mr: 0.5 }} /> Avenant
                  </Button>
                </Tooltip>
                {convention.typeConvention === 'CADRE' && (
                  <Tooltip title="Ajouter une sous-convention">
                    <Button variant="outlined" size="small" onClick={() => { setEditingSousConvention(null); setSousConventionDialogOpen(true) }}
                      sx={{ textTransform: 'none', borderColor: colors.neutral[200], color: colors.textSecondary, '&:hover': { borderColor: colors.primary[300], color: colors.primary[600] } }}>
                      <Add sx={{ fontSize: 18, mr: 0.5 }} /> Sous-conv.
                    </Button>
                  </Tooltip>
                )}
                <Tooltip title={!canEdit ? 'Modification possible en statut BROUILLON uniquement' : 'Modifier'}>
                  <span>
                    <Button variant="outlined" size="small" disabled={!canEdit} onClick={() => navigate(`/conventions/${id}/edit`)}
                      sx={{ textTransform: 'none', borderColor: colors.neutral[200], color: canEdit ? colors.primary[600] : colors.textDisabled }}>
                      {canEdit ? <Edit sx={{ fontSize: 18, mr: 0.5 }} /> : <Lock sx={{ fontSize: 18, mr: 0.5 }} />} Modifier
                    </Button>
                  </span>
                </Tooltip>
                <Button variant="outlined" size="small" onClick={() => navigate('/conventions')}
                  sx={{ textTransform: 'none', borderColor: colors.neutral[200], color: colors.textSecondary }}>
                  <ArrowBack sx={{ fontSize: 18, mr: 0.5 }} /> Retour
                </Button>
              </Box>
            </Box>
            {convention.libelle && (
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mt: 0.5 }}>{convention.libelle}</Typography>
            )}
          </Container>
        </Box>

        {/* Messages */}
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        </Container>

        {/* Content */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Info + Finances cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <ConventionInfoCardLazy conventionId={convention.id} canEdit={canEdit} getStatusColor={getStatusColor} />
            <ConventionFinancesCard conventionId={convention.id} />
          </Box>

          {/* Budget Repartition */}
          <Box sx={{ mb: 3 }}>
            <BudgetRepartitionCard conventionId={convention.id} conventionBudget={convention.montant} />
          </Box>

          {/* Stats */}
          <Box sx={{ mb: 3 }}>
            <ConventionStatsCard conventionId={convention.id} onStatClick={handleStatClick} />
          </Box>

          {/* Sous-conventions summary */}
          {sousConventions.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <ConventionSousConventionsCard typeConvention={convention.typeConvention} sousConventions={sousConventions} formatCurrency={formatCurrency} getStatusColor={getStatusColor} setActiveTab={setActiveTab} />
            </Box>
          )}

          {/* Tabs */}
          <Paper ref={tabsRef} sx={{ ...componentStyles.card, overflow: 'hidden' }}>
            <Tabs value={activeTab} onChange={(_: React.SyntheticEvent, v: number) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
              sx={{
                borderBottom: `1px solid ${colors.border}`,
                '& .MuiTab-root': { textTransform: 'none', fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.textSecondary, minHeight: 48 },
                '& .Mui-selected': { color: colors.primary[600], fontWeight: typography.weights.semibold },
                '& .MuiTabs-indicator': { bgcolor: colors.primary[600], height: 2 },
              }}>
              <Tab label="Detail" icon={<Description sx={{ fontSize: 18 }} />} iconPosition="start" />
              <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>Sous-conventions {sousConventions.length > 0 && <Chip label={sousConventions.length} size="small" sx={{ height: 20, fontSize: typography.sizes.xs, bgcolor: colors.primary[50], color: colors.primary[700] }} />}</Box>} icon={<Assignment sx={{ fontSize: 18 }} />} iconPosition="start" />
              <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>Avenants {avenants.length > 0 && <Chip label={avenants.length} size="small" sx={{ height: 20, fontSize: typography.sizes.xs, bgcolor: colors.warning[50], color: colors.warning[700] }} />}</Box>} icon={<History sx={{ fontSize: 18 }} />} iconPosition="start" />
              <Tab label="Projets" icon={<AccountBalance sx={{ fontSize: 18 }} />} iconPosition="start" />
              <Tab label="Marches" icon={<Business sx={{ fontSize: 18 }} />} iconPosition="start" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <Box sx={{ px: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <ConventionPartenairesCard key={partenairesRefreshKey} conventionId={convention.id} onAddClick={() => setAddPartenaireDialogOpen(true)} onEditClick={(p) => { setEditPartenaireData({ id: p.id, partenaireId: p.partenaireId, partenaireNom: p.partenaireNom, budgetAlloue: p.budgetAlloue, pourcentage: p.pourcentage, estMaitreOeuvre: p.estMaitreOeuvre, estMaitreOeuvreDelegue: p.estMaitreOeuvreDelegue, remarques: p.remarques || undefined }); setAddPartenaireDialogOpen(true) }} />
                  <ConventionSubventionsCard conventionId={convention.id} />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <ConventionImputationsCard conventionId={convention.id} onRefresh={() => loadConvention(convention.id)} />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <ConventionVersementsCard versements={versements} onAdd={() => { setEditingVersement(null); setVersementDialogOpen(true) }} onEdit={(v) => { setEditingVersement(v); setVersementDialogOpen(true) }} onDelete={handleDeleteVersement} />
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box sx={{ px: { xs: 2, md: 3 } }}>
                {sousConventions.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setEditingSousConvention(null); setSousConventionDialogOpen(true) }}
                      sx={{ bgcolor: colors.primary[600], '&:hover': { bgcolor: colors.primary[700] }, textTransform: 'none' }}>
                      Ajouter une sous-convention
                    </Button>
                  </Box>
                )}
                <Paper sx={{ ...componentStyles.card, overflow: 'hidden' }}>
                  {sousConventions.length > 0 ? (
                    <SousConventionsTable sousConventions={sousConventions} navigate={navigate} setSousConventionDialogOpen={setSousConventionDialogOpen} setEditingSousConvention={setEditingSousConvention} />
                  ) : (
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                      <Assignment sx={{ fontSize: 40, color: colors.neutral[300], mb: 1.5 }} />
                      <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Aucune sous-convention</Typography>
                      {convention.typeConvention === 'CADRE' && (
                        <Button size="small" startIcon={<Add />} onClick={() => { setEditingSousConvention(null); setSousConventionDialogOpen(true) }}
                          sx={{ mt: 1.5, textTransform: 'none', color: colors.primary[600] }}>
                          Ajouter une sous-convention
                        </Button>
                      )}
                    </Box>
                  )}
                </Paper>
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <ConventionAvenantsTab convention={convention} avenants={avenants} formatCurrency={formatCurrency} formatDate={formatDate} getStatusColor={getStatusColor} />
              <Box sx={{ px: { xs: 2, md: 3 }, mt: 4 }}>
                <ConventionHistoryCard conventionId={convention.id} />
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <ConventionProjetsTab projets={projets} onLinkProjet={() => setLinkProjetDialogOpen(true)} onUnlinkProjet={handleUnlinkProjet} />
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <ConventionMarchesTab marches={marches} onLinkMarche={() => setLinkMarcheDialogOpen(true)} onUnlinkMarche={handleUnlinkMarche} />
            </TabPanel>
          </Paper>
        </Container>
      </Box>

      {/* Dialogs */}
      {convention && (
        <>
          <AddPartenaireDialog open={addPartenaireDialogOpen} conventionId={convention.id} conventionBudget={convention.montant} onClose={() => { setAddPartenaireDialogOpen(false); setEditPartenaireData(null) }} onSuccess={() => { setPartenairesRefreshKey((k: number) => k + 1); setEditPartenaireData(null) }} editData={editPartenaireData} />
          <LinkProjetDialog open={linkProjetDialogOpen} conventionId={convention.id} onClose={() => setLinkProjetDialogOpen(false)} onSuccess={() => loadProjets(convention.id)} />
          <LinkMarcheDialog open={linkMarcheDialogOpen} conventionId={convention.id} onClose={() => setLinkMarcheDialogOpen(false)} onSuccess={() => loadMarches(convention.id)} />
          <SousConventionFormSimple open={sousConventionDialogOpen} onClose={() => { setSousConventionDialogOpen(false); setEditingSousConvention(null) }} onSuccess={() => { loadSousConventions(convention.id); setSousConventionDialogOpen(false); setEditingSousConvention(null) }} parentConvention={{ id: convention.id, numero: convention.numero, libelle: convention.libelle, tauxCommission: convention.tauxCommission, baseCalcul: convention.baseCalcul, tauxTva: convention.tauxTva, montant: convention.montant }} editingSousConvention={editingSousConvention} />
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

// Inline sous-conventions table to keep orchestrator clean
function SousConventionsTable({ sousConventions, navigate, setSousConventionDialogOpen, setEditingSousConvention }: { sousConventions: SousConvention[]; navigate: ReturnType<typeof useNavigate>; setSousConventionDialogOpen: (v: boolean) => void; setEditingSousConvention: (v: SousConvention | null) => void }) {
  return (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& th, & td': { px: 2, py: 1.5, textAlign: 'left', borderBottom: `1px solid ${colors.border}` } }}>
      <thead>
        <tr style={{ backgroundColor: colors.neutral[50] }}>
          <th><Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</Typography></th>
          <th><Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Libelle</Typography></th>
          <th><Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</Typography></th>
          <th style={{ textAlign: 'right' }}><Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Montant</Typography></th>
          <th style={{ textAlign: 'center', width: 90 }}><Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</Typography></th>
        </tr>
      </thead>
      <tbody>
        {sousConventions.map((sc) => (
          <tr key={sc.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/conventions/${sc.id}`)}>
            <td><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.primary[600] }}>{sc.code}</Typography></td>
            <td><Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>{sc.libelle}</Typography></td>
            <td><StatusBadge status={sc.statut} size="small" /></td>
            <td style={{ textAlign: 'right' }}><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>{formatCurrency(sc.montant)}</Typography></td>
            <td style={{ textAlign: 'center' }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              {sc.statut === 'BROUILLON' && (
                <Button size="small" onClick={() => { setEditingSousConvention(sc); setSousConventionDialogOpen(true) }}
                  sx={{ textTransform: 'none', fontSize: typography.sizes.xs, color: colors.primary[600] }}>
                  <Edit sx={{ fontSize: 14, mr: 0.5 }} /> Modifier
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Box>
  )
}

export default ConventionDetailPageModern

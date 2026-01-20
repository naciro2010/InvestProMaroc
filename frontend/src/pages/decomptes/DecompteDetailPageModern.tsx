import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Container, Button, Skeleton, Alert, Chip } from '@mui/material'
import { ArrowBack, Edit, Print, CheckCircle, Cancel } from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/common/PageHeader'
import { api } from '../../lib/api'
import { DecompteInfoCard, DecompteCalculsCard, DecompteRetentionsCard } from '../../components/decomptes/detail'

interface Retenue {
  id: number
  typeRetenue: 'GARANTIE' | 'RAS' | 'PENALITES' | 'AVANCES'
  montant: number
  tauxPourcent?: number
  libelle?: string
}

interface Decompte {
  id: number
  numeroDecompte: string
  dateDecompte: string
  periodeDebut: string
  periodeFin: string
  statut: string
  montantBrutHT: number
  montantTVA: number
  montantTTC: number
  totalRetenues: number
  netAPayer: number
  cumulPrecedent: number
  cumulActuel: number
  observations?: string
  marcheId?: number
  marcheCode?: string
  marcheObjet?: string
  retenues: Retenue[]
}

const DecompteDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [decompte, setDecompte] = useState<Decompte | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadDecompte(parseInt(id))
    }
  }, [id])

  const loadDecompte = async (decompteId: number) => {
    try {
      setLoading(true)
      const res = await api.get(`/decomptes/${decompteId}`)
      setDecompte(res.data.data || res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement du décompte'
      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (statut: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (statut.toUpperCase()) {
      case 'BROUILLON':
        return 'default'
      case 'SOUMIS':
        return 'info'
      case 'VALIDE':
        return 'success'
      case 'REJETE':
        return 'error'
      case 'PAYE_PARTIEL':
        return 'warning'
      case 'PAYE_TOTAL':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const canEdit = decompte?.statut === 'BROUILLON'

  const handleValider = async () => {
    if (!decompte) return
    try {
      await api.post(`/decomptes/${decompte.id}/valider`)
      alert('Décompte validé avec succès')
      loadDecompte(decompte.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la validation'
      alert(message)
    }
  }

  const handleRejeter = async () => {
    if (!decompte) return
    const motif = prompt('Motif du rejet:')
    if (!motif) return

    try {
      await api.post(`/decomptes/${decompte.id}/rejeter`, { motif })
      alert('Décompte rejeté')
      loadDecompte(decompte.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du rejet'
      alert(message)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={400} />
        </Container>
      </AppLayout>
    )
  }

  if (error || !decompte) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Décompte non trouvé'}</Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/decomptes')} sx={{ mt: 2 }}>
            Retour à la liste
          </Button>
        </Container>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <PageHeader
            title={`Décompte ${decompte.numeroDecompte}`}
            subtitle={`Marché: ${decompte.marcheCode || 'N/A'}`}
            actions={
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Statut Badge */}
                <Chip label={decompte.statut} color={getStatusColor(decompte.statut)} sx={{ fontWeight: 600, fontSize: '0.875rem' }} />

                {/* Workflow Actions */}
                {decompte.statut === 'SOUMIS' && (
                  <>
                    <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={handleValider}>
                      Valider
                    </Button>
                    <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={handleRejeter}>
                      Rejeter
                    </Button>
                  </>
                )}

                {/* Edit & Print */}
                {canEdit && (
                  <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/decomptes/${id}/modifier`)}>
                    Modifier
                  </Button>
                )}
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>
                  Imprimer
                </Button>
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/decomptes')}>
                  Retour
                </Button>
              </Box>
            }
          />

          {/* Main Content - 3 Micro-Components */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
            {/* Left Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <DecompteInfoCard decompte={decompte} formatCurrency={formatCurrency} formatDate={formatDate} getStatusColor={getStatusColor} />
              <DecompteRetentionsCard retenues={decompte.retenues || []} totalRetenues={decompte.totalRetenues} formatCurrency={formatCurrency} />
            </Box>

            {/* Right Column */}
            <Box>
              <DecompteCalculsCard
                montantBrutHT={decompte.montantBrutHT}
                montantTVA={decompte.montantTVA}
                montantTTC={decompte.montantTTC}
                totalRetenues={decompte.totalRetenues}
                netAPayer={decompte.netAPayer}
                formatCurrency={formatCurrency}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default DecompteDetailPageModern

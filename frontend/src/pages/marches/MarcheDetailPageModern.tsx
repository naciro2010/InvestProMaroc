import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Alert } from '@mui/material'
import AppLayout from '../../components/layout/AppLayout'
import MarcheHeader from './components/MarcheHeader'
import MarcheConventionCard from './components/MarcheConventionCard'
import MarcheInfoCard from './components/MarcheInfoCard'
import MarcheStatsCard from './components/MarcheStatsCard'
import MarcheLignesSection from './components/MarcheLignesSection'
import MarcheDecomptesSection from './components/MarcheDecomptesSection'
import MarcheAvenantsSection from './components/MarcheAvenantsSection'
import MarcheSituationPaiementCard from './components/MarcheSituationPaiementCard'
import MarchePaiementsSection from './components/MarchePaiementsSection'
import MarcheOrdresServiceSection from './components/MarcheOrdresServiceSection'

/**
 * MICRO-FRONTEND ARCHITECTURE
 * ===========================
 * Cette page utilise une architecture micro-frontend ou:
 * - Chaque composant charge ses propres donnees via des micro-endpoints
 * - Les composants sont independants et peuvent se recharger separement
 * - Pas de "god object" qui charge tout d'un coup
 * - Meilleure performance et scalabilite
 *
 * Workflow visible: Marche -> Decomptes (avec statut paiement) -> Paiements
 */

const MarcheDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const [error] = useState<string | null>(null)

  if (!id) {
    return (
      <AppLayout>
        <Box sx={{ p: 4 }}>
          <Alert severity="error">ID du marche manquant</Alert>
        </Box>
      </AppLayout>
    )
  }

  const marcheId = parseInt(id)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header - Charge uniquement les infos de base */}
          <MarcheHeader marcheId={marcheId} />

          {/* Stats - Charge les metriques calculees */}
          <MarcheStatsCard marcheId={marcheId} />

          {/* Convention rattachee - Charge les infos de la convention liee */}
          <MarcheConventionCard marcheId={marcheId} />

          {/* Info Card - Charge les details du marche */}
          <MarcheInfoCard marcheId={marcheId} />

          {/* Ordres de Service - Timeline, durées, pénalités */}
          <MarcheOrdresServiceSection marcheId={marcheId} />

          {/* Lignes - Charge les lignes de prix */}
          <MarcheLignesSection marcheId={marcheId} />

          {/* Situation Paiement - Resume des paiements avec progression */}
          <MarcheSituationPaiementCard marcheId={marcheId} />

          {/* Decomptes - Charge les decomptes avec statut paiement */}
          <MarcheDecomptesSection marcheId={marcheId} />

          {/* Paiements - Charge les paiements via la chaine Decompte->OP->Paiement */}
          <MarchePaiementsSection marcheId={marcheId} />

          {/* Avenants - Charge les avenants */}
          <MarcheAvenantsSection marcheId={marcheId} />
        </Box>
      </Box>
    </AppLayout>
  )
}

export default MarcheDetailPageModern

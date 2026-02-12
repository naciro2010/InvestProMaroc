import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Paper, CircularProgress, Alert } from '@mui/material'
import AppLayout from '../../components/layout/AppLayout'
import MarcheHeader from './components/MarcheHeader'
import MarcheConventionCard from './components/MarcheConventionCard'
import MarcheInfoCard from './components/MarcheInfoCard'
import MarcheStatsCard from './components/MarcheStatsCard'
import MarcheLignesSection from './components/MarcheLignesSection'
import MarcheDecomptesSection from './components/MarcheDecomptesSection'
import MarcheAvenantsSection from './components/MarcheAvenantsSection'

/**
 * MICRO-FRONTEND ARCHITECTURE
 * ===========================
 * Cette page utilise une architecture micro-frontend où:
 * - Chaque composant charge ses propres données via des micro-endpoints
 * - Les composants sont indépendants et peuvent se recharger séparément
 * - Pas de "god object" qui charge tout d'un coup
 * - Meilleure performance et scalabilité
 */

const MarcheDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const [error, setError] = useState<string | null>(null)

  if (!id) {
    return (
      <AppLayout>
        <Box sx={{ p: 4 }}>
          <Alert severity="error">ID du marché manquant</Alert>
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

          {/* Stats - Charge les métriques calculées */}
          <MarcheStatsCard marcheId={marcheId} />

          {/* Convention rattachée - Charge les infos de la convention liée */}
          <MarcheConventionCard marcheId={marcheId} />

          {/* Info Card - Charge les détails du marché */}
          <MarcheInfoCard marcheId={marcheId} />

          {/* Lignes - Charge les lignes de prix */}
          <MarcheLignesSection marcheId={marcheId} />

          {/* Décomptes - Charge les décomptes */}
          <MarcheDecomptesSection marcheId={marcheId} />

          {/* Avenants - Charge les avenants */}
          <MarcheAvenantsSection marcheId={marcheId} />
        </Box>
      </Box>
    </AppLayout>
  )
}

export default MarcheDetailPageModern

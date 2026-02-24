import React, { useRef } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { TrendingUp, ListAlt } from '@mui/icons-material'
import { StatusBadge, InlineTable, Notebook, ResizableSection } from '@/components/core'
import ConventionAvenantsTab from './ConventionAvenantsTab'
import { ConventionProjetsTab, ConventionMarchesTab } from './ConventionRelatedTab'
import { DetailSectionHeader } from './ConventionPrevisionnelSection'
import { colors, typography } from '@/lib/designSystem'

interface ConventionBase {
  id: number
  numero: string
  dateSignature: string
  budget: number
  typeConvention: 'CADRE' | 'SPECIFIQUE'
}

interface SousConvention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: string
  budget: number
  dateDebut: string
}

interface Avenant {
  id: number
  numeroAvenant: string
  dateAvenant: string
  statut: string
  objet: string
  type: string
}

interface Projet {
  id: number
  code: string
  designation: string
  budgetTotal: number
  statut: string
}

interface Marche {
  id: number
  numeroMarche: string
  objet: string
  montantTtc: number
  statut: string
  fournisseurNom?: string
}

interface ConventionRealisationSectionProps {
  convention: ConventionBase
  projets: Projet[]
  marches: Marche[]
  sousConventions: SousConvention[]
  avenants: Avenant[]
  onLinkProjet: () => void
  onUnlinkProjet: (id: number) => void
  onLinkMarche: () => void
  onUnlinkMarche: (id: number) => void
  onAddSousConvention: () => void
  onEditSousConvention: (sc: SousConvention) => void
  onNavigateToConvention: (id: number) => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

const getStatusColor = (statut: string | undefined): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  if (!statut) return 'default'
  const map: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    BROUILLON: 'default', SOUMIS: 'info', VALIDEE: 'success', VALIDE: 'success',
    EN_COURS: 'primary', EN_EXECUTION: 'primary', ACHEVE: 'secondary', TERMINE: 'secondary',
    REJETE: 'error', ANNULE: 'error',
  }
  return map[statut.toUpperCase()] || 'default'
}

/**
 * SECTION: Realisation
 * Execution data: projects, marches, sous-conventions, avenants.
 * Stats/KPIs are now in the ConventionSummaryTable at the top of the page.
 */
const ConventionRealisationSection = ({
  convention,
  projets,
  marches,
  sousConventions,
  avenants,
  onLinkProjet,
  onUnlinkProjet,
  onLinkMarche,
  onUnlinkMarche,
  onAddSousConvention,
  onEditSousConvention,
  onNavigateToConvention,
}: ConventionRealisationSectionProps) => {
  const tabsRef = useRef<HTMLDivElement>(null)

  return (
    <Box>
      {/* Section Header */}
      <DetailSectionHeader
        icon={<TrendingUp sx={{ color: colors.success[600], fontSize: 20 }} />}
        title="Realisation"
        subtitle="Projets lies, marches, sous-conventions et avenants"
        color={colors.success[50]}
        borderColor={colors.success[200]}
      />

      {/* Notebook with tabs */}
      <ResizableSection
        title="Projets, marches et avenants"
        storageKey="conv-real-notebook"
        icon={<ListAlt sx={{ color: colors.success[500], fontSize: 16 }} />}
      >
        <Box ref={tabsRef}>
          <Notebook
            tabs={[
              {
                label: 'Projets',
                count: projets.length,
                content: (
                  <ConventionProjetsTab
                    projets={projets}
                    onLinkProjet={onLinkProjet}
                    onUnlinkProjet={onUnlinkProjet}
                  />
                ),
              },
              {
                label: 'Marches',
                count: marches.length,
                content: (
                  <ConventionMarchesTab
                    marches={marches}
                    onLinkMarche={onLinkMarche}
                    onUnlinkMarche={onUnlinkMarche}
                  />
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
                        <Typography key="code" sx={{ color: colors.primary[600], fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>{sc.code}</Typography>,
                        <Typography key="lib" sx={{ fontSize: typography.sizes.sm }}>{sc.libelle}</Typography>,
                        <StatusBadge key="stat" status={sc.statut} size="small" />,
                        <Typography key="bud" sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(sc.budget)}</Typography>,
                        sc.statut === 'BROUILLON' ? (
                          <Button key="act" size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEditSousConvention(sc) }}
                            sx={{ textTransform: 'none', fontSize: typography.sizes.xs, color: colors.primary[600], minWidth: 0 }}>
                            Modifier
                          </Button>
                        ) : null,
                      ])}
                      onRowClick={(idx) => onNavigateToConvention(sousConventions[idx].id)}
                      emptyMessage="Aucune sous-convention"
                      showAddLine={convention.typeConvention === 'CADRE'}
                      onAddLine={onAddSousConvention}
                    />
                  </Box>
                ),
              },
              {
                label: 'Avenants',
                count: avenants.length,
                content: (
                  <ConventionAvenantsTab
                    convention={convention}
                    avenants={avenants}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                  />
                ),
              },
            ]}
          />
        </Box>
      </ResizableSection>
    </Box>
  )
}

export default ConventionRealisationSection

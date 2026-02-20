import React from 'react'
import { Box, Typography } from '@mui/material'
import { Assignment, AccountBalance, Receipt, Handshake, PieChart, CardGiftcard } from '@mui/icons-material'
import { FieldGroup, Field, StatusBadge, ResizableSection } from '@/components/core'
import ConventionBudgetExecutionCard from './ConventionBudgetExecutionCard'
import ConventionBudgetDetailCard from './ConventionBudgetDetailCard'
import ConventionPartenairesCard from './ConventionPartenairesCard'
import ConventionSubventionsCard from './ConventionSubventionsCard'
import ConventionImputationsCard from './ConventionImputationsCard'
import { colors, typography } from '@/lib/designSystem'

interface ConventionData {
  id: number
  code: string
  numero: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  statut: string
  budget: number
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
  dateSignature: string
  dateDebut: string
  dateFin?: string
  parentConventionId?: number | null
}

interface VersementPrevisionnel {
  id: number
  partenaireId?: number
  partenaireNom?: string
  partenaireSigle?: string
  volet?: string
  dateVersement: string
  montant: number
  montantPrevu?: number
  remarques?: string
}

interface PartenaireCallbackData {
  id: number
  partenaireId: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  remarques: string | null
}

interface ConventionPrevisionnelSectionProps {
  convention: ConventionData
  partenairesRefreshKey: number
  versements: VersementPrevisionnel[]
  onAddPartenaire: () => void
  onEditPartenaire: (p: PartenaireCallbackData) => void
  onRefresh: () => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

/**
 * SECTION: Previsionnel
 * All planned/budgeted data: info, finances, dates, budget synthesis,
 * partenaires (with versements prev. column), imputations, subventions.
 *
 * Each sub-section is wrapped in a ResizableSection for collapsible
 * and resizable layout control.
 */
const ConventionPrevisionnelSection = ({
  convention,
  partenairesRefreshKey,
  versements,
  onAddPartenaire,
  onEditPartenaire,
  onRefresh,
}: ConventionPrevisionnelSectionProps) => {
  return (
    <Box>
      {/* Section Header */}
      <SectionHeader
        icon={<Assignment sx={{ color: colors.primary[600], fontSize: 20 }} />}
        title="Previsionnel"
        subtitle="Budget, parametres financiers et planification"
        color={colors.primary[50]}
        borderColor={colors.primary[200]}
      />

      {/* Info Fields - 3 collapsible FieldGroups */}
      <ResizableSection
        title="Informations generales"
        storageKey="conv-prev-info"
        icon={<Assignment sx={{ color: colors.primary[500], fontSize: 16 }} />}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <FieldGroup title="Informations" collapsible storageKey="conv-info">
            <Field label="Code" value={convention.code} />
            <Field label="Numero" value={convention.numero} />
            <Field label="Type" value={<StatusBadge status={convention.typeConvention} />} />
            <Field label="Statut" value={<StatusBadge status={convention.statut} />} />
          </FieldGroup>
          <FieldGroup title="Finances" collapsible storageKey="conv-finances">
            <Field label="Budget" value={formatCurrency(convention.budget)} isMoney />
            <Field label="Commission" value={`${convention.tauxCommission}%`} />
            <Field label="Base" value={convention.baseCalcul === 'DECAISSEMENTS_HT' ? 'HT' : 'TTC'} />
            <Field label="TVA" value={`${convention.tauxTva}%`} />
          </FieldGroup>
          <FieldGroup title="Dates" collapsible storageKey="conv-dates">
            <Field label="Signature" value={convention.dateSignature ? formatDate(convention.dateSignature) : '-'} />
            <Field label="Debut" value={convention.dateDebut ? formatDate(convention.dateDebut) : '-'} />
            <Field label="Fin" value={convention.dateFin ? formatDate(convention.dateFin) : '-'} />
          </FieldGroup>
        </Box>
      </ResizableSection>

      {/* Financial Synthesis */}
      <ResizableSection
        title="Synthese budgetaire"
        storageKey="conv-prev-budget-exec"
        icon={<AccountBalance sx={{ color: colors.success[500], fontSize: 16 }} />}
        key={`budget-${partenairesRefreshKey}`}
      >
        <ConventionBudgetExecutionCard
          conventionId={convention.id}
          conventionBudget={convention.budget}
          tauxCommission={convention.tauxCommission}
          tauxTva={convention.tauxTva}
          baseCalcul={convention.baseCalcul}
        />
      </ResizableSection>

      {/* Budget Detail: per-marche tracking */}
      <ResizableSection
        title="Detail budgetaire par marche"
        storageKey="conv-prev-budget-detail"
        icon={<Receipt sx={{ color: colors.info[500], fontSize: 16 }} />}
      >
        <ConventionBudgetDetailCard
          conventionId={convention.id}
          conventionBudget={convention.budget}
        />
      </ResizableSection>

      {/* Partenaires */}
      <ResizableSection
        title="Partenaires"
        storageKey="conv-prev-partenaires"
        icon={<Handshake sx={{ color: colors.purple[500], fontSize: 16 }} />}
      >
        <ConventionPartenairesCard
          key={partenairesRefreshKey}
          conventionId={convention.id}
          parentConventionId={convention.parentConventionId ?? undefined}
          versements={versements}
          onAddClick={onAddPartenaire}
          onEditClick={onEditPartenaire}
        />
      </ResizableSection>

      {/* Imputations previsionnelles */}
      <ResizableSection
        title="Imputations"
        storageKey="conv-prev-imputations"
        icon={<PieChart sx={{ color: colors.warning[500], fontSize: 16 }} />}
      >
        <ConventionImputationsCard conventionId={convention.id} onRefresh={onRefresh} />
      </ResizableSection>

      {/* Subventions */}
      <ResizableSection
        title="Subventions"
        storageKey="conv-prev-subventions"
        icon={<CardGiftcard sx={{ color: colors.success[500], fontSize: 16 }} />}
      >
        <ConventionSubventionsCard conventionId={convention.id} />
      </ResizableSection>
    </Box>
  )
}

/** Compact section header with icon, title and accent bar */
const SectionHeader = ({ icon, title, subtitle, color, borderColor }: {
  icon: React.ReactNode
  title: string
  subtitle: string
  color: string
  borderColor: string
}) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 1.5,
    mb: 2.5, mt: 0.5, pb: 1.5,
    borderBottom: `2px solid ${borderColor}`,
  }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: '8px', bgcolor: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{
        fontWeight: typography.weights.bold,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        lineHeight: 1.2,
      }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
        {subtitle}
      </Typography>
    </Box>
  </Box>
)

export default ConventionPrevisionnelSection

import { Box, Button } from '@mui/material'
import { Assignment, CalendarMonth, Handshake, PieChart, CardGiftcard, AccountBalance, ReceiptLong, Add } from '@mui/icons-material'
import { FieldGroup, Field, StatusBadge, ResizableSection } from '@/components/core'
import ConventionPartenairesCard from './ConventionPartenairesCard'
import ConventionVersementsCard from './ConventionVersementsCard'
import ConventionSubventionsCard from './ConventionSubventionsCard'
import ConventionImputationsCard from './ConventionImputationsCard'
import ConventionBudgetLignesCard from './ConventionBudgetLignesCard'
import { colors, typography } from '@/lib/designSystem'
import type { VersementPrevisionnel } from './types'

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
  tauxTvaLignes: number
  dateSignature: string
  dateDebut: string
  dateFin?: string
  parentConventionId?: number | null
}

interface PartenaireCallbackData {
  id: number
  partenaireId: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  commissionIntervention: number | null
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  remarques: string | null
}

interface ConventionPrevisionnelSectionProps {
  convention: ConventionData
  canEdit: boolean
  partenairesRefreshKey: number
  versements: VersementPrevisionnel[]
  onAddPartenaire: () => void
  onEditPartenaire: (p: PartenaireCallbackData) => void
  onAddVersement: () => void
  onEditVersement: (v: VersementPrevisionnel) => void
  onDeleteVersement: (id: number) => void
  onRefresh: () => void
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

const addBtnSx = {
  textTransform: 'none' as const,
  fontSize: typography.sizes.xs,
  color: colors.primary[600],
  borderColor: colors.primary[200],
  py: 0.25,
  px: 1,
  minHeight: 0,
  '&:hover': { borderColor: colors.primary[400], bgcolor: colors.primary[25] },
}

/**
 * Convention info + planning details.
 * Financial data (budget, commission, TVA) is in SummaryTable above.
 *
 * REORGANIZED by priority (Odoo-style):
 * 1. Budget lines (categories de depenses) - core financial breakdown
 * 2. Partenaires - who's involved
 * 3. Identification & Dates - administrative info
 * 4. Versements previsionnels - payment schedule
 * 5. Imputations previsionnelles - accounting
 * 6. Subventions - grants
 */
const ConventionPrevisionnelSection = ({
  convention,
  canEdit,
  partenairesRefreshKey,
  versements,
  onAddPartenaire,
  onEditPartenaire,
  onAddVersement,
  onEditVersement,
  onDeleteVersement,
  onRefresh,
}: ConventionPrevisionnelSectionProps) => {
  return (
    <Box>
      {/* 1. Repartition par categories de depenses (highest priority) */}
      <ResizableSection
        title="Repartition par Categories de Depenses"
        storageKey="conv-prev-budget-lignes"
        icon={<ReceiptLong sx={{ color: colors.success[500], fontSize: 16 }} />}
        noPadding
      >
        <ConventionBudgetLignesCard
          conventionId={convention.id}
          conventionFinancials={{
            budget: convention.budget,
            tauxCommission: convention.tauxCommission,
            tauxTva: convention.tauxTva,
            baseCalcul: convention.baseCalcul,
          }}
        />
      </ResizableSection>

      {/* 2. Partenaires */}
      <ResizableSection
        title="Partenaires"
        storageKey="conv-prev-partenaires"
        icon={<Handshake sx={{ color: colors.purple[500], fontSize: 16 }} />}
        actions={canEdit ? (
          <Button variant="outlined" size="small" startIcon={<Add />} onClick={onAddPartenaire} sx={addBtnSx}>
            Ajouter
          </Button>
        ) : undefined}
        noPadding
      >
        <ConventionPartenairesCard
          key={partenairesRefreshKey}
          conventionId={convention.id}
          conventionBudget={convention.budget}
          canEdit={canEdit}
          parentConventionId={convention.parentConventionId ?? undefined}
          versements={versements}
          onAddClick={onAddPartenaire}
          onEditClick={onEditPartenaire}
        />
      </ResizableSection>

      {/* 3. Identification & Dates (compact) */}
      <ResizableSection
        title="Identification & Echeancier"
        storageKey="conv-prev-info"
        icon={<Assignment sx={{ color: colors.primary[500], fontSize: 16 }} />}
      >
        <FieldGroup columns={4} collapsible storageKey="conv-info-ident">
          <Field label="Code" value={convention.code} />
          <Field label="Numero" value={convention.numero} />
          <Field label="Type" value={<StatusBadge status={convention.typeConvention} />} />
          <Field label="Statut" value={<StatusBadge status={convention.statut} />} />
        </FieldGroup>
        <Box sx={{ mt: 1 }}>
          <FieldGroup columns={3} collapsible storageKey="conv-info-dates">
            <Field label="Date signature" value={convention.dateSignature ? formatDate(convention.dateSignature) : '-'} />
            <Field label="Date debut" value={convention.dateDebut ? formatDate(convention.dateDebut) : '-'} />
            <Field label="Date fin" value={convention.dateFin ? formatDate(convention.dateFin) : '-'} />
          </FieldGroup>
        </Box>
      </ResizableSection>

      {/* 4. Versements previsionnels */}
      <ResizableSection
        title="Versements previsionnels"
        storageKey="conv-prev-versements"
        icon={<AccountBalance sx={{ color: colors.warning[500], fontSize: 16 }} />}
        actions={canEdit ? (
          <Button variant="outlined" size="small" startIcon={<Add />} onClick={onAddVersement} sx={addBtnSx}>
            Ajouter
          </Button>
        ) : undefined}
        noPadding
      >
        <ConventionVersementsCard
          versements={versements}
          conventionBudget={convention.budget}
          canEdit={canEdit}
          onAdd={onAddVersement}
          onEdit={onEditVersement}
          onDelete={onDeleteVersement}
        />
      </ResizableSection>

      {/* 5. Imputations previsionnelles */}
      <ResizableSection
        title="Imputations previsionnelles"
        storageKey="conv-prev-imputations"
        icon={<PieChart sx={{ color: colors.warning[500], fontSize: 16 }} />}
        noPadding
      >
        <ConventionImputationsCard conventionId={convention.id} conventionBudget={convention.budget} canEdit={canEdit} onRefresh={onRefresh} />
      </ResizableSection>

      {/* 6. Subventions */}
      <ResizableSection
        title="Subventions"
        storageKey="conv-prev-subventions"
        icon={<CardGiftcard sx={{ color: colors.success[500], fontSize: 16 }} />}
        noPadding
      >
        <ConventionSubventionsCard conventionId={convention.id} conventionBudget={convention.budget} canEdit={canEdit} />
      </ResizableSection>
    </Box>
  )
}

export default ConventionPrevisionnelSection

package ma.investpro.mapper

import ma.investpro.dto.BudgetLigneImputationDTO
import ma.investpro.entity.BudgetLigneImputation
import org.springframework.stereotype.Component

@Component
class BudgetLigneImputationMapper {

    fun toDTO(entity: BudgetLigneImputation): BudgetLigneImputationDTO {
        return BudgetLigneImputationDTO(
            id = entity.id ?: 0,
            budgetLigneId = entity.budgetLigne?.id ?: 0,
            projetId = entity.projet?.id,
            projetCode = entity.projetCode,
            projetLibelle = entity.projetLibelle,
            pourcentage = entity.pourcentage,
            montant = entity.montant,
            typeImputation = entity.typeImputation,
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    fun toDTOList(entities: List<BudgetLigneImputation>): List<BudgetLigneImputationDTO> {
        return entities.map { toDTO(it) }
    }
}

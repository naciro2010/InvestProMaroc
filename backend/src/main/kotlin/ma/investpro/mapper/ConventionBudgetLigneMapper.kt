package ma.investpro.mapper

import ma.investpro.dto.ConventionBudgetLigneDTO
import ma.investpro.entity.ConventionBudgetLigne
import org.springframework.stereotype.Component

/**
 * Mapper pour ConventionBudgetLigne
 * Convertit entre Entity et DTO
 */
@Component
class ConventionBudgetLigneMapper {

    /**
     * Convertit une entité en DTO
     */
    fun toDTO(entity: ConventionBudgetLigne): ConventionBudgetLigneDTO {
        val convention = entity.convention
        val categorie = entity.categorieDepense

        return ConventionBudgetLigneDTO(
            id = entity.id,
            conventionId = convention?.id ?: 0L,
            categorieDepenseId = categorie?.id ?: 0L,
            categorieDepenseCode = categorie?.code ?: "",
            categorieDepenseLibelle = categorie?.libelle ?: "",
            designation = entity.designation,
            montant = entity.montant,
            pourcentage = entity.pourcentage,
            remarques = entity.remarques,
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    /**
     * Convertit une liste d'entités en liste de DTOs
     */
    fun toDTOList(entities: List<ConventionBudgetLigne>): List<ConventionBudgetLigneDTO> {
        return entities.map { entity: ConventionBudgetLigne -> toDTO(entity) }
    }
}

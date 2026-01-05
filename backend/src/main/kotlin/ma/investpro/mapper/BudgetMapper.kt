package ma.investpro.mapper

import ma.investpro.dto.BudgetDTO
import ma.investpro.dto.BudgetSimpleDTO
import ma.investpro.dto.LigneBudgetDTO
import ma.investpro.entity.Budget
import ma.investpro.entity.LigneBudget
import org.springframework.stereotype.Component

@Component
class BudgetMapper {

    fun toDTO(entity: Budget): BudgetDTO {
        return BudgetDTO(
            id = entity.id,
            conventionId = entity.convention.id ?: 0,
            conventionNumero = entity.convention.numero,
            conventionLibelle = entity.convention.libelle,
            version = entity.version,
            dateBudget = entity.dateBudget,
            statut = entity.statut.name,
            plafondConvention = entity.plafondConvention,
            totalBudget = entity.totalBudget,
            budgetPrecedentId = entity.budgetPrecedentId,
            deltaMontant = entity.deltaMontant,
            justification = entity.justification,
            observations = entity.observations,
            dateValidation = entity.dateValidation,
            valideParId = entity.valideParId,
            lignes = entity.lignes.map { toLigneDTO(it) },
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            actif = entity.actif
        )
    }

    fun toSimpleDTO(entity: Budget): BudgetSimpleDTO {
        return BudgetSimpleDTO(
            id = entity.id,
            version = entity.version,
            dateBudget = entity.dateBudget,
            statut = entity.statut.name,
            totalBudget = entity.totalBudget,
            actif = entity.actif
        )
    }

    private fun toLigneDTO(entity: LigneBudget): LigneBudgetDTO {
        return LigneBudgetDTO(
            id = entity.id,
            budgetId = entity.budget.id ?: 0,
            code = entity.code,
            libelle = entity.libelle,
            montant = entity.montant,
            ordreAffichage = entity.ordreAffichage,
            description = entity.description,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            actif = entity.actif
        )
    }

    fun toDTOList(entities: List<Budget>): List<BudgetDTO> {
        return entities.map { toDTO(it) }
    }

    fun toSimpleDTOList(entities: List<Budget>): List<BudgetSimpleDTO> {
        return entities.map { toSimpleDTO(it) }
    }
}

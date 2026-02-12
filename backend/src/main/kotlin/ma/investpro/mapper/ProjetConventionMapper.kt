package ma.investpro.mapper

import ma.investpro.dto.ConventionSimpleDTO
import ma.investpro.dto.ProjetConventionDTO
import ma.investpro.entity.ProjetConvention
import org.springframework.stereotype.Component

/**
 * Mapper pour l'entité ProjetConvention
 */
@Component
class ProjetConventionMapper {

    fun toDTO(entity: ProjetConvention): ProjetConventionDTO {
        return ProjetConventionDTO(
            id = entity.id,
            projetId = entity.projet?.id ?: 0,
            projetCode = entity.projet?.code ?: "",
            projetNom = entity.projet?.nom ?: "",
            projetBudgetTotal = entity.projet?.budgetTotal ?: java.math.BigDecimal.ZERO,
            projetStatut = entity.projet?.statut?.name ?: "",
            conventionId = entity.convention?.id ?: 0,
            conventionCode = entity.convention?.code ?: "",
            conventionNumero = entity.convention?.numero ?: "",
            conventionLibelle = entity.convention?.libelle ?: "",
            conventionStatut = entity.convention?.statut?.name ?: "",
            conventionBudget = entity.convention?.budget ?: java.math.BigDecimal.ZERO,
            ordre = entity.ordre,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    /**
     * Convertit une association en ConventionSimpleDTO pour l'affichage dans ProjetDTO
     */
    fun toConventionSimpleDTO(entity: ProjetConvention): ConventionSimpleDTO {
        val convention = entity.convention ?: throw IllegalStateException("Convention is null in association")

        return ConventionSimpleDTO(
            id = convention.id,
            code = convention.code,
            numero = convention.numero,
            libelle = convention.libelle,
            statut = convention.statut.name,
            budget = convention.budget,
            dateDebut = convention.dateDebut,
            dateFin = convention.dateFin,
            createdByNom = null, // Peut être complété si besoin
            createdAt = convention.createdAt,
            actif = true
        )
    }

    fun toDTOList(entities: List<ProjetConvention>): List<ProjetConventionDTO> {
        return entities.map { toDTO(it) }
    }

    fun toConventionSimpleDTOList(entities: List<ProjetConvention>): List<ConventionSimpleDTO> {
        return entities.map { toConventionSimpleDTO(it) }
    }
}

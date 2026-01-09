package ma.investpro.mapper

import ma.investpro.dto.AvenantConventionRequest
import ma.investpro.dto.AvenantConventionResponse
import ma.investpro.dto.AvenantConventionSummary
import ma.investpro.entity.AvenantConvention
import ma.investpro.entity.Convention
import ma.investpro.repository.UserRepository
import org.springframework.stereotype.Component

/**
 * Mapper pour les avenants de conventions
 */
@Component
class AvenantConventionMapper(
    private val userRepository: UserRepository
) {

    /**
     * Convertit une entité en DTO de réponse complet
     */
    fun toResponse(entity: AvenantConvention): AvenantConventionResponse {
        return AvenantConventionResponse(
            id = entity.id ?: 0,
            conventionId = entity.convention.id ?: 0,
            conventionNumero = entity.convention.numero,
            conventionLibelle = entity.convention.libelle,

            numeroAvenant = entity.numeroAvenant,
            dateAvenant = entity.dateAvenant,
            objet = entity.objet,
            motif = entity.motif,

            statut = entity.statut,

            donneesAvant = entity.donneesAvant,
            modifications = entity.modifications,
            detailsModifications = entity.detailsModifications,

            ancienBudget = entity.ancienBudget,
            nouveauBudget = entity.nouveauBudget,
            deltaBudget = entity.deltaBudget,
            ancienTauxCommission = entity.ancienTauxCommission,
            nouveauTauxCommission = entity.nouveauTauxCommission,

            dateSoumission = entity.dateSoumission,
            dateValidation = entity.dateValidation,
            dateEffet = entity.dateEffet,

            createdById = entity.createdById,
            createdByName = entity.createdById?.let { getUserName(it) },
            soumisParId = entity.soumisParId,
            soumisParName = entity.soumisParId?.let { getUserName(it) },
            valideParId = entity.valideParId,
            valideParName = entity.valideParId?.let { getUserName(it) },

            remarques = entity.remarques,
            motifRejet = entity.motifRejet,

            fichierAvenant = entity.fichierAvenant,

            ordreApplication = entity.ordreApplication,

            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,

            isEditable = entity.isEditable(),
            canSoumettre = entity.canSoumettre(),
            canValider = entity.canValider(),
            isValide = entity.isValide()
        )
    }

    /**
     * Convertit une entité en DTO résumé pour liste
     */
    fun toSummary(entity: AvenantConvention): AvenantConventionSummary {
        return AvenantConventionSummary(
            id = entity.id ?: 0,
            conventionId = entity.convention.id ?: 0,
            conventionNumero = entity.convention.numero,
            numeroAvenant = entity.numeroAvenant,
            dateAvenant = entity.dateAvenant,
            objet = entity.objet,
            statut = entity.statut,
            deltaBudget = entity.deltaBudget,
            createdByName = entity.createdById?.let { getUserName(it) },
            ordreApplication = entity.ordreApplication,
            createdAt = entity.createdAt
        )
    }

    /**
     * Convertit une requête en entité
     */
    fun toEntity(request: AvenantConventionRequest, convention: Convention): AvenantConvention {
        return AvenantConvention(
            convention = convention,
            numeroAvenant = request.numeroAvenant,
            dateAvenant = request.dateAvenant,
            objet = request.objet,
            motif = request.motif,
            donneesAvant = request.donneesAvant,
            modifications = request.modifications,
            detailsModifications = request.detailsModifications,
            ancienBudget = request.ancienBudget,
            nouveauBudget = request.nouveauBudget,
            deltaBudget = request.deltaBudget,
            ancienTauxCommission = request.ancienTauxCommission,
            nouveauTauxCommission = request.nouveauTauxCommission,
            dateEffet = request.dateEffet,
            remarques = request.remarques,
            fichierAvenant = request.fichierAvenant
        )
    }

    /**
     * Met à jour une entité existante depuis une requête
     */
    fun updateEntity(entity: AvenantConvention, request: AvenantConventionRequest) {
        entity.numeroAvenant = request.numeroAvenant
        entity.dateAvenant = request.dateAvenant
        entity.objet = request.objet
        entity.motif = request.motif
        entity.donneesAvant = request.donneesAvant
        entity.modifications = request.modifications
        entity.detailsModifications = request.detailsModifications
        entity.ancienBudget = request.ancienBudget
        entity.nouveauBudget = request.nouveauBudget
        entity.deltaBudget = request.deltaBudget
        entity.ancienTauxCommission = request.ancienTauxCommission
        entity.nouveauTauxCommission = request.nouveauTauxCommission
        entity.dateEffet = request.dateEffet
        entity.remarques = request.remarques
        entity.fichierAvenant = request.fichierAvenant
    }

    /**
     * Convertit une liste d'entités en liste de réponses
     */
    fun toResponseList(entities: List<AvenantConvention>): List<AvenantConventionResponse> {
        return entities.map { toResponse(it) }
    }

    /**
     * Convertit une liste d'entités en liste de résumés
     */
    fun toSummaryList(entities: List<AvenantConvention>): List<AvenantConventionSummary> {
        return entities.map { toSummary(it) }
    }

    /**
     * Récupère le nom complet d'un utilisateur
     */
    private fun getUserName(userId: Long): String? {
        return try {
            userRepository.findById(userId)
                .map { "${it.prenom} ${it.nom}" }
                .orElse(null)
        } catch (e: Exception) {
            null
        }
    }
}

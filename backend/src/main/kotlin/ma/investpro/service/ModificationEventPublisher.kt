package ma.investpro.service

import ma.investpro.entity.TypeModification
import ma.investpro.entity.User
import ma.investpro.events.EntityModificationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

/**
 * Helper pour publier des EntityModificationEvent depuis les services.
 *
 * Usage dans un service:
 * ```
 * modificationEventPublisher.publish(
 *     entityType = EntityType.MARCHE,
 *     entityId = marche.id!!,
 *     typeModification = TypeModification.UPDATE,
 *     description = "Mise a jour du marche ${marche.numeroMarche}",
 *     champsModifies = listOf("montantHT", "statut"),
 *     donneesAvant = mapOf("montantHT" to "100000"),
 *     donneesApres = mapOf("montantHT" to "150000")
 * )
 * ```
 */
@Component
class ModificationEventPublisher(
    private val eventPublisher: ApplicationEventPublisher
) {

    /**
     * Publie un event de modification avec les infos de l'utilisateur courant.
     */
    fun publish(
        entityType: String,
        entityId: Long,
        typeModification: String,
        description: String,
        champsModifies: List<String> = emptyList(),
        donneesAvant: Map<String, String>? = null,
        donneesApres: Map<String, String>? = null
    ) {
        val auth = SecurityContextHolder.getContext().authentication ?: return
        val user = auth.principal as? User ?: return
        val userId = user.id ?: return

        eventPublisher.publishEvent(
            EntityModificationEvent(
                source = this,
                entityType = entityType,
                entityId = entityId,
                userId = userId,
                userFullName = user.fullName ?: user.username,
                typeModification = typeModification,
                description = description,
                champsModifies = champsModifies,
                donneesAvant = donneesAvant,
                donneesApres = donneesApres
            )
        )
    }

    /**
     * Raccourci pour une creation.
     */
    fun publishCreation(entityType: String, entityId: Long, description: String) {
        publish(entityType, entityId, TypeModification.CREATION, description)
    }

    /**
     * Raccourci pour un changement de statut.
     */
    fun publishStatusChange(
        entityType: String,
        entityId: Long,
        description: String,
        ancienStatut: String,
        nouveauStatut: String
    ) {
        publish(
            entityType = entityType,
            entityId = entityId,
            typeModification = TypeModification.STATUS_CHANGE,
            description = description,
            champsModifies = listOf("statut"),
            donneesAvant = mapOf("statut" to ancienStatut),
            donneesApres = mapOf("statut" to nouveauStatut)
        )
    }

    /**
     * Raccourci pour une suppression.
     */
    fun publishDeletion(entityType: String, entityId: Long, description: String) {
        publish(entityType, entityId, TypeModification.DELETE, description)
    }
}

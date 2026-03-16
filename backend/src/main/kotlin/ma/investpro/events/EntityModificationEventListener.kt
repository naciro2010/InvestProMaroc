package ma.investpro.events

import ma.investpro.dto.EntityModificationDTO
import ma.investpro.entity.EntityModification
import ma.investpro.repository.EntityModificationRepository
import ma.investpro.repository.UserRepository
import ma.investpro.service.SseEmitterService
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import java.time.LocalDateTime

/**
 * Ecoute les EntityModificationEvent et:
 * 1. Persiste dans la table entity_modifications (audit trail)
 * 2. Diffuse via SSE a tous les clients connectes (temps reel)
 *
 * Utilise @TransactionalEventListener pour garantir que l'event
 * n'est traite qu'apres le commit de la transaction principale.
 */
@Component
class EntityModificationEventListener(
    private val repository: EntityModificationRepository,
    private val userRepository: UserRepository,
    private val sseEmitterService: SseEmitterService
) {

    private val logger = LoggerFactory.getLogger(EntityModificationEventListener::class.java)

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun onEntityModification(event: EntityModificationEvent) {
        try {
            // 1. Persister dans la base
            val user = userRepository.findById(event.userId).orElse(null)
            if (user == null) {
                logger.warn("EntityModificationEvent: utilisateur {} introuvable", event.userId)
                return
            }

            val now = LocalDateTime.now()
            val entity = EntityModification(
                entityType = event.entityType,
                entityId = event.entityId,
                modifiePar = user,
                dateModification = now,
                typeModification = event.typeModification,
                description = event.description,
                champsModifies = event.champsModifies,
                donneesAvant = event.donneesAvant,
                donneesApres = event.donneesApres,
                createdAt = now
            )
            val saved = repository.save(entity)

            // 2. Diffuser via SSE
            val dto = EntityModificationDTO(
                id = saved.id!!,
                entityType = saved.entityType,
                entityId = saved.entityId,
                modifieParId = event.userId,
                modifieParNom = event.userFullName,
                dateModification = saved.dateModification,
                typeModification = saved.typeModification,
                description = saved.description,
                donneesAvant = saved.donneesAvant,
                donneesApres = saved.donneesApres,
                champsModifies = saved.champsModifies,
                createdAt = saved.createdAt
            )
            sseEmitterService.broadcast(dto)

            logger.debug("EntityModification persisted & broadcast: {} #{}", event.entityType, event.entityId)
        } catch (e: Exception) {
            logger.error("Erreur traitement EntityModificationEvent: {}", e.message, e)
        }
    }
}

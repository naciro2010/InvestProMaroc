package ma.investpro.service

import ma.investpro.dto.EntityModificationDTO
import ma.investpro.entity.EntityModification
import ma.investpro.entity.User
import ma.investpro.repository.EntityModificationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class EntityModificationService(
    private val repository: EntityModificationRepository
) {

    fun getHistorique(entityType: String, entityId: Long): List<EntityModificationDTO> {
        return repository.findByEntityTypeAndEntityIdOrderByDateModificationDesc(entityType, entityId)
            .map { toDTO(it) }
    }

    fun logModification(
        entityType: String,
        entityId: Long,
        user: User,
        typeModification: String,
        description: String,
        champsModifies: List<String> = emptyList(),
        donneesAvant: Map<String, String>? = null,
        donneesApres: Map<String, String>? = null
    ): EntityModification {
        val modification = EntityModification(
            entityType = entityType,
            entityId = entityId,
            modifiePar = user,
            dateModification = LocalDateTime.now(),
            typeModification = typeModification,
            description = description,
            champsModifies = champsModifies,
            donneesAvant = donneesAvant,
            donneesApres = donneesApres
        )
        return repository.save(modification)
    }

    private fun toDTO(entity: EntityModification): EntityModificationDTO {
        return EntityModificationDTO(
            id = entity.id!!,
            entityType = entity.entityType,
            entityId = entity.entityId,
            modifieParId = entity.modifiePar.id!!,
            modifieParNom = entity.modifiePar.fullName ?: entity.modifiePar.username,
            dateModification = entity.dateModification,
            typeModification = entity.typeModification,
            description = entity.description,
            donneesAvant = entity.donneesAvant,
            donneesApres = entity.donneesApres,
            champsModifies = entity.champsModifies,
            createdAt = entity.createdAt
        )
    }
}

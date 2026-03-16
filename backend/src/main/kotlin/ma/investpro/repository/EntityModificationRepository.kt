package ma.investpro.repository

import ma.investpro.entity.EntityModification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EntityModificationRepository : JpaRepository<EntityModification, Long> {

    fun findByEntityTypeAndEntityIdOrderByDateModificationDesc(
        entityType: String,
        entityId: Long
    ): List<EntityModification>

    fun countByEntityTypeAndEntityId(entityType: String, entityId: Long): Long

    fun findTop50ByOrderByDateModificationDesc(): List<EntityModification>
}

package ma.investpro.repository

import ma.investpro.entity.Subvention
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface SubventionRepository : JpaRepository<Subvention, Long> {

    fun findByConventionId(conventionId: Long): List<Subvention>

    fun findByConventionIdAndActifTrue(conventionId: Long): List<Subvention>

    @Query("SELECT s FROM Subvention s WHERE s.convention.id = :conventionId AND s.actif = true ORDER BY s.createdAt DESC")
    fun findActiveByConventionId(conventionId: Long): List<Subvention>

    fun countByConventionId(conventionId: Long): Long
}

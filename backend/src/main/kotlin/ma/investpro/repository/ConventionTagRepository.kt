package ma.investpro.repository

import ma.investpro.entity.ConventionTag
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ConventionTagRepository : JpaRepository<ConventionTag, Long> {
    fun findByActifTrue(): List<ConventionTag>
    fun findByNameIgnoreCase(name: String): ConventionTag?
    fun existsByNameIgnoreCase(name: String): Boolean

    @Query("SELECT t FROM ConventionTag t JOIN t.conventions c WHERE c.id = :conventionId AND t.actif = true")
    fun findByConventionId(conventionId: Long): List<ConventionTag>
}

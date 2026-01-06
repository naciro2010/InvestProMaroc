package ma.investpro.repository

import ma.investpro.entity.ImputationPrevisionnelle
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImputationPrevisionnelleRepository : JpaRepository<ImputationPrevisionnelle, Long> {
    fun findByConventionId(conventionId: Long): List<ImputationPrevisionnelle>
}

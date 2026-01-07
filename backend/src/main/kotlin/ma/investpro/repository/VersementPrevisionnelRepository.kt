package ma.investpro.repository

import ma.investpro.entity.VersementPrevisionnel
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface VersementPrevisionnelRepository : JpaRepository<VersementPrevisionnel, Long> {
    fun findByConventionId(conventionId: Long): List<VersementPrevisionnel>
}

package ma.investpro.repository

import ma.investpro.entity.ActivitePlanifiee
import org.springframework.data.jpa.repository.JpaRepository

interface ActivitePlanifieeRepository : JpaRepository<ActivitePlanifiee, Long> {
    fun findByConventionIdAndActifTrueOrderByFaitAscDatePrevueAsc(conventionId: Long): List<ActivitePlanifiee>
    fun countByConventionIdAndFaitFalseAndActifTrue(conventionId: Long): Long
}

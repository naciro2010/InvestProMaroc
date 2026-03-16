package ma.investpro.repository

import ma.investpro.entity.ConventionFollower
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConventionFollowerRepository : JpaRepository<ConventionFollower, Long> {
    fun findByConventionIdAndActifTrue(conventionId: Long): List<ConventionFollower>
    fun findByUserIdAndActifTrue(userId: Long): List<ConventionFollower>
    fun findByConventionIdAndUserIdAndActifTrue(conventionId: Long, userId: Long): ConventionFollower?
    fun existsByConventionIdAndUserIdAndActifTrue(conventionId: Long, userId: Long): Boolean
    fun countByConventionIdAndActifTrue(conventionId: Long): Long
}

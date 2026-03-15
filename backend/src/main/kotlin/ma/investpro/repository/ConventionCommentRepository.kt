package ma.investpro.repository

import ma.investpro.entity.ConventionComment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConventionCommentRepository : JpaRepository<ConventionComment, Long> {
    fun findByConventionIdAndParentCommentIsNullAndActifTrueOrderByCreatedAtDesc(conventionId: Long): List<ConventionComment>
    fun findByConventionIdAndActifTrueOrderByCreatedAtDesc(conventionId: Long): List<ConventionComment>
    fun countByConventionIdAndActifTrue(conventionId: Long): Long
    fun findByParentCommentIdAndActifTrueOrderByCreatedAtAsc(parentId: Long): List<ConventionComment>
}

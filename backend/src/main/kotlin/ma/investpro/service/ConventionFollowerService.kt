package ma.investpro.service

import ma.investpro.dto.ConventionFollowerDTO
import ma.investpro.dto.CreateConventionFollowerRequest
import ma.investpro.entity.ConventionFollower
import ma.investpro.entity.SubscriptionType
import ma.investpro.repository.ConventionFollowerRepository
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.UserRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class ConventionFollowerService(
    private val followerRepository: ConventionFollowerRepository,
    private val conventionRepository: ConventionRepository,
    private val userRepository: UserRepository
) {

    @Transactional(readOnly = true)
    fun getFollowers(conventionId: Long): List<ConventionFollowerDTO> =
        followerRepository.findByConventionIdAndActifTrue(conventionId).map { toDTO(it) }

    @Transactional(readOnly = true)
    fun isFollowing(conventionId: Long): Boolean {
        val userId = getCurrentUserId()
        return followerRepository.existsByConventionIdAndUserIdAndActifTrue(conventionId, userId)
    }

    @Transactional(readOnly = true)
    fun countFollowers(conventionId: Long): Long =
        followerRepository.countByConventionIdAndActifTrue(conventionId)

    fun follow(conventionId: Long, request: CreateConventionFollowerRequest): ConventionFollowerDTO {
        val convention = conventionRepository.findByIdOrNull(conventionId)
            ?: throw IllegalArgumentException("Convention introuvable")
        val user = userRepository.findByIdOrNull(request.userId)
            ?: throw IllegalArgumentException("Utilisateur introuvable")

        // Vérifier si déjà follower
        val existing = followerRepository.findByConventionIdAndUserIdAndActifTrue(conventionId, request.userId)
        if (existing != null) return toDTO(existing)

        val follower = ConventionFollower(
            convention = convention,
            user = user,
            subscriptionType = try { SubscriptionType.valueOf(request.subscriptionType) } catch (_: Exception) { SubscriptionType.ALL }
        )
        return toDTO(followerRepository.save(follower))
    }

    fun followMe(conventionId: Long): ConventionFollowerDTO {
        val userId = getCurrentUserId()
        return follow(conventionId, CreateConventionFollowerRequest(userId = userId))
    }

    fun unfollow(conventionId: Long, userId: Long) {
        val follower = followerRepository.findByConventionIdAndUserIdAndActifTrue(conventionId, userId)
            ?: throw IllegalArgumentException("Abonnement introuvable")
        follower.actif = false
        followerRepository.save(follower)
    }

    fun unfollowMe(conventionId: Long) {
        val userId = getCurrentUserId()
        unfollow(conventionId, userId)
    }

    private fun getCurrentUserId(): Long {
        val username = SecurityContextHolder.getContext().authentication?.name
            ?: throw IllegalArgumentException("Non authentifié")
        return userRepository.findByUsername(username)
            .orElseThrow { IllegalArgumentException("Utilisateur introuvable") }
            .id ?: throw IllegalArgumentException("Utilisateur invalide")
    }

    private fun toDTO(follower: ConventionFollower): ConventionFollowerDTO = ConventionFollowerDTO(
        id = follower.id!!,
        conventionId = follower.convention.id!!,
        userId = follower.user.id!!,
        userName = follower.user.fullName,
        userInitials = follower.user.fullName
            .split(" ").take(2).joinToString("") { it.take(1).uppercase() },
        subscriptionType = follower.subscriptionType.name,
        createdAt = follower.createdAt
    )
}

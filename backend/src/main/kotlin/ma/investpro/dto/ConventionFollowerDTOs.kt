package ma.investpro.dto

import java.time.LocalDateTime

data class ConventionFollowerDTO(
    val id: Long,
    val conventionId: Long,
    val userId: Long,
    val userName: String,
    val userInitials: String,
    val subscriptionType: String,
    val createdAt: LocalDateTime?
)

data class CreateConventionFollowerRequest(
    val userId: Long,
    val subscriptionType: String = "ALL"
)

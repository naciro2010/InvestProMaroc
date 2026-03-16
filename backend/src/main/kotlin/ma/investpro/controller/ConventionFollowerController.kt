package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.service.ConventionFollowerService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/conventions/{conventionId}/followers")
class ConventionFollowerController(
    private val followerService: ConventionFollowerService
) {

    @GetMapping
    @ReadAccess
    fun getFollowers(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<List<ConventionFollowerDTO>>> {
        val followers = followerService.getFollowers(conventionId)
        return ResponseEntity.ok(ApiResponse.success(followers))
    }

    @GetMapping("/count")
    @ReadAccess
    fun countFollowers(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<Long>> {
        val count = followerService.countFollowers(conventionId)
        return ResponseEntity.ok(ApiResponse.success(count))
    }

    @GetMapping("/is-following")
    @ReadAccess
    fun isFollowing(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<Boolean>> {
        val following = followerService.isFollowing(conventionId)
        return ResponseEntity.ok(ApiResponse.success(following))
    }

    @PostMapping
    @WriteAccess
    fun addFollower(
        @PathVariable conventionId: Long,
        @RequestBody request: CreateConventionFollowerRequest
    ): ResponseEntity<ApiResponse<ConventionFollowerDTO>> {
        return try {
            val follower = followerService.follow(conventionId, request)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(follower, "Abonnement ajouté"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }

    @PostMapping("/follow-me")
    @ReadAccess
    fun followMe(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<ConventionFollowerDTO>> {
        return try {
            val follower = followerService.followMe(conventionId)
            ResponseEntity.ok(ApiResponse.success(follower, "Vous suivez cette convention"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }

    @DeleteMapping("/unfollow-me")
    @ReadAccess
    fun unfollowMe(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<String>> {
        return try {
            followerService.unfollowMe(conventionId)
            ResponseEntity.ok(ApiResponse.success("OK", "Désabonnement effectué"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }

    @DeleteMapping("/{userId}")
    @WriteAccess
    fun removeFollower(
        @PathVariable conventionId: Long,
        @PathVariable userId: Long
    ): ResponseEntity<ApiResponse<String>> {
        return try {
            followerService.unfollow(conventionId, userId)
            ResponseEntity.ok(ApiResponse.success("OK", "Abonné retiré"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }
}

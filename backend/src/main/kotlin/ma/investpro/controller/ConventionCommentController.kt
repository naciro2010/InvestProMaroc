package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.service.ConventionCommentService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/conventions/{conventionId}/comments")
class ConventionCommentController(
    private val commentService: ConventionCommentService
) {

    @GetMapping
    @ReadAccess
    fun getComments(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<List<ConventionCommentDTO>>> {
        val comments = commentService.getComments(conventionId)
        return ResponseEntity.ok(ApiResponse.success(comments))
    }

    @GetMapping("/count")
    @ReadAccess
    fun countComments(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<Long>> {
        val count = commentService.countComments(conventionId)
        return ResponseEntity.ok(ApiResponse.success(count))
    }

    @PostMapping
    @WriteAccess
    fun addComment(
        @PathVariable conventionId: Long,
        @RequestBody request: CreateConventionCommentRequest
    ): ResponseEntity<ApiResponse<ConventionCommentDTO>> {
        return try {
            val comment = commentService.addComment(conventionId, request)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(comment, "Commentaire ajouté"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }

    @PutMapping("/{commentId}")
    @WriteAccess
    fun updateComment(
        @PathVariable conventionId: Long,
        @PathVariable commentId: Long,
        @RequestBody request: UpdateConventionCommentRequest
    ): ResponseEntity<ApiResponse<ConventionCommentDTO>> {
        return try {
            val comment = commentService.updateComment(commentId, request)
            ResponseEntity.ok(ApiResponse.success(comment, "Commentaire modifié"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }

    @DeleteMapping("/{commentId}")
    @WriteAccess
    fun deleteComment(
        @PathVariable conventionId: Long,
        @PathVariable commentId: Long
    ): ResponseEntity<ApiResponse<String>> {
        return try {
            commentService.deleteComment(commentId)
            ResponseEntity.ok(ApiResponse.success("OK", "Commentaire supprimé"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }
}

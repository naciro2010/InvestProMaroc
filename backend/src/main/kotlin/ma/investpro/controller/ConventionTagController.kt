package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly
import ma.investpro.service.ConventionTagService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/convention-tags")
class ConventionTagController(
    private val tagService: ConventionTagService
) {

    @GetMapping
    @ReadAccess
    fun getAllTags(): ResponseEntity<ApiResponse<List<ConventionTagDTO>>> {
        val tags = tagService.getAllTags()
        return ResponseEntity.ok(ApiResponse.success(tags))
    }

    @GetMapping("/convention/{conventionId}")
    @ReadAccess
    fun getTagsForConvention(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<List<ConventionTagDTO>>> {
        val tags = tagService.getTagsForConvention(conventionId)
        return ResponseEntity.ok(ApiResponse.success(tags))
    }

    @PostMapping
    @WriteAccess
    fun createTag(
        @RequestBody request: CreateConventionTagRequest
    ): ResponseEntity<ApiResponse<ConventionTagDTO>> {
        return try {
            val tag = tagService.createTag(request)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(tag, "Tag créé"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }

    @PutMapping("/{tagId}")
    @WriteAccess
    fun updateTag(
        @PathVariable tagId: Long,
        @RequestBody request: UpdateConventionTagRequest
    ): ResponseEntity<ApiResponse<ConventionTagDTO>> {
        return try {
            val tag = tagService.updateTag(tagId, request)
            ResponseEntity.ok(ApiResponse.success(tag, "Tag modifié"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }

    @DeleteMapping("/{tagId}")
    @AdminOnly
    fun deleteTag(
        @PathVariable tagId: Long
    ): ResponseEntity<ApiResponse<String>> {
        return try {
            tagService.deleteTag(tagId)
            ResponseEntity.ok(ApiResponse.success("OK", "Tag supprimé"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }

    @PostMapping("/convention/{conventionId}/assign/{tagId}")
    @WriteAccess
    fun assignTag(
        @PathVariable conventionId: Long,
        @PathVariable tagId: Long
    ): ResponseEntity<ApiResponse<String>> {
        return try {
            tagService.assignTag(conventionId, tagId)
            ResponseEntity.ok(ApiResponse.success("OK", "Tag assigné"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }

    @DeleteMapping("/convention/{conventionId}/remove/{tagId}")
    @WriteAccess
    fun removeTag(
        @PathVariable conventionId: Long,
        @PathVariable tagId: Long
    ): ResponseEntity<ApiResponse<String>> {
        return try {
            tagService.removeTag(conventionId, tagId)
            ResponseEntity.ok(ApiResponse.success("OK", "Tag retiré"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur"))
        }
    }
}

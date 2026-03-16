package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.service.SseEmitterService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter

/**
 * Controller SSE pour le streaming temps reel des modifications.
 *
 * Micro-endpoints:
 * - GET /api/sse/entity/{type}/{id}  -> Stream pour une entite specifique
 * - GET /api/sse/global              -> Stream global (toutes les modifications)
 * - GET /api/sse/stats               -> Stats connexions actives
 */
@RestController
@RequestMapping("/api/sse")
class SseController(
    private val sseEmitterService: SseEmitterService
) {

    /**
     * SSE stream pour une entite specifique.
     * Le client recoit uniquement les modifications de cette entite.
     *
     * Usage frontend: new EventSource('/api/sse/entity/MARCHE/42')
     */
    @GetMapping("/entity/{entityType}/{entityId}", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    @ReadAccess
    fun streamEntity(
        @PathVariable entityType: String,
        @PathVariable entityId: Long
    ): SseEmitter {
        return sseEmitterService.subscribeToEntity(entityType.uppercase(), entityId)
    }

    /**
     * SSE stream global: toutes les modifications de toutes les entites.
     * Utile pour un dashboard temps reel ou journal d'activite.
     *
     * Usage frontend: new EventSource('/api/sse/global')
     */
    @GetMapping("/global", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    @ReadAccess
    fun streamGlobal(): SseEmitter {
        return sseEmitterService.subscribeGlobal()
    }

    /**
     * Stats des connexions SSE actives (micro-endpoint).
     */
    @GetMapping("/stats")
    @ReadAccess
    fun getStats(): ResponseEntity<ApiResponse<SseStatsDTO>> {
        val stats = SseStatsDTO(
            activeConnections = sseEmitterService.activeConnectionsCount()
        )
        return ResponseEntity.ok(ApiResponse.success(stats))
    }
}

data class SseStatsDTO(
    val activeConnections: Int
)

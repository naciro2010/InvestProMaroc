package ma.investpro.controller

import ma.investpro.dto.AiDashboardResponse
import ma.investpro.dto.AiInstructionRequest
import ma.investpro.dto.AiStatusResponse
import ma.investpro.dto.AiStreamEvent
import ma.investpro.dto.ApiResponse
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.service.AiDashboardService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.http.codec.ServerSentEvent
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import java.util.Optional

/**
 * Controller for AI-powered dashboard generation.
 *
 * POST /api/ai/dashboard/parse   - Parse instruction (sync, JSON only)
 * POST /api/ai/dashboard/stream  - Stream instruction (SSE, markdown + viz)
 * GET  /api/ai/dashboard/status  - Check if Ollama AI is available
 *
 * The AiDashboardService is optional - if Ollama is disabled via
 * spring.ai.ollama.chat.enabled=false, endpoints return 503 gracefully.
 */
@RestController
@RequestMapping("/api/ai/dashboard")
@ReadAccess
class AiDashboardController(
    private val aiDashboardService: Optional<AiDashboardService>
) {
    /**
     * Stream a rich AI response via Server-Sent Events.
     */
    @PostMapping("/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun streamInstruction(@RequestBody request: AiInstructionRequest): Flux<ServerSentEvent<AiStreamEvent>> {
        if (!aiDashboardService.isPresent) {
            return Flux.just(
                ServerSentEvent.builder(AiStreamEvent.error("Service IA désactivé sur cette instance."))
                    .event("error")
                    .build()
            )
        }

        if (request.instruction.isBlank()) {
            return Flux.just(
                ServerSentEvent.builder(AiStreamEvent.error("L'instruction ne peut pas être vide"))
                    .event("error")
                    .build()
            )
        }

        return aiDashboardService.get().streamInstruction(request.instruction, request.conversationId)
            .map { event ->
                ServerSentEvent.builder(event)
                    .event(event.type)
                    .build()
            }
    }

    /**
     * Parse a French text instruction into a structured dashboard query (sync).
     */
    @PostMapping("/parse")
    fun parseInstruction(@RequestBody request: AiInstructionRequest): ResponseEntity<ApiResponse<AiDashboardResponse>> {
        if (!aiDashboardService.isPresent) {
            return ResponseEntity.status(503).body(
                ApiResponse.error("Service IA désactivé. Utilisez le mode hors-ligne.")
            )
        }

        if (request.instruction.isBlank()) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("L'instruction ne peut pas être vide")
            )
        }

        val result = aiDashboardService.get().parseInstruction(request.instruction, request.conversationId)

        return if (result != null) {
            ResponseEntity.ok(ApiResponse.success(result, "Instruction analysée par IA"))
        } else {
            ResponseEntity.status(503).body(
                ApiResponse.error("Service IA indisponible. Utilisez le mode hors-ligne.")
            )
        }
    }

    /**
     * Check if Ollama AI service is available and responding.
     */
    @GetMapping("/status")
    fun checkStatus(): ResponseEntity<ApiResponse<AiStatusResponse>> {
        if (!aiDashboardService.isPresent) {
            return ResponseEntity.ok(
                ApiResponse.success(AiStatusResponse(available = false, model = null, baseUrl = null))
            )
        }
        val status = aiDashboardService.get().checkStatus()
        return ResponseEntity.ok(ApiResponse.success(status))
    }
}

package ma.investpro.controller

import ma.investpro.dto.AiDashboardResponse
import ma.investpro.dto.AiInstructionRequest
import ma.investpro.dto.AiStatusResponse
import ma.investpro.dto.ApiResponse
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.service.AiDashboardService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Controller for AI-powered dashboard generation.
 *
 * POST /api/ai/dashboard/parse - Parse a French instruction into a structured query
 * GET  /api/ai/dashboard/status - Check if Ollama AI is available
 */
@RestController
@RequestMapping("/api/ai/dashboard")
@ReadAccess
class AiDashboardController(
    private val aiDashboardService: AiDashboardService
) {
    /**
     * Parse a French text instruction into a structured dashboard query.
     * Uses Ollama LLM for intelligent parsing with conversation memory.
     *
     * Returns 200 with parsed instruction if AI succeeds.
     * Returns 503 if Ollama is unavailable (frontend should use rule-based fallback).
     */
    @PostMapping("/parse")
    fun parseInstruction(@RequestBody request: AiInstructionRequest): ResponseEntity<ApiResponse<AiDashboardResponse>> {
        if (request.instruction.isBlank()) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("L'instruction ne peut pas être vide")
            )
        }

        val result = aiDashboardService.parseInstruction(request.instruction, request.conversationId)

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
        val status = aiDashboardService.checkStatus()
        return ResponseEntity.ok(ApiResponse.success(status))
    }
}

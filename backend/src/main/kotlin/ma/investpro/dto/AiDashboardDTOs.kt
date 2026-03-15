package ma.investpro.dto

/**
 * DTOs for AI-powered dashboard generation via Ollama.
 */

/** Request from frontend to parse a French instruction */
data class AiInstructionRequest(
    val instruction: String,
    val conversationId: String? = null
)

/** Structured output from the LLM - describes what to query/visualize */
data class AiParsedInstruction(
    val visualization: String = "table",
    val entity: String = "conventions",
    val groupBy: String? = null,
    val metric: String = "count",
    val metricField: String = "montant",
    val limit: Int? = null,
    val title: String = "",
    val confidence: Double = 0.8,
    val explanation: List<String> = emptyList(),
    val warnings: List<String> = emptyList()
)

/** Response wrapper with parsed instruction + AI status */
data class AiDashboardResponse(
    val instruction: AiParsedInstruction,
    val aiEnabled: Boolean,
    val model: String? = null
)

/** Status check response */
data class AiStatusResponse(
    val available: Boolean,
    val model: String?,
    val baseUrl: String?
)

/** SSE stream event sent to frontend during streaming response */
data class AiStreamEvent(
    val type: String,
    val content: String = "",
    val instruction: AiParsedInstruction? = null
) {
    companion object {
        const val TYPE_TEXT = "text"
        const val TYPE_VISUALIZATION = "visualization"
        const val TYPE_DONE = "done"
        const val TYPE_ERROR = "error"

        fun text(content: String): AiStreamEvent = AiStreamEvent(type = TYPE_TEXT, content = content)
        fun visualization(instruction: AiParsedInstruction): AiStreamEvent =
            AiStreamEvent(type = TYPE_VISUALIZATION, instruction = instruction)
        fun done(): AiStreamEvent = AiStreamEvent(type = TYPE_DONE)
        fun error(message: String): AiStreamEvent = AiStreamEvent(type = TYPE_ERROR, content = message)
    }
}

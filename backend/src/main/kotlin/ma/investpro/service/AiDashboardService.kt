package ma.investpro.service

import ma.investpro.dto.AiDashboardResponse
import ma.investpro.dto.AiParsedInstruction
import ma.investpro.dto.AiStatusResponse
import mu.KotlinLogging
import org.springframework.ai.chat.client.ChatClient
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository
import org.springframework.ai.chat.memory.MessageWindowChatMemory
import org.springframework.ai.ollama.OllamaChatModel
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean

private val logger = KotlinLogging.logger {}

/**
 * Service for AI-powered dashboard instruction parsing via Ollama.
 *
 * Resilient to Ollama startup delays — on Railway, Ollama starts in the same
 * container and may need time to pull the model on first deploy.
 * The service caches availability status and retries periodically.
 */
@Service
class AiDashboardService(
    private val chatModel: OllamaChatModel,
    @Value("\${spring.ai.ollama.chat.options.model:mistral}") private val modelName: String,
    @Value("\${spring.ai.ollama.base-url:http://localhost:11434}") private val baseUrl: String
) {
    private val conversationClients = ConcurrentHashMap<String, ChatClient>()
    private val ollamaReady = AtomicBoolean(false)
    @Volatile private var lastStatusCheck: Long = 0
    @Volatile private var lastStatusResult: Boolean = false

    companion object {
        private const val STATUS_CACHE_MS = 30_000L // Re-check every 30s

        private const val SYSTEM_PROMPT = """Tu es un assistant qui convertit des instructions en français en requêtes structurées pour un tableau de bord financier.

Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ou après.

Entités disponibles: conventions, marches, projets, decomptes, paiements, fournisseurs, budgets

Types de visualisation: table, bar, pie, line, kpi

Champs de regroupement: statut, type, convention, marche, fournisseur, projet, mois, annee, zone

Métriques: count, sum, average

Champs métriques par entité:
- conventions: budget
- marches: montantHt, montantTtc
- projets: budgetTotal
- decomptes: netAPayer, montantBrutHT
- paiements: montantPaye
- budgets: totalBudget
- fournisseurs: (count seulement)

Règles:
1. Si l'utilisateur mentionne une entité, utilise-la
2. Si l'utilisateur mentionne "par statut/type/mois/etc", c'est le groupBy
3. Si l'utilisateur mentionne "montant/total/somme", metric = "sum"
4. Si l'utilisateur mentionne "nombre/combien", metric = "count"
5. Si l'utilisateur mentionne "moyenne", metric = "average"
6. Si l'utilisateur mentionne "top N", ajoute limit = N
7. Infère la visualisation: pie pour répartition, line pour évolution temporelle, bar pour comparaison, table pour listing
8. Génère un titre en français décrivant la requête
9. Ajoute des explications courtes de ce que tu as compris

Format de réponse (JSON uniquement):
{
  "visualization": "bar",
  "entity": "marches",
  "groupBy": "statut",
  "metric": "count",
  "metricField": "montantHt",
  "limit": null,
  "title": "Nombre de marchés par statut",
  "confidence": 0.9,
  "explanation": ["Entité: marchés", "Regroupement: par statut", "Métrique: nombre"],
  "warnings": []
}"""
    }

    /**
     * Parse a French instruction using Ollama LLM.
     * Returns null if Ollama is unavailable or still starting up.
     */
    fun parseInstruction(instruction: String, conversationId: String?): AiDashboardResponse? {
        if (!isOllamaAvailable()) {
            logger.debug { "Ollama not available, skipping AI parsing" }
            return null
        }

        return try {
            val client = getOrCreateClient(conversationId)

            val response = client.prompt()
                .user(instruction)
                .call()
                .entity(AiParsedInstruction::class.java)

            if (response != null) {
                ollamaReady.set(true)
                logger.info { "AI parsed instruction: ${response.title} (confidence: ${response.confidence})" }
                AiDashboardResponse(
                    instruction = response,
                    aiEnabled = true,
                    model = modelName
                )
            } else {
                logger.warn { "Ollama returned null for instruction: $instruction" }
                null
            }
        } catch (e: Exception) {
            logger.warn { "Ollama error during parsing: ${e.message}" }
            null
        }
    }

    /**
     * Check if Ollama is available. Caches result for 30s to avoid
     * hammering the Ollama API on every request.
     */
    fun checkStatus(): AiStatusResponse {
        val available = isOllamaAvailable()
        return AiStatusResponse(
            available = available,
            model = if (available) modelName else null,
            baseUrl = baseUrl
        )
    }

    private fun isOllamaAvailable(): Boolean {
        val now = System.currentTimeMillis()
        if (now - lastStatusCheck < STATUS_CACHE_MS) {
            return lastStatusResult
        }

        return try {
            val response = chatModel.call("ping")
            val available = response != null && response.isNotBlank()
            lastStatusResult = available
            lastStatusCheck = now
            if (available && !ollamaReady.getAndSet(true)) {
                logger.info { "Ollama is now available with model: $modelName" }
            }
            available
        } catch (e: Exception) {
            logger.debug { "Ollama status check failed: ${e.message}" }
            lastStatusResult = false
            lastStatusCheck = now
            false
        }
    }

    private fun getOrCreateClient(conversationId: String?): ChatClient {
        val key = conversationId ?: "default"
        return conversationClients.getOrPut(key) {
            val memoryRepository = InMemoryChatMemoryRepository()
            val chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(memoryRepository)
                .maxMessages(20)
                .build()

            ChatClient.builder(chatModel)
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(
                    MessageChatMemoryAdvisor.builder(chatMemory).build()
                )
                .build()
        }
    }
}

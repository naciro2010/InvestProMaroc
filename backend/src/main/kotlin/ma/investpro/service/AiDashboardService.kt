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

private val logger = KotlinLogging.logger {}

/**
 * Service for AI-powered dashboard instruction parsing via Ollama.
 *
 * Uses Spring AI's ChatClient with structured output (BeanOutputConverter)
 * to convert French text instructions into structured ParsedInstruction objects.
 *
 * Falls back gracefully when Ollama is not available.
 */
@Service
class AiDashboardService(
    private val chatModel: OllamaChatModel,
    @Value("\${spring.ai.ollama.chat.options.model:mistral}") private val modelName: String,
    @Value("\${spring.ai.ollama.base-url:http://localhost:11434}") private val baseUrl: String
) {
    private val conversationClients = ConcurrentHashMap<String, ChatClient>()

    companion object {
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
     * Returns null if Ollama is unavailable.
     */
    fun parseInstruction(instruction: String, conversationId: String?): AiDashboardResponse? {
        return try {
            val client = getOrCreateClient(conversationId)

            val response = client.prompt()
                .user(instruction)
                .call()
                .entity(AiParsedInstruction::class.java)

            if (response != null) {
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
            logger.warn { "Ollama unavailable or error: ${e.message}" }
            null
        }
    }

    /**
     * Check if Ollama is available and responding.
     */
    fun checkStatus(): AiStatusResponse {
        return try {
            val response = chatModel.call("ping")
            AiStatusResponse(
                available = response != null && response.isNotBlank(),
                model = modelName,
                baseUrl = baseUrl
            )
        } catch (e: Exception) {
            logger.debug { "Ollama status check failed: ${e.message}" }
            AiStatusResponse(available = false, model = modelName, baseUrl = baseUrl)
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

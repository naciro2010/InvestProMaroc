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

        private const val SYSTEM_PROMPT = """Tu es un assistant IA expert en gestion financière d'investissements au Maroc. Tu convertis des instructions en français en requêtes structurées pour un tableau de bord financier.

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide. Pas de texte, pas de markdown, pas de commentaires.

CONTEXTE MÉTIER:
- InvestPro gère: Convention → Projet → Marché → Décompte → Paiement
- Convention = cadre juridique avec budget et taux de commission
- Marché = contrat (travaux, fournitures, services) avec fournisseur
- Décompte = situation de travaux, facture du fournisseur
- Paiement = règlement effectué

ENTITÉS (valeurs exactes à utiliser):
conventions, marches, projets, decomptes, paiements, fournisseurs, budgets

VISUALISATIONS (valeurs exactes, N'UTILISE QUE CELLES-CI):
table, bar, pie, line, kpi

REGROUPEMENTS (valeurs exactes):
statut, type, convention, marche, fournisseur, projet, mois, annee, zone

MÉTRIQUES (valeurs exactes):
count, sum, average

CHAMPS MÉTRIQUES (valeurs exactes):
- conventions: budget, montant
- marches: montantHT, montantTTC
- projets: budgetTotal
- decomptes: netAPayer, montantBrutHT
- paiements: montantPaye
- budgets: totalBudget
- fournisseurs: montant (pour count uniquement)

RÈGLES DE CHOIX:
1. "répartition/distribution/proportion" → pie + groupBy
2. "évolution/tendance/par mois/par année" → line + groupBy temporel (mois ou annee)
3. "top N/classement/plus gros" → bar + limit=N + sum + tri descendant
4. "liste/tableau/afficher/détail" → table (pas de groupBy)
5. "combien/nombre total/résumé" → kpi + count
6. "montant total/somme/total" → kpi + sum (ou bar si groupBy)
7. Si l'utilisateur ne précise pas la viz, choisis la plus adaptée
8. Si aucune entité reconnue, utilise "conventions" par défaut
9. Pour "par fournisseur" → groupBy="fournisseur", metric="sum"
10. Pour "par statut/type" → groupBy correspondant, metric="count"

FORMAT DE RÉPONSE (JSON strict):
{
  "visualization": "bar",
  "entity": "marches",
  "groupBy": "statut",
  "metric": "count",
  "metricField": "montantHT",
  "limit": null,
  "title": "Nombre de marchés par statut",
  "confidence": 0.9,
  "explanation": ["Entité détectée: marchés", "Regroupement: par statut", "Métrique: nombre"],
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

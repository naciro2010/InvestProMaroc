package ma.investpro.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import ma.investpro.dto.AiDashboardResponse
import ma.investpro.dto.AiParsedInstruction
import ma.investpro.dto.AiStatusResponse
import ma.investpro.dto.AiStreamEvent
import mu.KotlinLogging
import org.springframework.ai.chat.client.ChatClient
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository
import org.springframework.ai.chat.memory.MessageWindowChatMemory
import org.springframework.ai.ollama.OllamaChatModel
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Sinks
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean

private val logger = KotlinLogging.logger {}

/**
 * Service for AI-powered dashboard instruction parsing via Ollama.
 *
 * Supports both synchronous (fallback) and streaming (SSE) modes.
 * The streaming mode returns rich markdown analysis + visualization config.
 */
@Service
class AiDashboardService(
    private val chatModel: OllamaChatModel,
    private val objectMapper: ObjectMapper,
    @Value("\${spring.ai.ollama.chat.options.model:llama3.1}") private val modelName: String,
    @Value("\${spring.ai.ollama.base-url:http://localhost:11434}") private val baseUrl: String
) {
    private val conversationClients = ConcurrentHashMap<String, ChatClient>()
    private val ollamaReady = AtomicBoolean(false)
    @Volatile private var lastStatusCheck: Long = 0
    @Volatile private var lastStatusResult: Boolean = false

    companion object {
        private const val STATUS_CACHE_MS = 30_000L

        private const val SYSTEM_PROMPT_SYNC = """Tu es un assistant IA expert en gestion financière d'investissements au Maroc. Tu convertis des instructions en français en requêtes structurées pour un tableau de bord financier.

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

        private const val SYSTEM_PROMPT_STREAM = """Tu es un analyste financier expert pour InvestPro Maroc, une plateforme de gestion des dépenses d'investissement et de calcul de commissions.

CONTEXTE MÉTIER:
- InvestPro gère le cycle financier: Convention → Projet → Marché → Décompte → Paiement
- Convention = cadre juridique définissant les règles de calcul de commissions
- Projet = programme d'investissement avec budget
- Marché = contrat de marchés publics (travaux, fournitures, services) avec fournisseur
- Décompte = situation de travaux / facture du fournisseur
- Paiement = règlement effectué au fournisseur

Quand l'utilisateur pose une question ou demande une analyse:

1. **ANALYSE** : Écris une analyse concise et pertinente en markdown (2-4 paragraphes):
   - Commence par un titre ## décrivant l'analyse
   - Résume ce que tu vas montrer et pourquoi c'est pertinent
   - Donne des insights financiers utiles (tendances, points d'attention, recommandations)
   - Utilise des listes à puces, du **gras** pour les points importants
   - Reste professionnel et orienté finance/gestion d'investissement marocain
   - Sois spécifique au contexte InvestPro (pas de généralités vagues)

2. **VISUALISATION** : Termine TOUJOURS ta réponse par un bloc JSON dans des balises ```json``` :

```json
{
  "visualization": "bar",
  "entity": "marches",
  "groupBy": "statut",
  "metric": "count",
  "metricField": "montantHT",
  "limit": null,
  "title": "Titre du graphique",
  "confidence": 0.9,
  "explanation": ["Étape 1", "Étape 2"],
  "warnings": []
}
```

ENTITÉS DISPONIBLES: conventions, marches, projets, decomptes, paiements, fournisseurs, budgets
VISUALISATIONS: table, bar, pie, line, kpi
REGROUPEMENTS: statut, type, convention, marche, fournisseur, projet, mois, annee, zone
MÉTRIQUES: count, sum, average
CHAMPS: budget, montant, montantHT, montantTTC, budgetTotal, netAPayer, montantBrutHT, montantPaye, totalBudget

RÈGLES:
- "répartition/distribution" → pie + groupBy
- "évolution/tendance/par mois" → line + groupBy temporel
- "top N/classement" → bar + limit=N + sum
- "liste/tableau" → table
- "combien/résumé" → kpi + count
- "montant total" → kpi + sum (ou bar si groupBy)
- Choisis la visualisation la plus adaptée si non précisée
- Si aucune entité reconnue, utilise "conventions" par défaut

IMPORTANT: Le bloc ```json``` doit être le DERNIER élément de ta réponse. Ne mets rien après."""
    }

    /**
     * Stream a response with rich markdown analysis + visualization config.
     * Returns a Flux of AiStreamEvent for SSE consumption.
     */
    fun streamInstruction(instruction: String, conversationId: String?): Flux<AiStreamEvent> {
        if (!isOllamaAvailable()) {
            return Flux.just(AiStreamEvent.error("Service IA indisponible. Utilisez le mode hors-ligne."))
        }

        val sink = Sinks.many().unicast().onBackpressureBuffer<AiStreamEvent>()
        val fullResponse = StringBuilder()

        try {
            val client = getOrCreateStreamClient(conversationId)

            val responseFlux = client.prompt()
                .user(instruction)
                .stream()
                .content()

            responseFlux.subscribe(
                { chunk ->
                    if (chunk != null) {
                        fullResponse.append(chunk)
                        sink.tryEmitNext(AiStreamEvent.text(chunk))
                    }
                },
                { error ->
                    logger.warn { "Streaming error: ${error.message}" }
                    sink.tryEmitNext(AiStreamEvent.error("Erreur IA: ${error.message}"))
                    sink.tryEmitComplete()
                },
                {
                    // Stream completed - extract JSON visualization from full response
                    ollamaReady.set(true)
                    val responseText = fullResponse.toString()
                    val parsedInstruction = extractJsonInstruction(responseText)

                    if (parsedInstruction != null) {
                        sink.tryEmitNext(AiStreamEvent.visualization(parsedInstruction))
                    }

                    sink.tryEmitNext(AiStreamEvent.done())
                    sink.tryEmitComplete()
                }
            )
        } catch (e: Exception) {
            logger.warn { "Failed to start streaming: ${e.message}" }
            sink.tryEmitNext(AiStreamEvent.error("Erreur: ${e.message}"))
            sink.tryEmitComplete()
        }

        return sink.asFlux()
    }

    /**
     * Extract the JSON instruction block from the AI's markdown response.
     * Looks for ```json ... ``` at the end of the response.
     */
    private fun extractJsonInstruction(response: String): AiParsedInstruction? {
        return try {
            val jsonPattern = Regex("```json\\s*\\n?(\\{[^`]*\\})\\s*\\n?```", RegexOption.DOT_MATCHES_ALL)
            val match = jsonPattern.findAll(response).lastOrNull()

            if (match != null) {
                val jsonStr = match.groupValues[1].trim()
                objectMapper.readValue<AiParsedInstruction>(jsonStr)
            } else {
                // Fallback: try to find any JSON object in the response
                val fallbackPattern = Regex("\\{\\s*\"visualization\"\\s*:.*?\\}", RegexOption.DOT_MATCHES_ALL)
                val fallbackMatch = fallbackPattern.find(response)
                if (fallbackMatch != null) {
                    objectMapper.readValue<AiParsedInstruction>(fallbackMatch.value)
                } else {
                    logger.warn { "No JSON instruction found in AI response" }
                    null
                }
            }
        } catch (e: Exception) {
            logger.warn { "Failed to parse JSON instruction: ${e.message}" }
            null
        }
    }

    /**
     * Parse a French instruction using Ollama LLM (synchronous).
     * Returns null if Ollama is unavailable or still starting up.
     */
    fun parseInstruction(instruction: String, conversationId: String?): AiDashboardResponse? {
        if (!isOllamaAvailable()) {
            logger.debug { "Ollama not available, skipping AI parsing" }
            return null
        }

        return try {
            val client = getOrCreateSyncClient(conversationId)

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
     * Check if Ollama is available. Caches result for 30s.
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

    /** Client for synchronous JSON-only parsing (legacy endpoint) */
    private fun getOrCreateSyncClient(conversationId: String?): ChatClient {
        val key = "sync-${conversationId ?: "default"}"
        return conversationClients.getOrPut(key) {
            val memoryRepository = InMemoryChatMemoryRepository()
            val chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(memoryRepository)
                .maxMessages(20)
                .build()

            ChatClient.builder(chatModel)
                .defaultSystem(SYSTEM_PROMPT_SYNC)
                .defaultAdvisors(
                    MessageChatMemoryAdvisor.builder(chatMemory).build()
                )
                .build()
        }
    }

    /** Client for streaming with rich markdown + JSON output */
    private fun getOrCreateStreamClient(conversationId: String?): ChatClient {
        val key = "stream-${conversationId ?: "default"}"
        return conversationClients.getOrPut(key) {
            val memoryRepository = InMemoryChatMemoryRepository()
            val chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(memoryRepository)
                .maxMessages(20)
                .build()

            ChatClient.builder(chatModel)
                .defaultSystem(SYSTEM_PROMPT_STREAM)
                .defaultAdvisors(
                    MessageChatMemoryAdvisor.builder(chatMemory).build()
                )
                .build()
        }
    }
}

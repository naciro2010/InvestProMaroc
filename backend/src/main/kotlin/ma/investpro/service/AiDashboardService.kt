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

        private const val SYSTEM_PROMPT_SYNC = """Tu es un assistant expert en gestion financière d'investissements au Maroc pour la plateforme InvestPro. Tu convertis des instructions en français en requêtes JSON structurées.

RÈGLE ABSOLUE: Réponds UNIQUEMENT avec un objet JSON valide. Pas de texte, pas de markdown, pas d'explication.

CONTEXTE MÉTIER:
- Cycle financier: Convention → Projet → Marché → Décompte → Paiement
- Convention = cadre juridique (budget, taux de commission, statut)
- Projet = programme d'investissement (budgetTotal, statut)
- Marché = contrat de marchés publics avec fournisseur (montantHT, montantTTC)
- Décompte = facture/situation de travaux (montantBrutHT, netAPayer)
- Paiement = règlement effectué au fournisseur (montantPaye)
- Fournisseur = prestataire/entreprise (pas de montant propre)
- Budget = enveloppe budgétaire (totalBudget)

VALEURS AUTORISÉES (utilise UNIQUEMENT ces valeurs exactes):
- entity: conventions | marches | projets | decomptes | paiements | fournisseurs | budgets
- visualization: table | bar | pie | line | kpi
- groupBy: statut | type | convention | marche | fournisseur | projet | mois | annee | zone | null
- metric: count | sum | average
- metricField: montant | montantHT | montantTTC | budget | netAPayer

CHAMP MÉTRIQUE PAR DÉFAUT selon l'entité:
- conventions → budget
- marches → montantHT
- projets → budget
- decomptes → netAPayer
- paiements → montant
- budgets → budget
- fournisseurs → montant

RÈGLES DE CHOIX (applique dans l'ordre):
1. "répartition/distribution/proportion" → visualization="pie", metric="count" si par statut/type, "sum" si par fournisseur/projet
2. "évolution/tendance/par mois/mensuel" → visualization="line", groupBy="mois"
3. "par année/annuel" → visualization="line", groupBy="annee"
4. "top N/classement/plus gros/plus importants" → visualization="bar", limit=N (défaut 10), metric="sum"
5. "liste/tableau/afficher/montrer/tous les" → visualization="table", groupBy=null
6. "combien/nombre total/résumé/bilan" → visualization="kpi", metric="count"
7. "montant total/somme des" → visualization="kpi", metric="sum"
8. "par fournisseur" → groupBy="fournisseur", metric="sum" (les montants sont plus pertinents que le nombre)
9. "par statut" → groupBy="statut", metric="count"
10. "par type" → groupBy="type", metric="count"
11. "par zone/région/géographique" → groupBy="zone"
12. Si groupBy temporel (mois/annee) → visualization="line"
13. Si groupBy catégoriel (statut/type) sans limit → visualization="pie"
14. Si limit > 0 → visualization="bar"
15. Si aucun groupBy → visualization="table" ou "kpi"

EXEMPLES INPUT → OUTPUT:
- "marchés par statut" → entity="marches", visualization="pie", groupBy="statut", metric="count", metricField="montantHT"
- "top 5 fournisseurs" → entity="marches", visualization="bar", groupBy="fournisseur", metric="sum", metricField="montantHT", limit=5
- "combien de conventions" → entity="conventions", visualization="kpi", groupBy=null, metric="count", metricField="budget"
- "tableau des projets" → entity="projets", visualization="table", groupBy=null, metric="count", metricField="budget"
- "évolution des paiements par mois" → entity="paiements", visualization="line", groupBy="mois", metric="sum", metricField="montant"
- "répartition des décomptes par fournisseur" → entity="decomptes", visualization="bar", groupBy="fournisseur", metric="sum", metricField="netAPayer"
- "montant total des marchés" → entity="marches", visualization="kpi", groupBy=null, metric="sum", metricField="montantHT"
- "marchés par zone géographique" → entity="marches", visualization="bar", groupBy="zone", metric="count", metricField="montantHT"
- "budget des conventions par type" → entity="conventions", visualization="bar", groupBy="type", metric="sum", metricField="budget"

FORMAT JSON (STRICT, rien d'autre):
{
  "visualization": "bar",
  "entity": "marches",
  "groupBy": "statut",
  "metric": "count",
  "metricField": "montantHT",
  "limit": null,
  "title": "Titre court et descriptif en français",
  "confidence": 0.9,
  "explanation": ["Étape 1", "Étape 2"],
  "warnings": []
}"""

        private const val SYSTEM_PROMPT_STREAM = """Tu es un analyste financier expert pour InvestPro Maroc, plateforme de gestion des dépenses d'investissement public au Maroc.

CONTEXTE MÉTIER:
- Cycle: Convention (cadre juridique) → Projet (programme) → Marché (contrat fournisseur) → Décompte (facture) → Paiement (règlement)
- Convention: budget, tauxCommission, type (CADRE/SPECIFIQUE), statut
- Projet: budgetTotal, pourcentageAvancement, statut
- Marché: montantHT, montantTTC, fournisseur, typeMarche, zoneGeographique
- Décompte: montantBrutHT, netAPayer, retenues
- Paiement: montantPaye, datePaiement, modePaiement
- Fournisseur: raisonSociale, ICE, ville (pas de montant propre)

FORMAT DE RÉPONSE — DEUX PARTIES OBLIGATOIRES:

PARTIE 1 — ANALYSE MARKDOWN (2-3 paragraphes):
- Titre ## décrivant l'analyse demandée
- Explication concise de ce qui sera visualisé
- 2-3 insights métier pertinents (tendances, points d'attention)
- Utilise **gras**, listes à puces, formatage clair
- Reste spécifique au contexte InvestPro (pas de généralités)

PARTIE 2 — BLOC JSON (OBLIGATOIRE, en dernier):
Termine TOUJOURS par un bloc ```json``` contenant la configuration de visualisation.

VALEURS AUTORISÉES (STRICTEMENT):
- entity: conventions | marches | projets | decomptes | paiements | fournisseurs | budgets
- visualization: table | bar | pie | line | kpi
- groupBy: statut | type | convention | marche | fournisseur | projet | mois | annee | zone | null
- metric: count | sum | average
- metricField: montant | montantHT | montantTTC | budget | netAPayer

CHAMP MÉTRIQUE PAR DÉFAUT:
- conventions → budget
- marches → montantHT
- projets → budget
- decomptes → netAPayer
- paiements → montant
- budgets → budget
- fournisseurs → montant

RÈGLES DE SÉLECTION:
1. "répartition/distribution" + catégoriel (statut/type) → pie, metric=count
2. "répartition" + fournisseur/projet → bar, metric=sum
3. "évolution/tendance/par mois/mensuel" → line, groupBy=mois
4. "par année/annuel" → line, groupBy=annee
5. "top N/classement/plus gros" → bar, limit=N, metric=sum
6. "liste/tableau/afficher/tous les" → table, groupBy=null
7. "combien/nombre/résumé/bilan" → kpi, metric=count
8. "montant total/somme" sans groupBy → kpi, metric=sum
9. "par fournisseur" → groupBy=fournisseur, metric=sum (montants plus utiles)
10. "par statut" → groupBy=statut, metric=count
11. Si limit et groupBy → bar
12. Si groupBy temporel → line
13. Si groupBy catégoriel sans limit → pie

EXEMPLES:
- "marchés par statut" → pie, marches, groupBy=statut, count, montantHT
- "top 5 fournisseurs" → bar, marches, groupBy=fournisseur, sum, montantHT, limit=5
- "combien de conventions" → kpi, conventions, null, count, budget
- "évolution des paiements par mois" → line, paiements, groupBy=mois, sum, montant

```json
{
  "visualization": "bar",
  "entity": "marches",
  "groupBy": "statut",
  "metric": "count",
  "metricField": "montantHT",
  "limit": null,
  "title": "Titre descriptif en français",
  "confidence": 0.9,
  "explanation": ["Étape 1", "Étape 2"],
  "warnings": []
}
```

IMPORTANT: Le bloc ```json``` DOIT être le DERNIER élément. Ne mets RIEN après."""
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

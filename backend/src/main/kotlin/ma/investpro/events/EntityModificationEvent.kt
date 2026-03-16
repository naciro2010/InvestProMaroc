package ma.investpro.events

import org.springframework.context.ApplicationEvent

/**
 * Spring Event publie a chaque modification d'entite (CRUD).
 * Ecoute par EntityModificationEventListener pour:
 * 1. Persister dans entity_modifications (audit trail)
 * 2. Pousser via SSE aux clients connectes (temps reel)
 */
class EntityModificationEvent(
    source: Any,
    val entityType: String,
    val entityId: Long,
    val userId: Long,
    val userFullName: String,
    val typeModification: String,
    val description: String,
    val champsModifies: List<String> = emptyList(),
    val donneesAvant: Map<String, String>? = null,
    val donneesApres: Map<String, String>? = null
) : ApplicationEvent(source)

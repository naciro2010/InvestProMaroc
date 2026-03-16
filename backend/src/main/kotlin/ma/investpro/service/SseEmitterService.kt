package ma.investpro.service

import ma.investpro.dto.EntityModificationDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

/**
 * Service gerant les connexions SSE (Server-Sent Events).
 * Chaque client s'abonne a un flux (entityType:entityId) et recoit
 * les modifications en temps reel.
 */
@Service
class SseEmitterService {

    private val logger = LoggerFactory.getLogger(SseEmitterService::class.java)

    /** Map: "MARCHE:42" -> liste d'emitters connectes */
    private val entityEmitters = ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>>()

    /** Map: emitters globaux (tous les events) */
    private val globalEmitters = CopyOnWriteArrayList<SseEmitter>()

    companion object {
        private const val SSE_TIMEOUT_MS = 300_000L // 5 minutes
    }

    /**
     * Cree un SSE pour une entite specifique.
     * Le client recevra uniquement les events de cette entite.
     */
    fun subscribeToEntity(entityType: String, entityId: Long): SseEmitter {
        val key = buildKey(entityType, entityId)
        val emitter = createEmitter(key)

        entityEmitters.computeIfAbsent(key) { CopyOnWriteArrayList() }.add(emitter)

        emitter.onCompletion { removeEntityEmitter(key, emitter) }
        emitter.onTimeout { removeEntityEmitter(key, emitter) }
        emitter.onError { removeEntityEmitter(key, emitter) }

        // Envoyer un heartbeat initial pour confirmer la connexion
        sendHeartbeat(emitter)

        return emitter
    }

    /**
     * Cree un SSE global: le client recevra TOUS les events de modification.
     * Utile pour un dashboard temps reel ou un journal d'activite global.
     */
    fun subscribeGlobal(): SseEmitter {
        val emitter = createEmitter("global")

        globalEmitters.add(emitter)

        emitter.onCompletion { globalEmitters.remove(emitter) }
        emitter.onTimeout { globalEmitters.remove(emitter) }
        emitter.onError { globalEmitters.remove(emitter) }

        sendHeartbeat(emitter)

        return emitter
    }

    /**
     * Diffuse une modification a tous les clients abonnes:
     * 1. Les clients abonnes a cette entite specifique
     * 2. Les clients abonnes au flux global
     */
    fun broadcast(dto: EntityModificationDTO) {
        val key = buildKey(dto.entityType, dto.entityId)

        // 1. Notifier les abonnes de cette entite
        val emitters = entityEmitters[key]
        if (emitters != null) {
            val dead = mutableListOf<SseEmitter>()
            for (emitter in emitters) {
                try {
                    emitter.send(
                        SseEmitter.event()
                            .name("entity-modification")
                            .data(dto)
                    )
                } catch (e: Exception) {
                    dead.add(emitter)
                }
            }
            emitters.removeAll(dead.toSet())
            if (emitters.isEmpty()) entityEmitters.remove(key)
        }

        // 2. Notifier les abonnes globaux
        val deadGlobal = mutableListOf<SseEmitter>()
        for (emitter in globalEmitters) {
            try {
                emitter.send(
                    SseEmitter.event()
                        .name("entity-modification")
                        .data(dto)
                )
            } catch (e: Exception) {
                deadGlobal.add(emitter)
            }
        }
        globalEmitters.removeAll(deadGlobal.toSet())

        logger.debug("SSE broadcast: {} -> {} entity emitters, {} global emitters", key, emitters?.size ?: 0, globalEmitters.size)
    }

    /** Nombre total de connexions SSE actives */
    fun activeConnectionsCount(): Int {
        val entityCount = entityEmitters.values.sumOf { it.size }
        return entityCount + globalEmitters.size
    }

    private fun createEmitter(label: String): SseEmitter {
        logger.debug("SSE new emitter: {}", label)
        return SseEmitter(SSE_TIMEOUT_MS)
    }

    private fun sendHeartbeat(emitter: SseEmitter) {
        try {
            emitter.send(SseEmitter.event().name("heartbeat").data("connected"))
        } catch (e: Exception) {
            logger.debug("SSE heartbeat failed: {}", e.message)
        }
    }

    private fun removeEntityEmitter(key: String, emitter: SseEmitter) {
        val list = entityEmitters[key]
        if (list != null) {
            list.remove(emitter)
            if (list.isEmpty()) entityEmitters.remove(key)
        }
    }

    private fun buildKey(entityType: String, entityId: Long): String = "$entityType:$entityId"
}

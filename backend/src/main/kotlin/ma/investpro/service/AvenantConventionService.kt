package ma.investpro.service

import jakarta.transaction.Transactional
import ma.investpro.dto.*
import ma.investpro.entity.AvenantConvention
import ma.investpro.entity.Convention
import ma.investpro.entity.StatutAvenantConvention
import ma.investpro.mapper.AvenantConventionMapper
import ma.investpro.repository.AvenantConventionRepository
import ma.investpro.repository.ConventionRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

/**
 * Service pour la gestion des avenants de conventions
 */
@Service
@Transactional
class AvenantConventionService(
    private val avenantRepository: AvenantConventionRepository,
    private val conventionRepository: ConventionRepository,
    private val mapper: AvenantConventionMapper
) {

    /**
     * Crée un nouvel avenant
     */
    fun create(request: AvenantConventionRequest, userId: Long): AvenantConventionResponse {
        // Vérifie que la convention existe
        val convention = conventionRepository.findById(request.conventionId)
            .orElseThrow { IllegalArgumentException("Convention non trouvée avec l'ID: ${request.conventionId}") }

        // Vérifie que le numéro d'avenant n'existe pas déjà
        if (avenantRepository.existsByNumeroAvenant(request.numeroAvenant)) {
            throw IllegalArgumentException("Un avenant avec ce numéro existe déjà: ${request.numeroAvenant}")
        }

        // Crée le snapshot des données avant
        val donneesAvant = request.donneesAvant ?: createSnapshotFromConvention(convention)

        // Détermine l'ordre d'application
        val ordreApplication = avenantRepository.findNextOrdreApplication(convention.id ?: 0)

        // Crée l'entité
        val avenant = mapper.toEntity(request, convention)
        avenant.donneesAvant = donneesAvant
        avenant.ordreApplication = ordreApplication
        avenant.createdById = userId

        // Calcule le delta de budget si nécessaire
        if (avenant.ancienBudget != null && avenant.nouveauBudget != null) {
            avenant.calculerDeltaBudget()
        }

        // Sauvegarde
        val saved = avenantRepository.save(avenant)

        return mapper.toResponse(saved)
    }

    /**
     * Met à jour un avenant (seulement si BROUILLON)
     */
    fun update(id: Long, request: AvenantConventionRequest): AvenantConventionResponse {
        val avenant = findById(id)

        if (!avenant.isEditable()) {
            throw IllegalStateException("L'avenant ne peut plus être modifié (statut: ${avenant.statut})")
        }

        // Met à jour les champs
        mapper.updateEntity(avenant, request)

        // Recalcule le delta si nécessaire
        if (avenant.ancienBudget != null && avenant.nouveauBudget != null) {
            avenant.calculerDeltaBudget()
        }

        val saved = avenantRepository.save(avenant)
        return mapper.toResponse(saved)
    }

    /**
     * Soumet un avenant pour validation
     */
    fun soumettre(id: Long, userId: Long): AvenantConventionResponse {
        val avenant = findById(id)

        if (!avenant.canSoumettre()) {
            throw IllegalStateException("L'avenant ne peut pas être soumis (statut: ${avenant.statut})")
        }

        avenant.soumettre(userId)
        val saved = avenantRepository.save(avenant)

        return mapper.toResponse(saved)
    }

    /**
     * Valide un avenant et applique les modifications à la convention
     */
    fun valider(request: ValiderAvenantRequest, userId: Long): AvenantConventionResponse {
        val avenant = findById(request.avenantId)

        if (!avenant.canValider()) {
            throw IllegalStateException("L'avenant ne peut pas être validé (statut: ${avenant.statut})")
        }

        // Valide l'avenant
        avenant.valider(userId)
        if (request.dateEffet != null) {
            avenant.dateEffet = request.dateEffet
        }
        if (request.remarques != null) {
            avenant.remarques = request.remarques
        }

        // Applique les modifications à la convention
        applyAvenantToConvention(avenant)

        val saved = avenantRepository.save(avenant)
        return mapper.toResponse(saved)
    }

    /**
     * Rejette un avenant (retour à BROUILLON)
     */
    fun rejeter(request: RejeterAvenantRequest): AvenantConventionResponse {
        val avenant = findById(request.avenantId)

        avenant.rejeter(request.motifRejet)
        val saved = avenantRepository.save(avenant)

        return mapper.toResponse(saved)
    }

    /**
     * Supprime un avenant (seulement si BROUILLON)
     */
    fun delete(id: Long) {
        val avenant = findById(id)

        if (!avenant.isEditable()) {
            throw IllegalStateException("Seuls les avenants en brouillon peuvent être supprimés")
        }

        avenantRepository.delete(avenant)
    }

    /**
     * Récupère un avenant par ID
     */
    fun getById(id: Long): AvenantConventionResponse {
        val avenant = findById(id)
        return mapper.toResponse(avenant)
    }

    /**
     * Récupère tous les avenants d'une convention
     */
    fun getAllByConvention(conventionId: Long): List<AvenantConventionResponse> {
        val avenants = avenantRepository.findByConventionIdOrderByOrdreApplicationAsc(conventionId)
        return mapper.toResponseList(avenants)
    }

    /**
     * Récupère tous les avenants
     */
    fun getAll(): List<AvenantConventionSummary> {
        val avenants = avenantRepository.findAll()
        return mapper.toSummaryList(avenants)
    }

    /**
     * Récupère les avenants en attente de validation
     */
    fun getPendingValidation(): List<AvenantConventionSummary> {
        val avenants = avenantRepository.findAllPendingValidation()
        return mapper.toSummaryList(avenants)
    }

    /**
     * Récupère les statistiques des avenants d'une convention
     */
    fun getStatistics(conventionId: Long): Map<String, Any> {
        val stats = avenantRepository.getStatistiquesByConvention(conventionId)
        return stats ?: mapOf(
            "totalAvenants" to 0,
            "brouillons" to 0,
            "soumis" to 0,
            "valides" to 0,
            "totalDeltaBudget" to 0
        )
    }

    /**
     * Applique les modifications d'un avenant à la convention
     */
    private fun applyAvenantToConvention(avenant: AvenantConvention) {
        val convention = avenant.convention
        val modifications = avenant.modifications ?: return

        // Applique chaque modification
        modifications.forEach { (key, value) ->
            when (key) {
                "budget" -> if (value is Number) {
                    convention.budget = value.toString().toBigDecimal()
                }
                "tauxCommission" -> if (value is Number) {
                    convention.tauxCommission = value.toString().toBigDecimal()
                }
                "libelle" -> if (value is String) {
                    convention.libelle = value
                }
                "objet" -> if (value is String) {
                    convention.objet = value
                }
                "dateDebut" -> if (value is String) {
                    convention.dateDebut = LocalDate.parse(value)
                }
                "dateFin" -> if (value is String) {
                    convention.dateFin = LocalDate.parse(value)
                }
                "baseCalcul" -> if (value is String) {
                    convention.baseCalcul = value
                }
                "tauxTva" -> if (value is Number) {
                    convention.tauxTva = value.toString().toBigDecimal()
                }
                "description" -> if (value is String) {
                    convention.description = value
                }
                // Ajouter d'autres champs selon les besoins
            }
        }

        // Sauvegarde la convention modifiée
        conventionRepository.save(convention)
    }

    /**
     * Crée un snapshot des données de la convention
     */
    private fun createSnapshotFromConvention(convention: Convention): Map<String, Any?> {
        return mapOf(
            "id" to convention.id,
            "code" to convention.code,
            "numero" to convention.numero,
            "libelle" to convention.libelle,
            "objet" to convention.objet,
            "budget" to convention.budget,
            "tauxCommission" to convention.tauxCommission,
            "baseCalcul" to convention.baseCalcul,
            "tauxTva" to convention.tauxTva,
            "dateDebut" to convention.dateDebut.toString(),
            "dateFin" to convention.dateFin?.toString(),
            "dateConvention" to convention.dateConvention.toString(),
            "typeConvention" to convention.typeConvention.name,
            "statut" to convention.statut.name,
            "description" to convention.description,
            "version" to convention.version
        )
    }

    /**
     * Trouve un avenant par ID ou lance une exception
     */
    private fun findById(id: Long): AvenantConvention {
        return avenantRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Avenant non trouvé avec l'ID: $id") }
    }
}

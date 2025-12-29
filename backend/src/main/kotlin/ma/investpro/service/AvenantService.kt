package ma.investpro.service

import ma.investpro.entity.Avenant
import ma.investpro.entity.StatutAvenant
import ma.investpro.entity.StatutConvention
import ma.investpro.repository.AvenantRepository
import ma.investpro.repository.ConventionRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
@Transactional
class AvenantService(
    private val avenantRepository: AvenantRepository,
    private val conventionRepository: ConventionRepository
) {

    // ========== CRUD Operations ==========

    fun findAll(): List<Avenant> = avenantRepository.findAll()

    fun findById(id: Long): Avenant? = avenantRepository.findByIdOrNull(id)

    fun findByConvention(conventionId: Long): List<Avenant> =
        avenantRepository.findByConventionId(conventionId)

    fun findAvenantsValidesOrdonnes(conventionId: Long): List<Avenant> =
        avenantRepository.findAvenantsValidesOrdonnes(conventionId)

    fun create(avenant: Avenant): Avenant {
        require(avenant.id == null) { "Cannot create avenant with existing ID" }

        val convention = avenant.convention
        require(convention.statut == StatutConvention.VALIDEE || convention.statut == StatutConvention.EN_COURS) {
            "Les avenants ne peuvent être créés que pour des conventions VALIDÉES ou EN_COURS"
        }

        require(!avenantRepository.existsByNumeroAvenant(avenant.numeroAvenant)) {
            "Avenant avec numéro ${avenant.numeroAvenant} existe déjà"
        }

        // Calculer automatiquement la version résultante
        val nbAvenantsValides = avenantRepository.countByConventionIdAndStatut(
            convention.id!!,
            StatutAvenant.VALIDE
        )
        avenant.versionResultante = "V${nbAvenantsValides + 1}"

        // Capturer les valeurs AVANT depuis la convention actuelle
        avenant.montantAvant = convention.budget
        avenant.tauxCommissionAvant = convention.tauxCommission
        avenant.dateFinAvant = convention.dateFin

        // Par défaut, nouveau avenant en BROUILLON
        avenant.statut = StatutAvenant.BROUILLON
        avenant.isLocked = false

        return avenantRepository.save(avenant)
    }

    fun update(id: Long, avenant: Avenant): Avenant {
        val existing = findById(id)
            ?: throw IllegalArgumentException("Avenant $id introuvable")

        require(!existing.isLocked) {
            "Avenant verrouillé, impossible de modifier"
        }

        require(existing.statut == StatutAvenant.BROUILLON) {
            "Seuls les avenants en BROUILLON peuvent être modifiés"
        }

        existing.apply {
            objet = avenant.objet
            montantApres = avenant.montantApres
            tauxCommissionApres = avenant.tauxCommissionApres
            dateFinApres = avenant.dateFinApres
            justification = avenant.justification
            details = avenant.details
        }

        // Recalculer les impacts
        existing.calculerImpactMontant()
        existing.calculerImpactDelai()

        return avenantRepository.save(existing)
    }

    fun delete(id: Long) {
        val avenant = findById(id)
            ?: throw IllegalArgumentException("Avenant $id introuvable")

        require(!avenant.isLocked) {
            "Avenant verrouillé, impossible de supprimer"
        }

        require(avenant.statut == StatutAvenant.BROUILLON) {
            "Seuls les avenants en BROUILLON peuvent être supprimés"
        }

        avenantRepository.delete(avenant)
    }

    // ========== Workflow Operations ==========

    /**
     * Soumettre un avenant pour validation
     * Transition: BROUILLON → SOUMIS
     */
    fun soumettre(id: Long): Avenant {
        val avenant = findById(id)
            ?: throw IllegalArgumentException("Avenant $id introuvable")

        require(avenant.statut == StatutAvenant.BROUILLON) {
            "Seuls les avenants en BROUILLON peuvent être soumis"
        }

        // Validations métier
        validateAvenantComplete(avenant)

        avenant.statut = StatutAvenant.SOUMIS

        return avenantRepository.save(avenant)
    }

    /**
     * Valider un avenant et l'appliquer à la convention
     * Transition: SOUMIS → VALIDE
     * Crée une nouvelle version de la convention (V1, V2, V3...)
     */
    fun valider(id: Long, valideParId: Long): Avenant {
        val avenant = findById(id)
            ?: throw IllegalArgumentException("Avenant $id introuvable")

        require(avenant.statut == StatutAvenant.SOUMIS) {
            "Seuls les avenants SOUMIS peuvent être validés"
        }

        avenant.apply {
            statut = StatutAvenant.VALIDE
            dateValidation = LocalDate.now()
            this.valideParId = valideParId
            isLocked = true
        }

        // Appliquer l'avenant à la convention (mise à jour des valeurs)
        avenant.appliquerAConvention()

        avenantRepository.save(avenant)
        conventionRepository.save(avenant.convention)

        return avenant
    }

    /**
     * Rejeter un avenant soumis
     * Transition: SOUMIS → REJETE
     */
    fun rejeter(id: Long, motif: String): Avenant {
        val avenant = findById(id)
            ?: throw IllegalArgumentException("Avenant $id introuvable")

        require(avenant.statut == StatutAvenant.SOUMIS) {
            "Seuls les avenants SOUMIS peuvent être rejetés"
        }

        avenant.apply {
            statut = StatutAvenant.REJETE
            justification = (justification ?: "") + "\nRejeté: $motif"
        }

        return avenantRepository.save(avenant)
    }

    /**
     * Annuler un avenant
     */
    fun annuler(id: Long, motif: String): Avenant {
        val avenant = findById(id)
            ?: throw IllegalArgumentException("Avenant $id introuvable")

        require(avenant.statut != StatutAvenant.VALIDE) {
            "Les avenants validés ne peuvent pas être annulés"
        }

        avenant.apply {
            statut = StatutAvenant.ANNULE
            justification = (justification ?: "") + "\nAnnulé: $motif"
        }

        return avenantRepository.save(avenant)
    }

    // ========== Version consolidée ==========

    /**
     * Obtenir la version consolidée d'une convention
     * (convention de base + tous les avenants validés)
     */
    fun getVersionConsolidee(conventionId: Long): Map<String, Any?> {
        val convention = conventionRepository.findByIdOrNull(conventionId)
            ?: throw IllegalArgumentException("Convention $conventionId introuvable")

        val avenantsValides = findAvenantsValidesOrdonnes(conventionId)

        return mapOf(
            "convention" to convention,
            "versionActuelle" to (convention.version ?: "V0"),
            "avenants" to avenantsValides,
            "nombreAvenants" to avenantsValides.size,
            "montantActuel" to convention.budget,
            "tauxCommissionActuel" to convention.tauxCommission,
            "dateFinActuelle" to convention.dateFin
        )
    }

    /**
     * Obtenir l'historique des versions d'une convention
     */
    fun getHistoriqueVersions(conventionId: Long): List<Map<String, Any?>> {
        val convention = conventionRepository.findByIdOrNull(conventionId)
            ?: throw IllegalArgumentException("Convention $conventionId introuvable")

        val historique = mutableListOf<Map<String, Any?>>()

        // Version V0 (baseline)
        historique.add(
            mapOf(
                "version" to "V0",
                "date" to convention.dateValidation,
                "type" to "Convention initiale",
                "montant" to convention.budget,
                "tauxCommission" to convention.tauxCommission,
                "dateFin" to convention.dateFin
            )
        )

        // Ajouter chaque avenant validé
        val avenantsValides = findAvenantsValidesOrdonnes(conventionId)
        avenantsValides.forEach { avenant ->
            historique.add(
                mapOf(
                    "version" to avenant.versionResultante,
                    "date" to avenant.dateValidation,
                    "type" to "Avenant ${avenant.numeroAvenant}",
                    "objet" to avenant.objet,
                    "montant" to avenant.montantApres,
                    "tauxCommission" to avenant.tauxCommissionApres,
                    "dateFin" to avenant.dateFinApres,
                    "impactMontant" to avenant.impactMontant,
                    "impactDelai" to avenant.impactDelaiJours
                )
            )
        }

        return historique
    }

    // ========== Validation métier ==========

    private fun validateAvenantComplete(avenant: Avenant) {
        require(avenant.objet.isNotBlank()) { "L'objet de l'avenant est obligatoire" }
        require(avenant.numeroAvenant.isNotBlank()) { "Le numéro d'avenant est obligatoire" }

        // Au moins une modification doit être présente
        val hasModification = avenant.montantApres != null ||
                avenant.tauxCommissionApres != null ||
                avenant.dateFinApres != null

        require(hasModification) {
            "L'avenant doit contenir au moins une modification (montant, taux ou date)"
        }
    }
}

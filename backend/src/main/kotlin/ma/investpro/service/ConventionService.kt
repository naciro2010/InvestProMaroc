package ma.investpro.service

import ma.investpro.entity.Convention
import ma.investpro.entity.ConventionModification
import ma.investpro.entity.User
import ma.investpro.entity.StatutConvention
import ma.investpro.entity.TypeConvention
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.ConventionModificationRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Service
@Transactional
class ConventionService(
    private val conventionRepository: ConventionRepository,
    private val conventionModificationRepository: ConventionModificationRepository
) {

    // ========== CRUD Operations ==========

    fun findAll(): List<Convention> = conventionRepository.findAll()

    fun findById(id: Long): Convention? = conventionRepository.findByIdOrNull(id)

    fun findByCode(code: String): Convention? = conventionRepository.findByCode(code)

    fun findByStatut(statut: StatutConvention): List<Convention> =
        conventionRepository.findByStatut(statut)

    fun findConventionsActives(): List<Convention> = conventionRepository.findByActifTrue()

    fun findSousConventions(parentId: Long): List<Convention> =
        conventionRepository.findByParentConventionId(parentId)

    fun findConventionsRacine(): List<Convention> =
        conventionRepository.findByParentConventionIsNull()

    fun create(convention: Convention): Convention {
        require(convention.id == null) { "Cannot create convention with existing ID" }
        require(!conventionRepository.existsByCode(convention.code)) {
            "Convention avec code ${convention.code} existe déjà"
        }
        require(!conventionRepository.existsByNumero(convention.numero)) {
            "Convention avec numéro ${convention.numero} existe déjà"
        }

        // Par défaut, nouvelle convention en BROUILLON
        convention.statut = StatutConvention.BROUILLON
        convention.isLocked = false

        return conventionRepository.save(convention)
    }

    fun update(id: Long, convention: Convention): Convention {
        val existing = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        // Vérifier que la convention n'est pas verrouillée
        require(!existing.isLocked) {
            "Convention verrouillée, impossible de modifier. ${existing.motifVerrouillage ?: ""}"
        }

        // Seules les conventions en BROUILLON peuvent être modifiées librement
        require(existing.statut == StatutConvention.BROUILLON) {
            "Seules les conventions en BROUILLON peuvent être modifiées"
        }

        // Mise à jour des champs
        existing.apply {
            libelle = convention.libelle
            objet = convention.objet
            typeConvention = convention.typeConvention
            tauxCommission = convention.tauxCommission
            budget = convention.budget
            baseCalcul = convention.baseCalcul
            tauxTva = convention.tauxTva
            dateDebut = convention.dateDebut
            dateFin = convention.dateFin
            description = convention.description
        }

        return conventionRepository.save(existing)
    }

    fun delete(id: Long) {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(!convention.isLocked) {
            "Convention verrouillée, impossible de supprimer"
        }

        require(convention.statut == StatutConvention.BROUILLON) {
            "Seules les conventions en BROUILLON peuvent être supprimées"
        }

        conventionRepository.delete(convention)
    }

    // ========== Workflow Operations ==========

    /**
     * Soumettre une convention pour validation
     * Transition: BROUILLON → SOUMIS
     */
    fun soumettre(id: Long): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(convention.statut == StatutConvention.BROUILLON) {
            "Seules les conventions en BROUILLON peuvent être soumises"
        }

        // Validations métier avant soumission
        validateConventionComplete(convention)

        convention.statut = StatutConvention.SOUMIS
        convention.dateSoumission = LocalDate.now()

        return conventionRepository.save(convention)
    }

    /**
     * Valider une convention et créer la version V0
     * Transition: SOUMIS → VALIDEE
     */
    fun valider(id: Long, valideParId: Long): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(convention.statut == StatutConvention.SOUMIS) {
            "Seules les conventions SOUMISES peuvent être validées"
        }

        convention.apply {
            statut = StatutConvention.VALIDEE
            dateValidation = LocalDate.now()
            this.valideParId = valideParId
            version = "V0" // Création de la version baseline
            isLocked = true // Verrouillage de la convention
            motifVerrouillage = "Convention validée et verrouillée (V0 créée)"
        }

        return conventionRepository.save(convention)
    }

    /**
     * Rejeter une convention soumise
     * Transition: SOUMIS → REJETE (avec motif)
     * Le créateur peut ensuite remettre en BROUILLON pour corriger
     */
    fun rejeter(id: Long, motif: String): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(convention.statut == StatutConvention.SOUMIS) {
            "Seules les conventions SOUMISES peuvent être rejetées"
        }

        require(motif.isNotBlank()) {
            "Un motif de rejet est obligatoire"
        }

        convention.apply {
            statut = StatutConvention.REJETE
            motifRejet = motif
            dateSoumission = null // Réinitialiser la date de soumission
        }

        return conventionRepository.save(convention)
    }

    /**
     * Mettre une convention en cours d'exécution
     * Transition: VALIDEE → EN_EXECUTION
     * Nécessite que la date de début soit atteinte
     */
    fun mettreEnCours(id: Long): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(convention.statut == StatutConvention.VALIDEE) {
            "Seules les conventions VALIDEES peuvent être mises en cours"
        }

        // Vérifier que la date de début est atteinte
        val aujourdhui = LocalDate.now()
        require(!convention.dateDebut.isAfter(aujourdhui)) {
            "La date de début (${convention.dateDebut}) n'est pas encore atteinte. Date actuelle: $aujourdhui"
        }

        convention.statut = StatutConvention.EN_EXECUTION

        return conventionRepository.save(convention)
    }

    /**
     * Annuler une convention
     */
    fun annuler(id: Long, motif: String): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        convention.apply {
            statut = StatutConvention.ANNULE
            isLocked = true
            motifVerrouillage = "Annulée: $motif"
        }

        return conventionRepository.save(convention)
    }

    /**
     * Démarrer l'exécution d'une convention validée
     * Transition: VALIDEE → EN_EXECUTION
     */
    fun demarrer(id: Long): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(convention.statut == StatutConvention.VALIDEE) {
            "Seules les conventions VALIDÉES peuvent être démarrées"
        }

        convention.statut = StatutConvention.EN_EXECUTION

        return conventionRepository.save(convention)
    }

    /**
     * Marquer une convention comme achevée
     * Transition: EN_EXECUTION → ACHEVE
     */
    fun achever(id: Long): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(convention.statut == StatutConvention.EN_EXECUTION) {
            "Seules les conventions EN_EXECUTION peuvent être achevées"
        }

        convention.statut = StatutConvention.ACHEVE

        return conventionRepository.save(convention)
    }

    /**
     * Remettre une convention rejetée en brouillon pour correction
     * Transition: REJETE → BROUILLON
     * Permet au créateur de corriger et re-soumettre
     */
    fun remettreEnBrouillon(id: Long): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(convention.statut == StatutConvention.REJETE) {
            "Seules les conventions REJETEES peuvent être remises en brouillon"
        }

        convention.apply {
            statut = StatutConvention.BROUILLON
            // On garde le motif de rejet pour historique/référence
        }

        return conventionRepository.save(convention)
    }

    // ========== Sous-Conventions ==========

    /**
     * Créer une sous-convention héritant d'une convention parente
     */
    fun creerSousConvention(parentId: Long, sousConvention: Convention): Convention {
        val parent = findById(parentId)
            ?: throw IllegalArgumentException("Convention parente $parentId introuvable")

        require(parent.statut == StatutConvention.VALIDEE || parent.statut == StatutConvention.EN_EXECUTION) {
            "La convention parente doit être VALIDÉE ou EN_EXECUTION"
        }

        sousConvention.apply {
            parentConvention = parent
            statut = StatutConvention.BROUILLON

            // Si héritage activé, copier les paramètres du parent
            if (heriteParametres) {
                if (surchargeTauxCommission == null) {
                    tauxCommission = parent.getTauxCommissionEffectif()
                }
                if (surchargeBaseCalcul == null) {
                    baseCalcul = parent.getBaseCalculEffective()
                }
            }
        }

        return create(sousConvention)
    }

    // ========== Validation métier ==========

    private fun validateConventionComplete(convention: Convention) {
        require(convention.libelle.isNotBlank()) { "Le libellé est obligatoire" }
        require(convention.numero.isNotBlank()) { "Le numéro est obligatoire" }
        require(convention.budget > BigDecimal.ZERO) { "Le budget doit être supérieur à 0" }
        require(convention.tauxCommission >= BigDecimal.ZERO && convention.tauxCommission <= BigDecimal(100)) {
            "Le taux de commission doit être entre 0 et 100%"
        }

        convention.dateFin?.let { dateFin ->
            require(dateFin >= convention.dateDebut) {
                "La date de fin doit être après la date de début"
            }
        }
    }

    // ========== Statistiques ==========

    fun getStatistiques(): Map<String, Long> {
        return mapOf(
            "total" to conventionRepository.count(),
            "brouillon" to conventionRepository.countByStatut(StatutConvention.BROUILLON),
            "soumis" to conventionRepository.countByStatut(StatutConvention.SOUMIS),
            "validees" to conventionRepository.countByStatut(StatutConvention.VALIDEE),
            "enExecution" to conventionRepository.countByStatut(StatutConvention.EN_EXECUTION),
            "rejetees" to conventionRepository.countByStatut(StatutConvention.REJETE),
            "achevees" to conventionRepository.countByStatut(StatutConvention.ACHEVE),
            "annulees" to conventionRepository.countByStatut(StatutConvention.ANNULE)
        )
    }

    // ========== Gestion de l'historique des modifications ==========

    /**
     * Modifier une convention avec traçabilité complète
     * Enregistre l'état avant/après et le motif dans l'historique
     */
    fun updateWithHistory(
        id: Long,
        convention: Convention,
        motifModification: String,
        modifiePar: User
    ): Convention {
        val existing: Convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        // Vérifier que la convention n'est pas verrouillée
        require(!existing.isLocked) {
            "Convention verrouillée, impossible de modifier. ${existing.motifVerrouillage ?: ""}"
        }

        // Créer un snapshot de l'état avant modification
        val donneesAvant: Map<String, Any> = mapOf(
            "libelle" to (existing.libelle ?: ""),
            "numero" to (existing.numero ?: ""),
            "objet" to (existing.objet ?: ""),
            "typeConvention" to existing.typeConvention.name,
            "tauxCommission" to existing.tauxCommission.toString(),
            "budget" to existing.budget.toString(),
            "baseCalcul" to (existing.baseCalcul?.name ?: ""),
            "tauxTva" to existing.tauxTva.toString(),
            "dateDebut" to existing.dateDebut.toString(),
            "dateFin" to (existing.dateFin?.toString() ?: ""),
            "description" to (existing.description ?: ""),
            "statut" to existing.statut.name
        )

        // Appliquer les modifications
        existing.apply {
            libelle = convention.libelle
            numero = convention.numero
            objet = convention.objet
            typeConvention = convention.typeConvention
            tauxCommission = convention.tauxCommission
            budget = convention.budget
            baseCalcul = convention.baseCalcul
            tauxTva = convention.tauxTva
            dateDebut = convention.dateDebut
            dateFin = convention.dateFin
            description = convention.description
        }

        // Sauvegarder la convention modifiée
        val updated: Convention = conventionRepository.save(existing)

        // Créer un snapshot de l'état après modification
        val donneesApres: Map<String, Any> = mapOf(
            "libelle" to (updated.libelle ?: ""),
            "numero" to (updated.numero ?: ""),
            "objet" to (updated.objet ?: ""),
            "typeConvention" to updated.typeConvention.name,
            "tauxCommission" to updated.tauxCommission.toString(),
            "budget" to updated.budget.toString(),
            "baseCalcul" to (updated.baseCalcul?.name ?: ""),
            "tauxTva" to updated.tauxTva.toString(),
            "dateDebut" to updated.dateDebut.toString(),
            "dateFin" to (updated.dateFin?.toString() ?: ""),
            "description" to (updated.description ?: ""),
            "statut" to updated.statut.name
        )

        // Identifier les champs modifiés
        val champsModifies: List<String> = donneesAvant.keys.filter { key: String ->
            donneesAvant[key] != donneesApres[key]
        }

        // Enregistrer dans l'historique si des champs ont été modifiés
        if (champsModifies.isNotEmpty()) {
            val modification = ConventionModification(
                convention = updated,
                modifiePar = modifiePar,
                dateModification = LocalDateTime.now(),
                motifModification = motifModification,
                donneesAvant = donneesAvant,
                donneesApres = donneesApres,
                champsModifies = champsModifies,
                typeModification = determinerTypeModification(champsModifies)
            )
            conventionModificationRepository.save(modification)
        }

        return updated
    }

    /**
     * Récupérer l'historique des modifications d'une convention
     */
    fun getHistoriqueModifications(conventionId: Long): List<ConventionModification> {
        return conventionModificationRepository.findByConventionIdOrderByDateModificationDesc(conventionId)
    }

    /**
     * Récupérer les N dernières modifications d'une convention
     */
    fun getDernieresModifications(conventionId: Long, limit: Int): List<ConventionModification> {
        return conventionModificationRepository.findTopNByConventionIdOrderByDateModificationDesc(conventionId, limit)
    }

    /**
     * Vérifier si une convention a été modifiée
     */
    fun aEteModifiee(conventionId: Long): Boolean {
        return conventionModificationRepository.existsByConventionId(conventionId)
    }

    /**
     * Obtenir la dernière modification d'une convention
     */
    fun getDerniereModification(conventionId: Long): ConventionModification? {
        return conventionModificationRepository.findLastModificationByConventionId(conventionId)
    }

    /**
     * Déterminer le type de modification basé sur les champs modifiés
     */
    private fun determinerTypeModification(champsModifies: List<String>): String {
        return when {
            champsModifies.contains("statut") -> "STATUS_CHANGE"
            champsModifies.any { champ: String -> champ in listOf("tauxCommission", "baseCalcul", "tauxTva") } -> "FINANCIAL_PARAMS_CHANGE"
            champsModifies.any { champ: String -> champ in listOf("dateDebut", "dateFin") } -> "DATES_CHANGE"
            champsModifies.contains("budget") -> "BUDGET_CHANGE"
            else -> "UPDATE"
        }
    }
}

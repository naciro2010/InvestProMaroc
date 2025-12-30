package ma.investpro.service

import ma.investpro.entity.Convention
import ma.investpro.entity.StatutConvention
import ma.investpro.entity.TypeConvention
import ma.investpro.repository.ConventionRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Transactional
class ConventionService(
    private val conventionRepository: ConventionRepository
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
     * Transition: SOUMIS → BROUILLON
     */
    fun rejeter(id: Long, motif: String): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(convention.statut == StatutConvention.SOUMIS) {
            "Seules les conventions SOUMISES peuvent être rejetées"
        }

        convention.apply {
            statut = StatutConvention.BROUILLON
            dateSoumission = null
            motifVerrouillage = "Rejetée: $motif"
        }

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
     * Transition: VALIDEE → EN_COURS
     */
    fun demarrer(id: Long): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(convention.statut == StatutConvention.VALIDEE) {
            "Seules les conventions VALIDÉES peuvent être démarrées"
        }

        convention.statut = StatutConvention.EN_COURS

        return conventionRepository.save(convention)
    }

    /**
     * Marquer une convention comme achevée
     * Transition: EN_COURS → ACHEVE
     */
    fun achever(id: Long): Convention {
        val convention = findById(id)
            ?: throw IllegalArgumentException("Convention $id introuvable")

        require(convention.statut == StatutConvention.EN_COURS) {
            "Seules les conventions EN_COURS peuvent être achevées"
        }

        convention.statut = StatutConvention.ACHEVE

        return conventionRepository.save(convention)
    }

    // ========== Sous-Conventions ==========

    /**
     * Créer une sous-convention héritant d'une convention parente
     */
    fun creerSousConvention(parentId: Long, sousConvention: Convention): Convention {
        val parent = findById(parentId)
            ?: throw IllegalArgumentException("Convention parente $parentId introuvable")

        require(parent.statut == StatutConvention.VALIDEE || parent.statut == StatutConvention.EN_COURS) {
            "La convention parente doit être VALIDÉE ou EN_COURS"
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
            "enCours" to conventionRepository.countByStatut(StatutConvention.EN_COURS),
            "achevees" to conventionRepository.countByStatut(StatutConvention.ACHEVE),
            "annulees" to conventionRepository.countByStatut(StatutConvention.ANNULE)
        )
    }
}

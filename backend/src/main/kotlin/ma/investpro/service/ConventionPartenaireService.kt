package ma.investpro.service

import ma.investpro.dto.CreateConventionPartenaireRequest
import ma.investpro.entity.Convention
import ma.investpro.entity.ConventionPartenaire
import ma.investpro.entity.Partenaire
import ma.investpro.repository.ConventionPartenaireRepository
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.PartenaireRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

/**
 * Service pour la gestion des partenaires de conventions
 */
@Service
@Transactional
class ConventionPartenaireService(
    private val conventionPartenaireRepository: ConventionPartenaireRepository,
    private val conventionRepository: ConventionRepository,
    private val partenaireRepository: PartenaireRepository
) {

    /**
     * Trouve tous les partenaires d'une convention
     */
    fun findByConventionId(conventionId: Long): List<ConventionPartenaire> {
        return conventionPartenaireRepository.findByConventionId(conventionId)
    }

    /**
     * Ajoute un partenaire à une convention
     */
    fun addPartenaireToConvention(
        conventionId: Long,
        partenaireId: Long,
        budgetAlloue: BigDecimal,
        pourcentage: BigDecimal,
        estMaitreOeuvre: Boolean = false,
        estMaitreOeuvreDelegue: Boolean = false,
        remarques: String? = null
    ): ConventionPartenaire {
        // Vérifier que la convention existe
        val convention: Convention = conventionRepository.findById(conventionId)
            .orElseThrow { IllegalArgumentException("Convention $conventionId introuvable") }

        // Vérifier que le partenaire existe
        val partenaire: Partenaire = partenaireRepository.findById(partenaireId)
            .orElseThrow { IllegalArgumentException("Partenaire $partenaireId introuvable") }

        // Vérifier que le lien n'existe pas déjà
        if (conventionPartenaireRepository.existsByConventionIdAndPartenaireId(conventionId, partenaireId)) {
            throw IllegalStateException("Ce partenaire est déjà lié à cette convention")
        }

        // Vérifier que la somme des pourcentages ne dépasse pas 100%
        val existingPartenaires: List<ConventionPartenaire> = conventionPartenaireRepository.findByConventionId(conventionId)
        val totalPourcentageExistant: BigDecimal = existingPartenaires.fold(BigDecimal.ZERO) { acc, cp ->
            acc.add(cp.pourcentage)
        }
        val totalPourcentageApres: BigDecimal = totalPourcentageExistant.add(pourcentage)
        require(totalPourcentageApres <= BigDecimal(100)) {
            "La somme des pourcentages des partenaires (${totalPourcentageApres}%) dépasse 100%"
        }

        // Si on définit un nouveau MO/MOD, retirer l'ancien
        if (estMaitreOeuvre) {
            conventionPartenaireRepository.findMaitreOeuvreByConventionId(conventionId)?.let { existingMO: ConventionPartenaire ->
                existingMO.estMaitreOeuvre = false
                conventionPartenaireRepository.save(existingMO)
            }
        }

        if (estMaitreOeuvreDelegue) {
            conventionPartenaireRepository.findMaitreOeuvreDelegueByConventionId(conventionId)?.let { existingMOD: ConventionPartenaire ->
                existingMOD.estMaitreOeuvreDelegue = false
                conventionPartenaireRepository.save(existingMOD)
            }
        }

        // Calculer la commission d'intervention avec le taux effectif (héritage sous-convention)
        val tauxEffectif: BigDecimal = convention.getTauxCommissionEffectif()
        val commissionIntervention: BigDecimal = budgetAlloue.multiply(tauxEffectif).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        // Créer le lien
        val conventionPartenaire = ConventionPartenaire(
            convention = convention,
            partenaire = partenaire,
            budgetAlloue = budgetAlloue,
            pourcentage = pourcentage,
            commissionIntervention = commissionIntervention,
            estMaitreOeuvre = estMaitreOeuvre,
            estMaitreOeuvreDelegue = estMaitreOeuvreDelegue,
            remarques = remarques
        )

        return conventionPartenaireRepository.save(conventionPartenaire)
    }

    /**
     * Met à jour un partenaire d'une convention
     */
    fun updatePartenaireInConvention(
        id: Long,
        budgetAlloue: BigDecimal,
        pourcentage: BigDecimal,
        estMaitreOeuvre: Boolean,
        estMaitreOeuvreDelegue: Boolean,
        remarques: String?
    ): ConventionPartenaire {
        val conventionPartenaire: ConventionPartenaire = conventionPartenaireRepository.findById(id)
            .orElseThrow { IllegalArgumentException("ConventionPartenaire $id introuvable") }

        // Si on définit un nouveau MO/MOD, retirer l'ancien
        val conventionId: Long = conventionPartenaire.convention?.id ?: throw IllegalStateException("Convention null")

        if (estMaitreOeuvre && !conventionPartenaire.estMaitreOeuvre) {
            conventionPartenaireRepository.findMaitreOeuvreByConventionId(conventionId)?.let { existingMO: ConventionPartenaire ->
                if (existingMO.id != id) {
                    existingMO.estMaitreOeuvre = false
                    conventionPartenaireRepository.save(existingMO)
                }
            }
        }

        if (estMaitreOeuvreDelegue && !conventionPartenaire.estMaitreOeuvreDelegue) {
            conventionPartenaireRepository.findMaitreOeuvreDelegueByConventionId(conventionId)?.let { existingMOD: ConventionPartenaire ->
                if (existingMOD.id != id) {
                    existingMOD.estMaitreOeuvreDelegue = false
                    conventionPartenaireRepository.save(existingMOD)
                }
            }
        }

        // Recalculer la commission avec le taux effectif (héritage sous-convention)
        val tauxEffectif: BigDecimal = conventionPartenaire.convention?.getTauxCommissionEffectif() ?: BigDecimal.ZERO
        val commissionIntervention: BigDecimal = budgetAlloue.multiply(tauxEffectif).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        conventionPartenaire.apply {
            this.budgetAlloue = budgetAlloue
            this.pourcentage = pourcentage
            this.commissionIntervention = commissionIntervention
            this.estMaitreOeuvre = estMaitreOeuvre
            this.estMaitreOeuvreDelegue = estMaitreOeuvreDelegue
            this.remarques = remarques
        }

        return conventionPartenaireRepository.save(conventionPartenaire)
    }

    /**
     * Retire un partenaire d'une convention
     */
    fun removePartenaireFromConvention(conventionId: Long, partenaireId: Long) {
        val deleted: Int = conventionPartenaireRepository.deleteByConventionIdAndPartenaireId(conventionId, partenaireId)
        if (deleted == 0) {
            throw IllegalArgumentException("Lien convention-partenaire introuvable")
        }
    }

    /**
     * Supprime un lien par ID
     */
    fun deleteById(id: Long) {
        if (!conventionPartenaireRepository.existsById(id)) {
            throw IllegalArgumentException("ConventionPartenaire $id introuvable")
        }
        conventionPartenaireRepository.deleteById(id)
    }

    /**
     * Remplace tous les partenaires d'une convention.
     * Supprime les anciens et insère les nouveaux.
     */
    fun replaceAllForConvention(
        conventionId: Long,
        partenaires: List<CreateConventionPartenaireRequest>
    ) {
        // Supprimer tous les partenaires existants
        conventionPartenaireRepository.deleteByConventionId(conventionId)

        // Insérer les nouveaux partenaires
        partenaires.forEach { partenaireRequest ->
            addPartenaireToConvention(
                conventionId = conventionId,
                partenaireId = partenaireRequest.partenaireId,
                budgetAlloue = partenaireRequest.budgetAlloue,
                pourcentage = partenaireRequest.pourcentage,
                estMaitreOeuvre = partenaireRequest.estMaitreOeuvre,
                estMaitreOeuvreDelegue = partenaireRequest.estMaitreOeuvreDelegue,
                remarques = partenaireRequest.remarques
            )
        }
    }

    /**
     * Recalcule proportionnellement les budgets alloués des partenaires
     * lorsque le budget de la convention change (via un avenant).
     * Conserve les pourcentages, recalcule budgetAlloue et commissionIntervention.
     */
    fun recalculerProportionnellement(conventionId: Long, nouveauBudget: BigDecimal) {
        val partenaires: List<ConventionPartenaire> = conventionPartenaireRepository.findByConventionId(conventionId)

        partenaires.forEach { cp: ConventionPartenaire ->
            // Recalcule le budget alloué en gardant le même pourcentage
            cp.budgetAlloue = cp.pourcentage
                .multiply(nouveauBudget)
                .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

            // Recalcule la commission d'intervention avec le taux effectif (héritage sous-convention)
            val tauxEffectif: BigDecimal = cp.convention?.getTauxCommissionEffectif() ?: BigDecimal.ZERO
            if (tauxEffectif > BigDecimal.ZERO) {
                cp.commissionIntervention = cp.budgetAlloue
                    .multiply(tauxEffectif)
                    .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
            }
        }

        conventionPartenaireRepository.saveAll(partenaires)
    }
}

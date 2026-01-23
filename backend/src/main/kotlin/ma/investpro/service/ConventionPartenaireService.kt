package ma.investpro.service

import ma.investpro.entity.Convention
import ma.investpro.entity.ConventionPartenaire
import ma.investpro.entity.Partenaire
import ma.investpro.repository.ConventionPartenaireRepository
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.PartenaireRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

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

        // Calculer la commission d'intervention
        val commissionIntervention: BigDecimal = budgetAlloue.multiply(convention.tauxCommission).divide(BigDecimal(100))

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

        // Recalculer la commission
        val tauxCommission: BigDecimal = conventionPartenaire.convention?.tauxCommission ?: BigDecimal.ZERO
        val commissionIntervention: BigDecimal = budgetAlloue.multiply(tauxCommission).divide(BigDecimal(100))

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
}

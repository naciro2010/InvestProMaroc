package ma.investpro.service

import ma.investpro.entity.Convention
import ma.investpro.entity.Projet
import ma.investpro.entity.ProjetConvention
import ma.investpro.repository.ProjetConventionRepository
import ma.investpro.repository.ProjetRepository
import ma.investpro.repository.ConventionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service pour gérer les associations entre Projets et Conventions
 */
@Service
@Transactional
class ProjetConventionService(
    private val projetConventionRepository: ProjetConventionRepository,
    private val projetRepository: ProjetRepository,
    private val conventionRepository: ConventionRepository
) : GenericCrudService<ProjetConvention, Long>(projetConventionRepository) {

    /**
     * Crée une nouvelle association entre un projet et une convention
     */
    fun createAssociation(projetId: Long, conventionId: Long, ordre: Int = 0): ProjetConvention {
        // Vérifier que le projet existe
        val projet = projetRepository.findById(projetId)
            .orElseThrow { IllegalArgumentException("Projet non trouvé: $projetId") }

        // Vérifier que la convention existe
        val convention = conventionRepository.findById(conventionId)
            .orElseThrow { IllegalArgumentException("Convention non trouvée: $conventionId") }

        // Vérifier que l'association n'existe pas déjà
        if (projetConventionRepository.existsByProjetIdAndConventionId(projetId, conventionId)) {
            throw IllegalArgumentException("Cette association existe déjà")
        }

        val association = ProjetConvention(
            projet = projet,
            convention = convention,
            ordre = ordre
        )

        return projetConventionRepository.save(association)
    }

    /**
     * Récupère toutes les conventions associées à un projet (avec fetch join)
     */
    fun getConventionsByProjetId(projetId: Long): List<ProjetConvention> {
        return projetConventionRepository.findByProjetIdWithFetch(projetId)
    }

    /**
     * Récupère tous les projets associés à une convention (avec fetch join)
     */
    fun getProjetsByConventionId(conventionId: Long): List<ProjetConvention> {
        return projetConventionRepository.findByConventionIdWithFetch(conventionId)
    }

    /**
     * Supprime une association spécifique
     */
    fun deleteAssociation(projetId: Long, conventionId: Long) {
        if (!projetConventionRepository.existsByProjetIdAndConventionId(projetId, conventionId)) {
            throw IllegalArgumentException("Association non trouvée")
        }
        projetConventionRepository.deleteByProjetIdAndConventionId(projetId, conventionId)
    }

    /**
     * Met à jour l'ordre d'une association
     */
    fun updateOrdre(id: Long, nouvelOrdre: Int): ProjetConvention? {
        val association = projetConventionRepository.findById(id).orElse(null)
        if (association != null) {
            association.ordre = nouvelOrdre
            return projetConventionRepository.save(association)
        }
        return null
    }

    /**
     * Réordonne les conventions d'un projet
     */
    fun reorderConventions(projetId: Long, ordres: Map<Long, Int>) {
        val associations = projetConventionRepository.findByProjetIdOrderByOrdre(projetId)
        associations.forEach { association ->
            val nouvelOrdre = ordres[association.convention?.id]
            if (nouvelOrdre != null) {
                association.ordre = nouvelOrdre
                projetConventionRepository.save(association)
            }
        }
    }

    /**
     * Supprime toutes les associations d'un projet (appelé en cascade)
     */
    fun deleteByProjetId(projetId: Long) {
        projetConventionRepository.deleteByProjetId(projetId)
    }

    /**
     * Supprime toutes les associations d'une convention (appelé en cascade)
     */
    fun deleteByConventionId(conventionId: Long) {
        projetConventionRepository.deleteByConventionId(conventionId)
    }
}

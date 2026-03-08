package ma.investpro.repository

import ma.investpro.entity.ConventionPartenaire
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

/**
 * Repository pour l'entité ConventionPartenaire
 * Gestion des partenaires associés aux conventions
 */
@Repository
interface ConventionPartenaireRepository : JpaRepository<ConventionPartenaire, Long> {

    /**
     * Trouve tous les partenaires d'une convention
     */
    fun findByConventionId(conventionId: Long): List<ConventionPartenaire>

    /**
     * Trouve toutes les conventions d'un partenaire
     */
    fun findByPartenaireId(partenaireId: Long): List<ConventionPartenaire>

    /**
     * Vérifie si un partenaire est déjà lié à une convention
     */
    fun existsByConventionIdAndPartenaireId(conventionId: Long, partenaireId: Long): Boolean

    /**
     * Trouve le maître d'œuvre d'une convention (s'il existe)
     */
    @Query("SELECT cp FROM ConventionPartenaire cp WHERE cp.convention.id = :conventionId AND cp.estMaitreOeuvre = true")
    fun findMaitreOeuvreByConventionId(@Param("conventionId") conventionId: Long): ConventionPartenaire?

    /**
     * Trouve le maître d'œuvre délégué d'une convention (s'il existe)
     */
    @Query("SELECT cp FROM ConventionPartenaire cp WHERE cp.convention.id = :conventionId AND cp.estMaitreOeuvreDelegue = true")
    fun findMaitreOeuvreDelegueByConventionId(@Param("conventionId") conventionId: Long): ConventionPartenaire?

    /**
     * Compte les partenaires d'une convention
     */
    fun countByConventionId(conventionId: Long): Long

    /**
     * Supprime un partenaire d'une convention
     */
    fun deleteByConventionIdAndPartenaireId(conventionId: Long, partenaireId: Long): Int

    /**
     * Supprime tous les partenaires d'une convention
     */
    fun deleteByConventionId(conventionId: Long)
}

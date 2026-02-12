package ma.investpro.repository

import ma.investpro.entity.ProjetConvention
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

/**
 * Repository pour l'entité ProjetConvention
 */
@Repository
interface ProjetConventionRepository : JpaRepository<ProjetConvention, Long> {

    /**
     * Trouve toutes les conventions associées à un projet (sans fetch join)
     */
    fun findByProjetIdOrderByOrdre(projetId: Long): List<ProjetConvention>

    /**
     * Trouve tous les projets associés à une convention (sans fetch join)
     */
    fun findByConventionIdOrderByOrdre(conventionId: Long): List<ProjetConvention>

    /**
     * Trouve toutes les conventions associées à un projet avec les entités chargées
     */
    @Query(
        "SELECT pc FROM ProjetConvention pc " +
        "JOIN FETCH pc.projet p " +
        "JOIN FETCH pc.convention c " +
        "WHERE p.id = :projetId " +
        "ORDER BY pc.ordre"
    )
    fun findByProjetIdWithFetch(projetId: Long): List<ProjetConvention>

    /**
     * Trouve tous les projets associés à une convention avec les entités chargées
     */
    @Query(
        "SELECT pc FROM ProjetConvention pc " +
        "JOIN FETCH pc.projet p " +
        "JOIN FETCH pc.convention c " +
        "WHERE c.id = :conventionId " +
        "ORDER BY pc.ordre"
    )
    fun findByConventionIdWithFetch(conventionId: Long): List<ProjetConvention>

    /**
     * Récupère toutes les associations avec les entités chargées
     */
    @Query(
        "SELECT pc FROM ProjetConvention pc " +
        "JOIN FETCH pc.projet p " +
        "JOIN FETCH pc.convention c " +
        "ORDER BY pc.ordre"
    )
    fun findAllWithFetch(): List<ProjetConvention>

    /**
     * Vérifie si une association existe entre un projet et une convention
     */
    fun existsByProjetIdAndConventionId(projetId: Long, conventionId: Long): Boolean

    /**
     * Supprime une association spécifique
     */
    fun deleteByProjetIdAndConventionId(projetId: Long, conventionId: Long)

    /**
     * Supprime toutes les associations d'un projet
     */
    fun deleteByProjetId(projetId: Long)

    /**
     * Supprime toutes les associations d'une convention
     */
    fun deleteByConventionId(conventionId: Long)

    /**
     * Récupère une association avec ses entités chargées
     */
    @Query(
        "SELECT pc FROM ProjetConvention pc " +
        "JOIN FETCH pc.projet p " +
        "JOIN FETCH pc.convention c " +
        "WHERE p.id = :projetId AND c.id = :conventionId"
    )
    fun findByProjetIdAndConventionIdWithFetch(projetId: Long, conventionId: Long): ProjetConvention?
}

package ma.investpro.repository

import ma.investpro.entity.Avenant
import ma.investpro.entity.StatutAvenant
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface AvenantRepository : JpaRepository<Avenant, Long> {

    // Recherche par convention
    fun findByConventionId(conventionId: Long): List<Avenant>

    // Recherche par convention et statut
    fun findByConventionIdAndStatut(conventionId: Long, statut: StatutAvenant): List<Avenant>

    // Recherche par numéro d'avenant
    fun findByNumeroAvenant(numeroAvenant: String): Avenant?

    // Recherche par statut
    fun findByStatut(statut: StatutAvenant): List<Avenant>

    // Recherche des avenants validés d'une convention (ordre chronologique)
    @Query("SELECT a FROM Avenant a WHERE a.convention.id = :conventionId AND a.statut = 'VALIDE' ORDER BY a.dateValidation ASC")
    fun findAvenantsValidesOrdonnes(conventionId: Long): List<Avenant>

    // Recherche des avenants verrouillés
    fun findByIsLockedTrue(): List<Avenant>

    // Compter les avenants par convention
    fun countByConventionId(conventionId: Long): Long

    // Compter les avenants validés par convention
    fun countByConventionIdAndStatut(conventionId: Long, statut: StatutAvenant): Long

    // Vérifier si un numéro d'avenant existe déjà
    fun existsByNumeroAvenant(numeroAvenant: String): Boolean

    // Dernier avenant validé d'une convention
    @Query("SELECT a FROM Avenant a WHERE a.convention.id = :conventionId AND a.statut = 'VALIDE' ORDER BY a.dateValidation DESC LIMIT 1")
    fun findDernierAvenantValide(conventionId: Long): Avenant?
}

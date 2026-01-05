package ma.investpro.repository

import ma.investpro.entity.Projet
import ma.investpro.entity.StatutProjet
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface ProjetRepository : JpaRepository<Projet, Long> {

    // Recherche par code
    fun findByCode(code: String): Projet?

    // Vérifier l'existence
    fun existsByCode(code: String): Boolean

    // Recherche par statut
    fun findByStatut(statut: StatutProjet): List<Projet>

    // Recherche par convention
    fun findByConventionId(conventionId: Long): List<Projet>

    // Recherche par chef de projet
    fun findByChefProjetId(chefProjetId: Long): List<Projet>

    // Projets actifs (EN_PREPARATION ou EN_COURS)
    @Query("SELECT p FROM Projet p WHERE p.statut IN ('EN_PREPARATION', 'EN_COURS') AND p.actif = true ORDER BY p.dateDebut DESC")
    fun findProjetsActifs(): List<Projet>

    // Projets en retard
    @Query("SELECT p FROM Projet p WHERE p.dateFinPrevue < :aujourd AND p.statut NOT IN ('TERMINE', 'ANNULE') AND p.actif = true")
    fun findProjetsEnRetard(aujourd: LocalDate = LocalDate.now()): List<Projet>

    // Projets par période
    @Query("SELECT p FROM Projet p WHERE p.dateDebut >= :debut AND p.dateDebut <= :fin AND p.actif = true ORDER BY p.dateDebut DESC")
    fun findByPeriode(debut: LocalDate, fin: LocalDate): List<Projet>

    // Statistiques par statut
    fun countByStatut(statut: StatutProjet): Long

    // Recherche textuelle
    @Query("SELECT p FROM Projet p WHERE LOWER(p.nom) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%', :query, '%')) AND p.actif = true")
    fun search(query: String): List<Projet>
}

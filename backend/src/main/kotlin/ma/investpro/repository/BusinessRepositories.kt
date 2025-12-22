package ma.investpro.repository

import ma.investpro.entity.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ConventionRepository : JpaRepository<Convention, Long> {
    fun findByCode(code: String): Optional<Convention>
    fun findByActifTrue(): List<Convention>
    fun existsByCode(code: String): Boolean

    @Query("SELECT c FROM Convention c WHERE c.actif = true AND (c.dateFin IS NULL OR c.dateFin >= CURRENT_DATE)")
    fun findActiveConventions(): List<Convention>
}

@Repository
interface ProjetRepository : JpaRepository<Projet, Long> {
    fun findByCode(code: String): Optional<Projet>
    fun findByActifTrue(): List<Projet>
    fun existsByCode(code: String): Boolean
    fun findByStatut(statut: String): List<Projet>
}

@Repository
interface FournisseurRepository : JpaRepository<Fournisseur, Long> {
    fun findByCode(code: String): Optional<Fournisseur>
    fun findByActifTrue(): List<Fournisseur>
    fun existsByCode(code: String): Boolean
    fun existsByIce(ice: String): Boolean
    fun findByNonResidentTrue(): List<Fournisseur>
}

@Repository
interface AxeAnalytiqueRepository : JpaRepository<AxeAnalytique, Long> {
    fun findByCode(code: String): Optional<AxeAnalytique>
    fun findByActifTrue(): List<AxeAnalytique>
    fun existsByCode(code: String): Boolean
    fun findByType(type: String): List<AxeAnalytique>
}

@Repository
interface CompteBancaireRepository : JpaRepository<CompteBancaire, Long> {
    fun findByCode(code: String): Optional<CompteBancaire>
    fun findByRib(rib: String): Optional<CompteBancaire>
    fun findByActifTrue(): List<CompteBancaire>
    fun existsByCode(code: String): Boolean
    fun existsByRib(rib: String): Boolean
}

@Repository
interface DepenseInvestissementRepository : JpaRepository<DepenseInvestissement, Long> {
    fun findByNumeroFacture(numeroFacture: String): Optional<DepenseInvestissement>
    fun findByFournisseurId(fournisseurId: Long): List<DepenseInvestissement>
    fun findByProjetId(projetId: Long): List<DepenseInvestissement>
    fun findByPayeTrue(): List<DepenseInvestissement>
    fun findByPayeFalse(): List<DepenseInvestissement>

    @Query("SELECT d FROM DepenseInvestissement d WHERE YEAR(d.dateFacture) = :year")
    fun findByYear(year: Int): List<DepenseInvestissement>
}

@Repository
interface CommissionRepository : JpaRepository<Commission, Long> {
    fun findByDepenseId(depenseId: Long): Optional<Commission>
    fun findByConventionId(conventionId: Long): List<Commission>

    @Query("SELECT c FROM Commission c WHERE YEAR(c.dateCalcul) = :year")
    fun findByYear(year: Int): List<Commission>
}

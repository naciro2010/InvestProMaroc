package ma.investpro.repository

import ma.investpro.entity.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ConventionRepository : JpaRepository<Convention, Long> {
    fun findByCode(code: String): Optional<Convention>
    fun findByNumero(numero: String): Optional<Convention>
    fun findByActifTrue(): List<Convention>
    fun existsByCode(code: String): Boolean
    fun existsByNumero(numero: String): Boolean

    // XCOMPTA - Requêtes par type et statut
    fun findByTypeConvention(type: TypeConvention): List<Convention>
    fun findByStatut(statut: StatutConvention): List<Convention>

    @Query("SELECT c FROM Convention c WHERE c.actif = true AND (c.dateFin IS NULL OR c.dateFin >= CURRENT_DATE)")
    fun findActiveConventions(): List<Convention>

    @Query("SELECT c FROM Convention c WHERE YEAR(c.dateConvention) = :year")
    fun findByYear(year: Int): List<Convention>

    @Query("SELECT c FROM Convention c WHERE c.statut = 'EN_COURS' AND c.dateFinPrevue < CURRENT_DATE")
    fun findConventionsEnRetard(): List<Convention>
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

@Repository
interface MarcheRepository : JpaRepository<Marche, Long> {
    fun findByNumeroMarche(numeroMarche: String): Optional<Marche>
    fun findByProjetId(projetId: Long): List<Marche>
    fun findByFournisseurId(fournisseurId: Long): List<Marche>
    fun findByStatut(statut: StatutMarche): List<Marche>
    fun existsByNumeroMarche(numeroMarche: String): Boolean

    @Query("SELECT m FROM Marche m WHERE YEAR(m.dateMarche) = :year")
    fun findByYear(year: Int): List<Marche>

    @Query("SELECT m FROM Marche m WHERE m.statut = 'EN_COURS' AND m.dateFinPrevue < CURRENT_DATE")
    fun findMarchesEnRetard(): List<Marche>
}

@Repository
interface AvenantRepository : JpaRepository<Avenant, Long> {
    fun findByConventionId(conventionId: Long): List<Avenant>
    fun findByNumeroAvenant(numeroAvenant: String): Optional<Avenant>
    fun findByStatut(statut: StatutAvenant): List<Avenant>
    fun existsByNumeroAvenant(numeroAvenant: String): Boolean

    @Query("SELECT a FROM Avenant a WHERE a.convention.id = :conventionId ORDER BY a.dateAvenant DESC")
    fun findByConventionOrderByDateDesc(conventionId: Long): List<Avenant>

    @Query("SELECT a FROM Avenant a WHERE a.convention.id = :conventionId AND a.statut = 'VALIDE' ORDER BY a.versionResultante DESC")
    fun findValidatedByConvention(conventionId: Long): List<Avenant>
}

@Repository
interface BonCommandeRepository : JpaRepository<BonCommande, Long> {
    fun findByNumero(numero: String): Optional<BonCommande>
    fun findByMarcheId(marcheId: Long): List<BonCommande>
    fun findByFournisseurId(fournisseurId: Long): List<BonCommande>
    fun findByStatut(statut: StatutBonCommande): List<BonCommande>
    fun existsByNumero(numero: String): Boolean

    @Query("SELECT b FROM BonCommande b WHERE YEAR(b.dateBonCommande) = :year")
    fun findByYear(year: Int): List<BonCommande>
}

@Repository
interface DecompteRepository : JpaRepository<Decompte, Long> {
    fun findByNumeroDecompte(numeroDecompte: String): List<Decompte>
    fun findByMarcheId(marcheId: Long): List<Decompte>
    fun findByFournisseurId(fournisseurId: Long): List<Decompte>
    fun findByStatut(statut: StatutDecompte): List<Decompte>
    fun findByTypeDecompte(type: TypeDecompte): List<Decompte>

    @Query("SELECT d FROM Decompte d WHERE d.marche.id = :marcheId ORDER BY d.numeroSituation ASC")
    fun findByMarcheOrderBySituation(marcheId: Long): List<Decompte>

    @Query("SELECT d FROM Decompte d WHERE YEAR(d.dateDecompte) = :year")
    fun findByYear(year: Int): List<Decompte>

    @Query("SELECT SUM(d.montantTtc) FROM Decompte d WHERE d.marche.id = :marcheId AND d.statut IN ('VALIDE', 'PAYE')")
    fun getTotalPayeByMarche(marcheId: Long): java.math.BigDecimal?
}

// ==================== XCOMPTA Repositories ====================

@Repository
interface PartenaireRepository : JpaRepository<Partenaire, Long> {
    fun findByCode(code: String): Optional<Partenaire>
    fun findByActifTrue(): List<Partenaire>
    fun existsByCode(code: String): Boolean
    fun findByTypePartenaire(type: String): List<Partenaire>
}

@Repository
interface ConventionPartenaireRepository : JpaRepository<ConventionPartenaire, Long> {
    fun findByConventionId(conventionId: Long): List<ConventionPartenaire>
    fun findByPartenaireId(partenaireId: Long): List<ConventionPartenaire>

    @Query("SELECT cp FROM ConventionPartenaire cp WHERE cp.convention.id = :conventionId AND cp.estMaitreOeuvre = true")
    fun findMaitresOeuvreByConvention(conventionId: Long): List<ConventionPartenaire>

    @Query("SELECT cp FROM ConventionPartenaire cp WHERE cp.convention.id = :conventionId AND cp.estMaitreOeuvreDelegue = true")
    fun findMaitresOeuvreDeleguesByConvention(conventionId: Long): List<ConventionPartenaire>
}

@Repository
interface ImputationPrevisionnelleRepository : JpaRepository<ImputationPrevisionnelle, Long> {
    fun findByConventionId(conventionId: Long): List<ImputationPrevisionnelle>
    fun findByProjetId(projetId: Long): List<ImputationPrevisionnelle>
    fun findByAxeAnalytiqueId(axeId: Long): List<ImputationPrevisionnelle>
}

@Repository
interface VersementPrevisionnelRepository : JpaRepository<VersementPrevisionnel, Long> {
    fun findByConventionId(conventionId: Long): List<VersementPrevisionnel>
    fun findByPartenaireId(partenaireId: Long): List<VersementPrevisionnel>
    fun findByProjetId(projetId: Long): List<VersementPrevisionnel>

    @Query("SELECT SUM(v.montant) FROM VersementPrevisionnel v WHERE v.convention.id = :conventionId")
    fun getTotalVersementsByConvention(conventionId: Long): java.math.BigDecimal?

    @Query("SELECT v FROM VersementPrevisionnel v WHERE YEAR(v.dateVersement) = :year")
    fun findByYear(year: Int): List<VersementPrevisionnel>
}

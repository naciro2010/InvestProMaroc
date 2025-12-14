package ma.investpro.repository;

import ma.investpro.entity.DepenseInvestissement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DepenseInvestissementRepository extends JpaRepository<DepenseInvestissement, Long> {

    List<DepenseInvestissement> findByProjetId(Long projetId);

    List<DepenseInvestissement> findByFournisseurId(Long fournisseurId);

    List<DepenseInvestissement> findByConventionId(Long conventionId);

    List<DepenseInvestissement> findByAxeAnalytiqueId(Long axeAnalytiqueId);

    List<DepenseInvestissement> findByPaye(Boolean paye);

    List<DepenseInvestissement> findByDateFactureBetween(LocalDate dateDebut, LocalDate dateFin);

    @Query("SELECT d FROM DepenseInvestissement d WHERE " +
           "(:projetId IS NULL OR d.projet.id = :projetId) AND " +
           "(:fournisseurId IS NULL OR d.fournisseur.id = :fournisseurId) AND " +
           "(:conventionId IS NULL OR d.convention.id = :conventionId) AND " +
           "(:axeId IS NULL OR d.axeAnalytique.id = :axeId) AND " +
           "(:paye IS NULL OR d.paye = :paye) AND " +
           "(:dateDebut IS NULL OR d.dateFacture >= :dateDebut) AND " +
           "(:dateFin IS NULL OR d.dateFacture <= :dateFin)")
    List<DepenseInvestissement> findByFilters(
        @Param("projetId") Long projetId,
        @Param("fournisseurId") Long fournisseurId,
        @Param("conventionId") Long conventionId,
        @Param("axeId") Long axeId,
        @Param("paye") Boolean paye,
        @Param("dateDebut") LocalDate dateDebut,
        @Param("dateFin") LocalDate dateFin
    );

    @Query("SELECT SUM(d.montantTtc) FROM DepenseInvestissement d WHERE d.projet.id = :projetId")
    Double sumMontantTtcByProjet(@Param("projetId") Long projetId);

    @Query("SELECT SUM(d.montantTtc) FROM DepenseInvestissement d WHERE d.paye = true")
    Double sumMontantTtcPaye();

    @Query("SELECT SUM(d.montantTtc) FROM DepenseInvestissement d WHERE d.paye = false")
    Double sumMontantTtcNonPaye();
}

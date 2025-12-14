package ma.investpro.repository;

import ma.investpro.entity.Commission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Long> {

    Optional<Commission> findByDepenseId(Long depenseId);

    List<Commission> findByConventionId(Long conventionId);

    List<Commission> findByDateCalculBetween(LocalDate dateDebut, LocalDate dateFin);

    @Query("SELECT c FROM Commission c WHERE " +
           "c.depense.projet.id = :projetId")
    List<Commission> findByProjetId(@Param("projetId") Long projetId);

    @Query("SELECT c FROM Commission c WHERE " +
           "c.depense.fournisseur.id = :fournisseurId")
    List<Commission> findByFournisseurId(@Param("fournisseurId") Long fournisseurId);

    @Query("SELECT SUM(c.montantCommissionTtc) FROM Commission c")
    Double sumMontantCommissionTtc();

    @Query("SELECT SUM(c.montantCommissionTtc) FROM Commission c WHERE " +
           "c.dateCalcul BETWEEN :dateDebut AND :dateFin")
    Double sumMontantCommissionTtcByPeriode(
        @Param("dateDebut") LocalDate dateDebut,
        @Param("dateFin") LocalDate dateFin
    );
}

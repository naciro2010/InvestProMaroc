package ma.investpro.repository;

import ma.investpro.entity.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {

    Optional<Fournisseur> findByCode(String code);

    Optional<Fournisseur> findByIce(String ice);

    List<Fournisseur> findByActifTrue();

    List<Fournisseur> findByNonResident(Boolean nonResident);

    boolean existsByCode(String code);

    boolean existsByIce(String ice);

    @Query("SELECT f FROM Fournisseur f WHERE " +
           "LOWER(f.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.raisonSociale) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.ice) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Fournisseur> search(@Param("search") String search);
}

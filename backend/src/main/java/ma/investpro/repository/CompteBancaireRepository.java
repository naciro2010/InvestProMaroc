package ma.investpro.repository;

import ma.investpro.entity.CompteBancaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompteBancaireRepository extends JpaRepository<CompteBancaire, Long> {

    Optional<CompteBancaire> findByCode(String code);

    Optional<CompteBancaire> findByRib(String rib);

    List<CompteBancaire> findByActifTrue();

    List<CompteBancaire> findByTypeCompte(String typeCompte);

    boolean existsByCode(String code);

    boolean existsByRib(String rib);

    @Query("SELECT c FROM CompteBancaire c WHERE " +
           "LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.rib) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.banque) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<CompteBancaire> search(@Param("search") String search);
}

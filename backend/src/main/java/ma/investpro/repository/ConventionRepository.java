package ma.investpro.repository;

import ma.investpro.entity.Convention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConventionRepository extends JpaRepository<Convention, Long> {

    Optional<Convention> findByCode(String code);

    List<Convention> findByActifTrue();

    @Query("SELECT c FROM Convention c WHERE c.actif = true " +
           "AND c.dateDebut <= :date " +
           "AND (c.dateFin IS NULL OR c.dateFin >= :date)")
    List<Convention> findActiveAtDate(@Param("date") LocalDate date);

    boolean existsByCode(String code);

    @Query("SELECT c FROM Convention c WHERE " +
           "LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.libelle) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Convention> search(@Param("search") String search);
}

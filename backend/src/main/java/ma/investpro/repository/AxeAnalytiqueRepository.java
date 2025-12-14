package ma.investpro.repository;

import ma.investpro.entity.AxeAnalytique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AxeAnalytiqueRepository extends JpaRepository<AxeAnalytique, Long> {

    Optional<AxeAnalytique> findByCode(String code);

    List<AxeAnalytique> findByActifTrue();

    List<AxeAnalytique> findByType(String type);

    boolean existsByCode(String code);

    @Query("SELECT a FROM AxeAnalytique a WHERE " +
           "LOWER(a.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.libelle) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<AxeAnalytique> search(@Param("search") String search);
}

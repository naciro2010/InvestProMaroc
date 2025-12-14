package ma.investpro.repository;

import ma.investpro.entity.Projet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, Long> {

    Optional<Projet> findByCode(String code);

    List<Projet> findByActifTrue();

    List<Projet> findByStatut(String statut);

    boolean existsByCode(String code);

    @Query("SELECT p FROM Projet p WHERE " +
           "LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Projet> search(@Param("search") String search);
}

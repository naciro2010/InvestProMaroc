package ma.investpro.repository

import ma.investpro.entity.PieceJointe
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface PieceJointeRepository : JpaRepository<PieceJointe, Long> {

    /**
     * Récupère toutes les pièces jointes actives pour une entité donnée
     */
    @Query("SELECT p FROM PieceJointe p WHERE p.typeEntite = :typeEntite AND p.entiteId = :entiteId AND p.actif = true ORDER BY p.dateUpload DESC")
    fun findByTypeEntiteAndEntiteId(
        @Param("typeEntite") typeEntite: PieceJointe.TypeEntite,
        @Param("entiteId") entiteId: Long
    ): List<PieceJointe>

    /**
     * Compte les pièces jointes actives pour une entité
     */
    @Query("SELECT COUNT(p) FROM PieceJointe p WHERE p.typeEntite = :typeEntite AND p.entiteId = :entiteId AND p.actif = true")
    fun countByTypeEntiteAndEntiteId(
        @Param("typeEntite") typeEntite: PieceJointe.TypeEntite,
        @Param("entiteId") entiteId: Long
    ): Long

    /**
     * Récupère toutes les pièces jointes actives
     */
    fun findByActifTrue(): List<PieceJointe>
}

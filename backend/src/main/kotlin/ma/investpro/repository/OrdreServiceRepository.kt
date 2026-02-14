package ma.investpro.repository

import ma.investpro.entity.OrdreService
import ma.investpro.entity.TypeOrdreService
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface OrdreServiceRepository : JpaRepository<OrdreService, Long> {

    fun findByMarcheIdOrderByDateOrdreAsc(marcheId: Long): List<OrdreService>

    fun findByMarcheIdAndTypeOrdre(marcheId: Long, typeOrdre: TypeOrdreService): List<OrdreService>

    fun countByMarcheId(marcheId: Long): Long

    @Query("SELECT os FROM OrdreService os WHERE os.marche.id = :marcheId ORDER BY os.dateOrdre ASC, os.id ASC")
    fun findAllByMarcheOrdered(@Param("marcheId") marcheId: Long): List<OrdreService>
}

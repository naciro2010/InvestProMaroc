package ma.investpro.repository

import ma.investpro.entity.TypeDepense
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TypeDepenseRepository : JpaRepository<TypeDepense, Long> {
    fun findByActifTrue(): List<TypeDepense>
    fun findByCode(code: String): TypeDepense?
    fun findByActifTrueOrderByOrdreAffichageAsc(): List<TypeDepense>
}

package ma.investpro.repository

import ma.investpro.entity.CategorieDepense
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CategorieDepenseRepository : JpaRepository<CategorieDepense, Long> {
    fun findByActifTrue(): List<CategorieDepense>
    fun findByCode(code: String): CategorieDepense?
    fun findByActifTrueOrderByOrdreAffichageAsc(): List<CategorieDepense>
}

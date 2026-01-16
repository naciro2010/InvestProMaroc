package ma.investpro.repository

import ma.investpro.entity.MaitreOeuvre
import ma.investpro.entity.TypeMaitreOeuvre
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MaitreOeuvreRepository : JpaRepository<MaitreOeuvre, Long> {
    /**
     * Trouve tous les maîtres d'œuvre actifs d'une convention
     */
    fun findByConventionIdAndActifTrue(conventionId: Long): List<MaitreOeuvre>

    /**
     * Trouve tous les MO ou MOD actifs d'une convention
     */
    fun findByConventionIdAndTypeMoAndActifTrue(conventionId: Long, typeMo: TypeMaitreOeuvre): List<MaitreOeuvre>

    /**
     * Trouve par code
     */
    fun findByCodeAndActifTrue(code: String): MaitreOeuvre?

    /**
     * Vérifie si un code existe déjà
     */
    fun existsByCodeAndActifTrue(code: String): Boolean
}

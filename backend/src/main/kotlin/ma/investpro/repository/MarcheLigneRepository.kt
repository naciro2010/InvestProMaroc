package ma.investpro.repository

import ma.investpro.entity.MarcheLigne
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface MarcheLigneRepository : JpaRepository<MarcheLigne, Long> {

    /**
     * Recherche toutes les lignes d'un marché
     */
    fun findByMarcheIdOrderByNumeroLigneAsc(marcheId: Long): List<MarcheLigne>

    /**
     * Compte le nombre de lignes d'un marché
     */
    fun countByMarcheId(marcheId: Long): Long

    /**
     * Calcule le montant total HT d'un marché
     */
    @Query("""
        SELECT COALESCE(SUM(ml.montantHT), 0)
        FROM MarcheLigne ml
        WHERE ml.marche.id = :marcheId
    """)
    fun getTotalMontantHT(@Param("marcheId") marcheId: Long): java.math.BigDecimal

    /**
     * Calcule le montant total TTC d'un marché
     */
    @Query("""
        SELECT COALESCE(SUM(ml.montantTTC), 0)
        FROM MarcheLigne ml
        WHERE ml.marche.id = :marcheId
    """)
    fun getTotalMontantTTC(@Param("marcheId") marcheId: Long): java.math.BigDecimal

    /**
     * Recherche lignes par imputation analytique (dimension spécifique)
     */
    @Query(value = """
        SELECT * FROM marche_lignes
        WHERE marche_id = :marcheId
        AND imputation_analytique @> jsonb_build_object(:dimensionCode, :valeurCode)
        ORDER BY numero_ligne
    """, nativeQuery = true)
    fun findByMarcheIdAndDimension(
        @Param("marcheId") marcheId: Long,
        @Param("dimensionCode") dimensionCode: String,
        @Param("valeurCode") valeurCode: String
    ): List<MarcheLigne>

    /**
     * Supprime toutes les lignes d'un marché
     */
    fun deleteByMarcheId(marcheId: Long)
}

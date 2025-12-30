package ma.investpro.repository

import ma.investpro.entity.Fournisseur
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface FournisseurRepository : JpaRepository<Fournisseur, Long> {

    /**
     * Recherche par code unique
     */
    fun findByCode(code: String): Fournisseur?

    /**
     * Recherche par ICE (Identifiant Commun de l'Entreprise)
     */
    fun findByIce(ice: String): Fournisseur?

    /**
     * Recherche par raison sociale (contient)
     */
    fun findByRaisonSocialeContainingIgnoreCase(raisonSociale: String): List<Fournisseur>

    /**
     * Recherche les fournisseurs actifs
     */
    fun findByActifTrue(): List<Fournisseur>

    /**
     * Recherche les fournisseurs non-résidents
     */
    fun findByNonResidentTrue(): List<Fournisseur>

    /**
     * Recherche les fournisseurs résidents
     */
    fun findByNonResidentFalse(): List<Fournisseur>

    /**
     * Vérifier si un code existe
     */
    fun existsByCode(code: String): Boolean

    /**
     * Vérifier si un ICE existe
     */
    fun existsByIce(ice: String): Boolean

    /**
     * Recherche multi-critères
     */
    @Query("""
        SELECT f FROM Fournisseur f
        WHERE (:raisonSociale IS NULL OR f.raisonSociale ILIKE CONCAT('%', :raisonSociale, '%'))
        AND (:nonResident IS NULL OR f.nonResident = :nonResident)
        AND (:actif IS NULL OR f.actif = :actif)
        ORDER BY f.raisonSociale ASC
    """)
    fun search(
        @Param("raisonSociale") raisonSociale: String?,
        @Param("nonResident") nonResident: Boolean?,
        @Param("actif") actif: Boolean?
    ): List<Fournisseur>
}

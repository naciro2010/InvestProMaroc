package ma.investpro.service

import ma.investpro.dto.*
import ma.investpro.entity.Commission
import ma.investpro.entity.DepenseInvestissement
import ma.investpro.repository.CommissionRepository
import ma.investpro.repository.DepenseInvestissementRepository
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate

private val logger = KotlinLogging.logger {}

@Service
@Transactional(readOnly = true)
class ReportingService(
    private val depenseRepository: DepenseInvestissementRepository,
    private val commissionRepository: CommissionRepository
) {

    // ==================== RECHERCHE AVANCÉE ====================

    fun searchDepenses(criteria: DepenseSearchCriteria): List<DepenseInvestissement> {
        logger.info { "Recherche dépenses avec critères: $criteria" }

        var depenses = depenseRepository.findAll()

        criteria.dateDebut?.let { dateDebut ->
            depenses = depenses.filter { it.dateFacture >= dateDebut }
        }

        criteria.dateFin?.let { dateFin ->
            depenses = depenses.filter { it.dateFacture <= dateFin }
        }

        criteria.fournisseurId?.let { fournisseurId ->
            depenses = depenses.filter { it.fournisseur?.id == fournisseurId }
        }

        criteria.conventionId?.let { conventionId ->
            depenses = depenses.filter { it.convention?.id == conventionId }
        }

        criteria.compteBancaireId?.let { compteId ->
            depenses = depenses.filter { it.compteBancaire?.id == compteId }
        }

        criteria.paye?.let { paye ->
            depenses = depenses.filter { it.paye == paye }
        }

        criteria.annee?.let { annee ->
            depenses = depenses.filter { it.dateFacture.year == annee }
        }

        criteria.mois?.let { mois ->
            depenses = depenses.filter { it.dateFacture.monthValue == mois }
        }

        return depenses
    }

    fun searchCommissions(criteria: CommissionSearchCriteria): List<Commission> {
        logger.info { "Recherche commissions avec critères: $criteria" }

        var commissions = commissionRepository.findAll()

        criteria.dateDebut?.let { dateDebut ->
            commissions = commissions.filter { it.dateCalcul >= dateDebut }
        }

        criteria.dateFin?.let { dateFin ->
            commissions = commissions.filter { it.dateCalcul <= dateFin }
        }

        criteria.conventionId?.let { conventionId ->
            commissions = commissions.filter { it.convention?.id == conventionId }
        }

        criteria.fournisseurId?.let { fournisseurId ->
            commissions = commissions.filter { it.depense?.fournisseur?.id == fournisseurId }
        }

        criteria.annee?.let { annee ->
            commissions = commissions.filter { it.dateCalcul.year == annee }
        }

        criteria.mois?.let { mois ->
            commissions = commissions.filter { it.dateCalcul.monthValue == mois }
        }

        return commissions
    }

    // ==================== STATISTIQUES COMMISSIONS ====================

    fun getCommissionStatsByPeriod(annee: Int? = null, mois: Int? = null): List<CommissionStats> {
        var commissions = commissionRepository.findAll()

        if (annee != null) {
            commissions = commissions.filter { it.dateCalcul.year == annee }
            if (mois != null) {
                commissions = commissions.filter { it.dateCalcul.monthValue == mois }
            }
        }

        val grouped = commissions.groupBy {
            "${it.dateCalcul.year}-${it.dateCalcul.monthValue.toString().padStart(2, '0')}"
        }

        return grouped.map { (periode, commList) ->
            CommissionStats(
                periode = periode,
                nombreCommissions = commList.size.toLong(),
                totalCommissionHt = commList.sumOf { it.montantCommissionHt },
                totalTvaCommission = commList.sumOf { it.montantTvaCommission },
                totalCommissionTtc = commList.sumOf { it.montantCommissionTtc }
            )
        }.sortedByDescending { it.periode }
    }

    fun getCommissionStatsByFournisseur(fournisseurId: Long? = null): List<CommissionStats> {
        val commissions = commissionRepository.findAll()
            .filter { fournisseurId == null || it.depense?.fournisseur?.id == fournisseurId }

        val grouped = commissions.groupBy { it.depense?.fournisseur }

        return grouped.mapNotNull { (fournisseur, commList) ->
            fournisseur?.let {
                CommissionStats(
                    fournisseurId = it.id,
                    fournisseurNom = it.raisonSociale,
                    nombreCommissions = commList.size.toLong(),
                    totalCommissionHt = commList.sumOf { comm -> comm.montantCommissionHt },
                    totalTvaCommission = commList.sumOf { comm -> comm.montantTvaCommission },
                    totalCommissionTtc = commList.sumOf { comm -> comm.montantCommissionTtc }
                )
            }
        }.sortedByDescending { it.totalCommissionTtc }
    }

    fun getCommissionStatsByConvention(conventionId: Long? = null): List<CommissionStats> {
        val commissions = if (conventionId != null) {
            commissionRepository.findByConventionId(conventionId)
        } else {
            commissionRepository.findAll()
        }

        val grouped = commissions.groupBy { it.convention }

        return grouped.mapNotNull { (convention, commList) ->
            convention?.let {
                CommissionStats(
                    conventionId = it.id,
                    conventionLibelle = it.libelle,
                    nombreCommissions = commList.size.toLong(),
                    totalCommissionHt = commList.sumOf { comm -> comm.montantCommissionHt },
                    totalTvaCommission = commList.sumOf { comm -> comm.montantTvaCommission },
                    totalCommissionTtc = commList.sumOf { comm -> comm.montantCommissionTtc }
                )
            }
        }.sortedByDescending { it.totalCommissionTtc }
    }

    // ==================== STATISTIQUES DÉPENSES ====================

    fun getDepenseStatsByPeriod(annee: Int? = null, mois: Int? = null): List<DepenseStats> {
        var depenses = depenseRepository.findAll()

        if (annee != null) {
            depenses = depenses.filter { it.dateFacture.year == annee }
            if (mois != null) {
                depenses = depenses.filter { it.dateFacture.monthValue == mois }
            }
        }

        val grouped = depenses.groupBy {
            "${it.dateFacture.year}-${it.dateFacture.monthValue.toString().padStart(2, '0')}"
        }

        return grouped.map { (periode, depList) ->
            DepenseStats(
                periode = periode,
                nombreDepenses = depList.size.toLong(),
                totalMontantHt = depList.sumOf { it.montantHt },
                totalMontantTva = depList.sumOf { it.montantTva },
                totalMontantTtc = depList.sumOf { it.montantTtc },
                totalRetenueTva = depList.sumOf { it.retenueTva },
                totalRetenueIs = depList.sumOf { it.retenueIsTiers },
                totalRetenueNonResident = depList.sumOf { it.retenueNonResident },
                totalRetenueGarantie = depList.sumOf { it.retenueGarantie }
            )
        }.sortedByDescending { it.periode }
    }

    fun getDepenseStatsByFournisseur(fournisseurId: Long? = null): List<DepenseStats> {
        val depenses = if (fournisseurId != null) {
            depenseRepository.findByFournisseurId(fournisseurId)
        } else {
            depenseRepository.findAll()
        }

        val grouped = depenses.groupBy { it.fournisseur }

        return grouped.mapNotNull { (fournisseur, depList) ->
            fournisseur?.let {
                DepenseStats(
                    fournisseurId = it.id,
                    fournisseurNom = it.raisonSociale,
                    nombreDepenses = depList.size.toLong(),
                    totalMontantHt = depList.sumOf { dep -> dep.montantHt },
                    totalMontantTva = depList.sumOf { dep -> dep.montantTva },
                    totalMontantTtc = depList.sumOf { dep -> dep.montantTtc },
                    totalRetenueTva = depList.sumOf { dep -> dep.retenueTva },
                    totalRetenueIs = depList.sumOf { dep -> dep.retenueIsTiers },
                    totalRetenueNonResident = depList.sumOf { dep -> dep.retenueNonResident },
                    totalRetenueGarantie = depList.sumOf { dep -> dep.retenueGarantie }
                )
            }
        }.sortedByDescending { it.totalMontantTtc }
    }

    fun getPaiementStats(): PaiementStats {
        val allDepenses = depenseRepository.findAll()
        val payes = allDepenses.filter { it.paye }
        val enAttente = allDepenses.filter { !it.paye }

        val totalPaye = payes.sumOf { it.montantTtc }
        val totalEnAttente = enAttente.sumOf { it.montantTtc }
        val total = totalPaye.add(totalEnAttente)

        val tauxPaiement = if (total > BigDecimal.ZERO) {
            totalPaye.divide(total, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal("100"))
                .toDouble()
        } else {
            0.0
        }

        return PaiementStats(
            nombrePaiements = payes.size.toLong(),
            nombreEnAttente = enAttente.size.toLong(),
            totalPaye = totalPaye,
            totalEnAttente = totalEnAttente,
            tauxPaiement = tauxPaiement
        )
    }

    // ==================== DASHBOARD GLOBAL ====================

    fun getDashboardStats(): DashboardStats {
        val now = LocalDate.now()
        val currentYear = now.year
        val currentMonth = now.monthValue

        // Statistiques dépenses
        val allDepenses = depenseRepository.findAll()
        val depensesAnnee = allDepenses.filter { it.dateFacture.year == currentYear }
        val depensesMois = allDepenses.filter {
            it.dateFacture.year == currentYear && it.dateFacture.monthValue == currentMonth
        }

        val depenseStats = DepenseGlobalStats(
            total = allDepenses.size.toLong(),
            totalHt = allDepenses.sumOf { it.montantHt },
            totalTtc = allDepenses.sumOf { it.montantTtc },
            anneeEnCours = depensesAnnee.sumOf { it.montantTtc },
            moisEnCours = depensesMois.sumOf { it.montantTtc }
        )

        // Statistiques commissions
        val allCommissions = commissionRepository.findAll()
        val commissionsAnnee = allCommissions.filter { it.dateCalcul.year == currentYear }
        val commissionsMois = allCommissions.filter {
            it.dateCalcul.year == currentYear && it.dateCalcul.monthValue == currentMonth
        }

        val commissionStats = CommissionGlobalStats(
            total = allCommissions.size.toLong(),
            totalHt = allCommissions.sumOf { it.montantCommissionHt },
            totalTtc = allCommissions.sumOf { it.montantCommissionTtc },
            anneeEnCours = commissionsAnnee.sumOf { it.montantCommissionTtc },
            moisEnCours = commissionsMois.sumOf { it.montantCommissionTtc }
        )

        // Top fournisseurs
        val topFournisseurs = allDepenses
            .groupBy { it.fournisseur }
            .mapNotNull { (fournisseur, depenses) ->
                fournisseur?.let {
                    TopFournisseurStats(
                        fournisseurId = it.id!!,
                        fournisseurNom = it.raisonSociale,
                        montantTotal = depenses.sumOf { dep -> dep.montantTtc },
                        nombreDepenses = depenses.size.toLong()
                    )
                }
            }
            .sortedByDescending { it.montantTotal }
            .take(5)

        return DashboardStats(
            depenses = depenseStats,
            commissions = commissionStats,
            paiements = getPaiementStats(),
            topFournisseurs = topFournisseurs
        )
    }
}

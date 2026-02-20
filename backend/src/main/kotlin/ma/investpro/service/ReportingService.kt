package ma.investpro.service

import ma.investpro.dto.*
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

    fun searchDepenses(criteria: DepenseSearchCriteria): List<ma.investpro.entity.DepenseInvestissement> {
        logger.info { "Recherche dépenses avec critères: $criteria" }

        // Build date range from year/month if provided
        val dateDebut = criteria.dateDebut ?: criteria.annee?.let { annee ->
            criteria.mois?.let { mois -> LocalDate.of(annee, mois, 1) }
                ?: LocalDate.of(annee, 1, 1)
        }
        val dateFin = criteria.dateFin ?: criteria.annee?.let { annee ->
            criteria.mois?.let { mois -> LocalDate.of(annee, mois, 1).plusMonths(1).minusDays(1) }
                ?: LocalDate.of(annee, 12, 31)
        }

        return depenseRepository.searchFull(
            fournisseurId = criteria.fournisseurId,
            conventionId = criteria.conventionId,
            statut = null,
            paye = criteria.paye,
            dateDebut = dateDebut,
            dateFin = dateFin
        ).let { results ->
            // compteBancaireId filter applied post-query (already fetched via JOIN FETCH)
            if (criteria.compteBancaireId != null) {
                results.filter { it.compteBancaire?.id == criteria.compteBancaireId }
            } else {
                results
            }
        }
    }

    fun searchCommissions(criteria: CommissionSearchCriteria): List<ma.investpro.entity.Commission> {
        logger.info { "Recherche commissions avec critères: $criteria" }

        // Build date range from year/month if provided
        val dateDebut = criteria.dateDebut ?: criteria.annee?.let { annee ->
            criteria.mois?.let { mois -> LocalDate.of(annee, mois, 1) }
                ?: LocalDate.of(annee, 1, 1)
        }
        val dateFin = criteria.dateFin ?: criteria.annee?.let { annee ->
            criteria.mois?.let { mois -> LocalDate.of(annee, mois, 1).plusMonths(1).minusDays(1) }
                ?: LocalDate.of(annee, 12, 31)
        }

        return commissionRepository.searchFull(
            conventionId = criteria.conventionId,
            fournisseurId = criteria.fournisseurId,
            dateDebut = dateDebut,
            dateFin = dateFin
        )
    }

    // ==================== STATISTIQUES COMMISSIONS ====================

    fun getCommissionStatsByPeriod(annee: Int? = null, mois: Int? = null): List<CommissionStats> {
        val dateDebut = annee?.let { y ->
            mois?.let { m -> LocalDate.of(y, m, 1) } ?: LocalDate.of(y, 1, 1)
        }
        val dateFin = annee?.let { y ->
            mois?.let { m -> LocalDate.of(y, m, 1).plusMonths(1).minusDays(1) } ?: LocalDate.of(y, 12, 31)
        }

        val commissions = commissionRepository.searchFull(
            conventionId = null,
            fournisseurId = null,
            dateDebut = dateDebut,
            dateFin = dateFin
        )

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
        val commissions = if (fournisseurId != null) {
            commissionRepository.searchFull(
                conventionId = null,
                fournisseurId = fournisseurId,
                dateDebut = null,
                dateFin = null
            )
        } else {
            commissionRepository.findAllWithRelations()
        }

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
            commissionRepository.findByConventionIdWithRelations(conventionId)
        } else {
            commissionRepository.findAllWithRelations()
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
        val dateDebut = annee?.let { y ->
            mois?.let { m -> LocalDate.of(y, m, 1) } ?: LocalDate.of(y, 1, 1)
        }
        val dateFin = annee?.let { y ->
            mois?.let { m -> LocalDate.of(y, m, 1).plusMonths(1).minusDays(1) } ?: LocalDate.of(y, 12, 31)
        }

        val depenses = depenseRepository.searchFull(
            fournisseurId = null,
            conventionId = null,
            statut = null,
            paye = null,
            dateDebut = dateDebut,
            dateFin = dateFin
        )

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
            depenseRepository.searchFull(
                fournisseurId = fournisseurId,
                conventionId = null,
                statut = null,
                paye = null,
                dateDebut = null,
                dateFin = null
            )
        } else {
            depenseRepository.findAllWithRelations()
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
        val countPayes = depenseRepository.countByPaye(true)
        val countEnAttente = depenseRepository.countByPaye(false)
        val totalPaye = depenseRepository.sumMontantTtcByPaye(true)
        val totalEnAttente = depenseRepository.sumMontantTtcByPaye(false)
        val total = totalPaye.add(totalEnAttente)

        val tauxPaiement = if (total > BigDecimal.ZERO) {
            totalPaye.divide(total, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal("100"))
                .toDouble()
        } else {
            0.0
        }

        return PaiementStats(
            nombrePaiements = countPayes,
            nombreEnAttente = countEnAttente,
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

        val yearStart = LocalDate.of(currentYear, 1, 1)
        val yearEnd = LocalDate.of(currentYear, 12, 31)
        val monthStart = LocalDate.of(currentYear, currentMonth, 1)
        val monthEnd = monthStart.plusMonths(1).minusDays(1)

        // All depenses with relations pre-loaded (single query)
        val allDepenses = depenseRepository.findAllWithRelations()
        val totalHt = allDepenses.sumOf { it.montantHt }
        val totalTtc = allDepenses.sumOf { it.montantTtc }

        // Year and month filtered from already-loaded data (no extra queries)
        val depensesAnnee = allDepenses.filter { it.dateFacture in yearStart..yearEnd }
        val depensesMois = allDepenses.filter { it.dateFacture in monthStart..monthEnd }

        val depenseStats = DepenseGlobalStats(
            total = allDepenses.size.toLong(),
            totalHt = totalHt,
            totalTtc = totalTtc,
            anneeEnCours = depensesAnnee.sumOf { it.montantTtc },
            moisEnCours = depensesMois.sumOf { it.montantTtc }
        )

        // All commissions with relations pre-loaded (single query)
        val allCommissions = commissionRepository.findAllWithRelations()

        val commissionsAnnee = allCommissions.filter { it.dateCalcul in yearStart..yearEnd }
        val commissionsMois = allCommissions.filter { it.dateCalcul in monthStart..monthEnd }

        val commissionStats = CommissionGlobalStats(
            total = allCommissions.size.toLong(),
            totalHt = allCommissions.sumOf { it.montantCommissionHt },
            totalTtc = allCommissions.sumOf { it.montantCommissionTtc },
            anneeEnCours = commissionsAnnee.sumOf { it.montantCommissionTtc },
            moisEnCours = commissionsMois.sumOf { it.montantCommissionTtc }
        )

        // Top fournisseurs (relations already fetched, no N+1)
        val topFournisseurs = allDepenses
            .groupBy { it.fournisseur }
            .mapNotNull { (fournisseur, depenses) ->
                fournisseur?.let { f ->
                    f.id?.let { id ->
                        TopFournisseurStats(
                            fournisseurId = id,
                            fournisseurNom = f.raisonSociale,
                            montantTotal = depenses.sumOf { dep -> dep.montantTtc },
                            nombreDepenses = depenses.size.toLong()
                        )
                    }
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

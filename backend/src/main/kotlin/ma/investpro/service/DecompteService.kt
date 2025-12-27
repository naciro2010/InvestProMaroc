package ma.investpro.service

import ma.investpro.entity.Decompte
import ma.investpro.entity.StatutDecompte
import ma.investpro.entity.TypeDecompte
import ma.investpro.repository.DecompteRepository
import ma.investpro.repository.MarcheRepository
import ma.investpro.repository.FournisseurRepository
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

private val logger = KotlinLogging.logger {}

@Service
@Transactional
class DecompteService(
    private val decompteRepository: DecompteRepository,
    private val marcheRepository: MarcheRepository,
    private val fournisseurRepository: FournisseurRepository
) {

    fun findAll(): List<Decompte> {
        logger.info {
            """
            📋 LISTE DÉCOMPTES - DÉBUT
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        val decomptes = decompteRepository.findAll()

        logger.info {
            """
            ✅ LISTE DÉCOMPTES RÉCUPÉRÉE
            ───────────────────────────────────────────────────────────────────
            📊 Nombre total   : ${decomptes.size}
            📄 PROVISOIRE     : ${decomptes.count { it.typeDecompte == TypeDecompte.PROVISOIRE }}
            📋 DEFINITIF      : ${decomptes.count { it.typeDecompte == TypeDecompte.DEFINITIF }}
            🏁 FINAL          : ${decomptes.count { it.typeDecompte == TypeDecompte.FINAL }}
            💰 Total montant  : ${decomptes.sumOf { it.montantTtc }} MAD
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        return decomptes
    }

    fun findById(id: Long): Decompte {
        logger.info { "🔍 Recherche décompte ID: $id" }

        val decompte = decompteRepository.findById(id)
            .orElseThrow {
                logger.error { "❌ DÉCOMPTE NON TROUVÉ - ID: $id" }
                IllegalArgumentException("Décompte avec ID $id non trouvé")
            }

        logger.info {
            """
            ✅ DÉCOMPTE TROUVÉ
            ───────────────────────────────────────────────────────────────────
            🆔 ID             : ${decompte.id}
            📄 N° Décompte    : ${decompte.numeroDecompte}
            📊 N° Situation   : ${decompte.numeroSituation ?: "N/A"}
            📋 Type           : ${decompte.typeDecompte}
            💰 Montant TTC    : ${decompte.montantTtc} MAD
            📈 Cumul actuel   : ${decompte.cumulActuel} MAD
            🎯 Avancement     : ${decompte.tauxAvancement ?: 0}%
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        return decompte
    }

    fun create(decompte: Decompte): Decompte {
        logger.info {
            """
            ➕ CRÉATION DÉCOMPTE - DÉBUT
            ═══════════════════════════════════════════════════════════════════
            📄 N° Décompte    : ${decompte.numeroDecompte}
            📊 N° Situation   : ${decompte.numeroSituation ?: "N/A"}
            📋 Type           : ${decompte.typeDecompte}
            🏢 Marché ID      : ${decompte.marche?.id}
            💰 Montant TTC    : ${decompte.montantTtc} MAD
            """.trimIndent()
        }

        // Vérifier que le marché existe
        val marche = if (decompte.marche?.id != null) {
            marcheRepository.findById(decompte.marche!!.id!!)
                .orElseThrow {
                    logger.error { "❌ MARCHÉ NON TROUVÉ - ID: ${decompte.marche!!.id}" }
                    IllegalArgumentException("Marché avec ID ${decompte.marche!!.id} non trouvé")
                }
        } else {
            throw IllegalArgumentException("Le décompte doit être lié à un marché")
        }

        // Calculer les montants si nécessaire
        if (decompte.montantTva == BigDecimal.ZERO && decompte.montantHt > BigDecimal.ZERO) {
            decompte.montantTva = decompte.montantHt.multiply(decompte.tauxTva).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
            decompte.montantTtc = decompte.montantHt.add(decompte.montantTva)
            logger.debug { "💵 Calcul automatique - TVA: ${decompte.montantTva}, TTC: ${decompte.montantTtc}" }
        }

        // Calculer la retenue de garantie
        if (decompte.retenueGarantie == BigDecimal.ZERO && decompte.tauxRetenueGarantie > BigDecimal.ZERO) {
            decompte.retenueGarantie = decompte.montantTtc
                .multiply(decompte.tauxRetenueGarantie)
                .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
            logger.debug { "🔒 Retenue de garantie calculée: ${decompte.retenueGarantie} MAD (${decompte.tauxRetenueGarantie}%)" }
        }

        // Calculer le cumul automatiquement
        val decomptesPrecedents = decompteRepository.findByMarcheOrderBySituation(marche.id!!)
        decompte.cumulAnterieur = decomptesPrecedents
            .filter { it.statut == StatutDecompte.VALIDE || it.statut == StatutDecompte.PAYE }
            .sumOf { it.montantTtc }

        decompte.cumulActuel = decompte.cumulAnterieur.add(decompte.montantTtc)

        logger.info {
            """
            💰 CALCUL DES CUMULS
            ───────────────────────────────────────────────────────────────────
            📊 Décomptes validés antérieurs : ${decomptesPrecedents.size}
            💵 Cumul antérieur              : ${decompte.cumulAnterieur} MAD
            ➕ Montant actuel                : ${decompte.montantTtc} MAD
            ═══════════════════════════════════════════════════════════════════
            💰 CUMUL ACTUEL                 : ${decompte.cumulActuel} MAD
            """.trimIndent()
        }

        // Calculer le taux d'avancement
        if (marche.montantTtc > BigDecimal.ZERO) {
            decompte.tauxAvancement = decompte.cumulActuel
                .multiply(BigDecimal(100))
                .divide(marche.montantTtc, 2, RoundingMode.HALF_UP)

            logger.info {
                """
                📊 CALCUL AVANCEMENT
                ───────────────────────────────────────────────────────────────────
                💰 Marché TTC     : ${marche.montantTtc} MAD
                💵 Cumul actuel   : ${decompte.cumulActuel} MAD
                🎯 Avancement     : ${decompte.tauxAvancement}%
                ${if (decompte.tauxAvancement!! >= BigDecimal(100)) "✅ MARCHÉ COMPLÉTÉ À 100%" else ""}
                """.trimIndent()
            }
        }

        // Vérifier le dépassement
        if (decompte.cumulActuel > marche.montantTtc) {
            logger.warn {
                """
                ⚠️  DÉPASSEMENT DÉTECTÉ
                ───────────────────────────────────────────────────────────────────
                💰 Marché TTC     : ${marche.montantTtc} MAD
                💵 Cumul actuel   : ${decompte.cumulActuel} MAD
                🔴 Dépassement    : ${decompte.cumulActuel.subtract(marche.montantTtc)} MAD
                """.trimIndent()
            }
        }

        val savedDecompte = decompteRepository.save(decompte)

        logger.info {
            """
            ✅ DÉCOMPTE CRÉÉ AVEC SUCCÈS
            ───────────────────────────────────────────────────────────────────
            🆔 ID             : ${savedDecompte.id}
            📄 N° Décompte    : ${savedDecompte.numeroDecompte}
            📊 N° Situation   : ${savedDecompte.numeroSituation ?: "N/A"}
            📋 Type           : ${savedDecompte.typeDecompte}
            💰 Montant TTC    : ${savedDecompte.montantTtc} MAD
            🔒 Retenue        : ${savedDecompte.retenueGarantie} MAD
            📈 Cumul actuel   : ${savedDecompte.cumulActuel} MAD
            🎯 Avancement     : ${savedDecompte.tauxAvancement}%
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        return savedDecompte
    }

    fun update(id: Long, decompte: Decompte): Decompte {
        logger.info {
            """
            🔄 MISE À JOUR DÉCOMPTE - DÉBUT
            ═══════════════════════════════════════════════════════════════════
            🆔 ID             : $id
            📄 N° Décompte    : ${decompte.numeroDecompte}
            """.trimIndent()
        }

        val existingDecompte = decompteRepository.findById(id)
            .orElseThrow {
                logger.error { "❌ DÉCOMPTE NON TROUVÉ - ID: $id" }
                IllegalArgumentException("Décompte avec ID $id non trouvé")
            }

        // Log des changements importants
        if (existingDecompte.statut != decompte.statut) {
            logger.info { "📈 Changement statut: ${existingDecompte.statut} → ${decompte.statut}" }
        }

        if (existingDecompte.montantTtc != decompte.montantTtc) {
            logger.info { "💰 Changement montant: ${existingDecompte.montantTtc} → ${decompte.montantTtc} MAD" }
        }

        existingDecompte.apply {
            numeroDecompte = decompte.numeroDecompte
            marche = decompte.marche
            fournisseur = decompte.fournisseur
            dateDecompte = decompte.dateDecompte
            typeDecompte = decompte.typeDecompte
            numeroSituation = decompte.numeroSituation
            montantHt = decompte.montantHt
            tauxTva = decompte.tauxTva
            montantTva = decompte.montantTva
            montantTtc = decompte.montantTtc
            retenueGarantie = decompte.retenueGarantie
            tauxRetenueGarantie = decompte.tauxRetenueGarantie
            cumulAnterieur = decompte.cumulAnterieur
            cumulActuel = decompte.cumulActuel
            tauxAvancement = decompte.tauxAvancement
            statut = decompte.statut
            dateValidation = decompte.dateValidation
            datePaiement = decompte.datePaiement
            remarques = decompte.remarques
        }

        val updatedDecompte = decompteRepository.save(existingDecompte)

        logger.info {
            """
            ✅ DÉCOMPTE MIS À JOUR
            ───────────────────────────────────────────────────────────────────
            🆔 ID             : ${updatedDecompte.id}
            📈 Statut         : ${updatedDecompte.statut}
            💰 Montant TTC    : ${updatedDecompte.montantTtc} MAD
            📈 Cumul actuel   : ${updatedDecompte.cumulActuel} MAD
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        return updatedDecompte
    }

    fun delete(id: Long) {
        logger.info { "🗑️  Suppression décompte ID: $id" }

        val decompte = decompteRepository.findById(id)
            .orElseThrow {
                logger.error { "❌ DÉCOMPTE NON TROUVÉ - ID: $id" }
                IllegalArgumentException("Décompte avec ID $id non trouvé")
            }

        decompteRepository.delete(decompte)

        logger.info {
            """
            ✅ DÉCOMPTE SUPPRIMÉ
            ───────────────────────────────────────────────────────────────────
            📄 N° Décompte    : ${decompte.numeroDecompte}
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }
    }

    fun findByMarche(marcheId: Long): List<Decompte> {
        logger.info { "🔍 Recherche décomptes pour marché ID: $marcheId" }
        val decomptes = decompteRepository.findByMarcheOrderBySituation(marcheId)

        logger.info {
            """
            ✅ DÉCOMPTES DU MARCHÉ
            ───────────────────────────────────────────────────────────────────
            📊 Nombre         : ${decomptes.size}
            💰 Total          : ${decomptes.sumOf { it.montantTtc }} MAD
            🎯 Avancement     : ${decomptes.lastOrNull()?.tauxAvancement ?: 0}%
            """.trimIndent()
        }

        return decomptes
    }

    fun getTotalPaye(marcheId: Long): BigDecimal {
        val total = decompteRepository.getTotalPayeByMarche(marcheId) ?: BigDecimal.ZERO
        logger.info { "💰 Total payé pour marché $marcheId: $total MAD" }
        return total
    }
}

package ma.investpro.service

import ma.investpro.entity.Marche
import ma.investpro.entity.StatutMarche
import ma.investpro.repository.MarcheRepository
import ma.investpro.repository.FournisseurRepository
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

private val logger = KotlinLogging.logger {}

@Service
@Transactional
class MarcheService(
    private val marcheRepository: MarcheRepository,
    private val fournisseurRepository: FournisseurRepository
) {

    fun findAll(): List<Marche> {
        logger.info {
            """
            📋 LISTE MARCHÉS - DÉBUT
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        val marches = marcheRepository.findAll()

        logger.info {
            """
            ✅ LISTE MARCHÉS RÉCUPÉRÉE
            ───────────────────────────────────────────────────────────────────
            📊 Nombre total   : ${marches.size}
            🟢 EN_COURS       : ${marches.count { it.statut == StatutMarche.EN_COURS }}
            ✅ VALIDE         : ${marches.count { it.statut == StatutMarche.VALIDE }}
            🏁 TERMINE        : ${marches.count { it.statut == StatutMarche.TERMINE }}
            ❌ ANNULE         : ${marches.count { it.statut == StatutMarche.ANNULE }}
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        return marches
    }

    fun findById(id: Long): Marche {
        logger.info {
            """
            🔍 RECHERCHE MARCHÉ PAR ID
            ───────────────────────────────────────────────────────────────────
            🆔 ID             : $id
            """.trimIndent()
        }

        val marche = marcheRepository.findById(id)
            .orElseThrow {
                logger.error { "❌ MARCHÉ NON TROUVÉ - ID: $id" }
                IllegalArgumentException("Marché avec ID $id non trouvé")
            }

        logger.info {
            """
            ✅ MARCHÉ TROUVÉ
            ───────────────────────────────────────────────────────────────────
            🆔 ID             : ${marche.id}
            📄 N° Marché      : ${marche.numeroMarche}
            📋 Objet          : ${marche.objet.take(50)}...
            🏢 Fournisseur    : ${marche.fournisseur?.raisonSociale ?: "N/A"}
            💰 Montant TTC    : ${marche.montantTtc} MAD
            📈 Statut         : ${marche.statut}
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        return marche
    }

    fun create(marche: Marche): Marche {
        logger.info {
            """
            ➕ CRÉATION MARCHÉ - DÉBUT
            ═══════════════════════════════════════════════════════════════════
            📄 N° Marché      : ${marche.numeroMarche}
            📋 N° AO          : ${marche.numAo ?: "N/A"}
            📅 Date           : ${marche.dateMarche}
            🏢 Fournisseur ID : ${marche.fournisseur?.id}
            💰 Montant HT     : ${marche.montantHt} MAD
            💰 Montant TTC    : ${marche.montantTtc} MAD
            📈 Statut         : ${marche.statut}
            """.trimIndent()
        }

        // Validation
        if (marcheRepository.existsByNumeroMarche(marche.numeroMarche)) {
            logger.warn {
                """
                ⚠️  CRÉATION MARCHÉ ÉCHOUÉE - Numéro déjà existant
                ───────────────────────────────────────────────────────────────────
                📄 N° Marché      : ${marche.numeroMarche}
                """.trimIndent()
            }
            throw IllegalArgumentException("Un marché avec le numéro ${marche.numeroMarche} existe déjà")
        }

        // Vérifier que le fournisseur existe
        if (marche.fournisseur?.id != null) {
            val fournisseurExists = fournisseurRepository.existsById(marche.fournisseur!!.id!!)
            if (!fournisseurExists) {
                logger.error { "❌ FOURNISSEUR NON TROUVÉ - ID: ${marche.fournisseur!!.id}" }
                throw IllegalArgumentException("Fournisseur avec ID ${marche.fournisseur!!.id} non trouvé")
            }
        }

        // Calculer les montants si nécessaire
        if (marche.montantTva == BigDecimal.ZERO && marche.montantHt > BigDecimal.ZERO) {
            marche.montantTva = marche.montantHt.multiply(marche.tauxTva).divide(BigDecimal(100))
            marche.montantTtc = marche.montantHt.add(marche.montantTva)
            logger.debug { "💵 Calcul automatique - TVA: ${marche.montantTva}, TTC: ${marche.montantTtc}" }
        }

        val savedMarche = marcheRepository.save(marche)

        logger.info {
            """
            ✅ MARCHÉ CRÉÉ AVEC SUCCÈS
            ───────────────────────────────────────────────────────────────────
            🆔 ID             : ${savedMarche.id}
            📄 N° Marché      : ${savedMarche.numeroMarche}
            🏢 Fournisseur    : ${savedMarche.fournisseur?.raisonSociale ?: "N/A"}
            💰 Montant TTC    : ${savedMarche.montantTtc} MAD
            📈 Statut         : ${savedMarche.statut}
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        return savedMarche
    }

    fun update(id: Long, marche: Marche): Marche {
        logger.info {
            """
            🔄 MISE À JOUR MARCHÉ - DÉBUT
            ═══════════════════════════════════════════════════════════════════
            🆔 ID             : $id
            📄 N° Marché      : ${marche.numeroMarche}
            📈 Nouveau statut : ${marche.statut}
            """.trimIndent()
        }

        val existingMarche = marcheRepository.findById(id)
            .orElseThrow {
                logger.error { "❌ MARCHÉ NON TROUVÉ - ID: $id" }
                IllegalArgumentException("Marché avec ID $id non trouvé")
            }

        // Log des changements
        if (existingMarche.statut != marche.statut) {
            logger.info { "📈 Changement statut: ${existingMarche.statut} → ${marche.statut}" }
        }
        if (existingMarche.montantTtc != marche.montantTtc) {
            logger.info { "💰 Changement montant: ${existingMarche.montantTtc} → ${marche.montantTtc} MAD" }
        }

        // Mise à jour des champs
        existingMarche.apply {
            numeroMarche = marche.numeroMarche
            numAo = marche.numAo
            dateMarche = marche.dateMarche
            fournisseur = marche.fournisseur
            objet = marche.objet
            montantHt = marche.montantHt
            tauxTva = marche.tauxTva
            montantTva = marche.montantTva
            montantTtc = marche.montantTtc
            statut = marche.statut
            dateDebut = marche.dateDebut
            dateFinPrevue = marche.dateFinPrevue
            delaiExecutionMois = marche.delaiExecutionMois
            retenueGarantie = marche.retenueGarantie
            remarques = marche.remarques
        }

        val updatedMarche = marcheRepository.save(existingMarche)

        logger.info {
            """
            ✅ MARCHÉ MIS À JOUR
            ───────────────────────────────────────────────────────────────────
            🆔 ID             : ${updatedMarche.id}
            📄 N° Marché      : ${updatedMarche.numeroMarche}
            📈 Statut         : ${updatedMarche.statut}
            💰 Montant TTC    : ${updatedMarche.montantTtc} MAD
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        return updatedMarche
    }

    fun delete(id: Long) {
        logger.info {
            """
            🗑️  SUPPRESSION MARCHÉ - DÉBUT
            ═══════════════════════════════════════════════════════════════════
            🆔 ID             : $id
            """.trimIndent()
        }

        val marche = marcheRepository.findById(id)
            .orElseThrow {
                logger.error { "❌ MARCHÉ NON TROUVÉ - ID: $id" }
                IllegalArgumentException("Marché avec ID $id non trouvé")
            }

        // Vérifier s'il y a des bons de commande ou décomptes
        val hasRelations = marche.bonsCommande.isNotEmpty() || marche.decomptes.isNotEmpty()

        if (hasRelations) {
            logger.warn {
                """
                ⚠️  SUPPRESSION AVEC CASCADE
                ───────────────────────────────────────────────────────────────────
                📄 N° Marché      : ${marche.numeroMarche}
                📦 Bons commande  : ${marche.bonsCommande.size}
                📊 Décomptes      : ${marche.decomptes.size}
                ⚠️  Ces éléments seront aussi supprimés (CASCADE)
                """.trimIndent()
            }
        }

        marcheRepository.delete(marche)

        logger.info {
            """
            ✅ MARCHÉ SUPPRIMÉ
            ───────────────────────────────────────────────────────────────────
            🆔 ID             : $id
            📄 N° Marché      : ${marche.numeroMarche}
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }
    }

    fun findByFournisseur(fournisseurId: Long): List<Marche> {
        logger.info { "🔍 Recherche marchés pour fournisseur ID: $fournisseurId" }
        val marches = marcheRepository.findByFournisseurId(fournisseurId)
        logger.info { "✅ ${marches.size} marché(s) trouvé(s) pour le fournisseur $fournisseurId" }
        return marches
    }

    fun findMarchesEnRetard(): List<Marche> {
        logger.info { "⏰ Recherche des marchés en retard..." }
        val marches = marcheRepository.findMarchesEnRetard()

        logger.warn {
            """
            ⚠️  MARCHÉS EN RETARD DÉTECTÉS
            ───────────────────────────────────────────────────────────────────
            📊 Nombre         : ${marches.size}
            ${marches.joinToString("\n") { "   - ${it.numeroMarche}: ${it.dateFinPrevue}" }}
            ═══════════════════════════════════════════════════════════════════
            """.trimIndent()
        }

        return marches
    }

    fun findByStatut(statut: StatutMarche): List<Marche> {
        logger.info { "🔍 Recherche marchés avec statut: $statut" }
        val marches = marcheRepository.findByStatut(statut)
        logger.info { "✅ ${marches.size} marché(s) avec statut $statut" }
        return marches
    }
}

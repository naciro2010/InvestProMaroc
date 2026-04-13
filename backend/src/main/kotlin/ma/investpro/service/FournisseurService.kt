package ma.investpro.service

import ma.investpro.entity.Fournisseur
import ma.investpro.repository.FournisseurRepository
import mu.KotlinLogging
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private val logger = KotlinLogging.logger {}

/**
 * Service for Fournisseur entity
 * Provides CRUD operations for suppliers
 */
@Service
@Transactional(readOnly = true)
class FournisseurService(
    private val fournisseurRepository: FournisseurRepository
) {

    @Transactional(readOnly = true)
    fun findAll(pageable: org.springframework.data.domain.Pageable): org.springframework.data.domain.Page<Fournisseur> {
        return fournisseurRepository.findAll(pageable)
    }

    @Cacheable("fournisseurs")
    fun findAll(): List<Fournisseur> {
        logger.debug { "Fetching all fournisseurs" }
        return fournisseurRepository.findAll().also { fournisseurs ->
            logger.info { "Found ${fournisseurs.size} fournisseurs" }
        }
    }

    fun findById(id: Long): Fournisseur {
        logger.debug { "Fetching fournisseur by ID: $id" }
        return fournisseurRepository.findById(id)
            .orElseThrow {
                logger.warn { "Fournisseur not found - ID: $id" }
                IllegalArgumentException("Fournisseur avec ID $id non trouvé")
            }
    }

    @Cacheable("fournisseurs-actifs")
    fun findAllActive(): List<Fournisseur> {
        logger.debug { "Fetching all active fournisseurs" }
        return fournisseurRepository.findByActifTrue().also { fournisseurs ->
            logger.info { "Found ${fournisseurs.size} active fournisseurs" }
        }
    }

    fun search(query: String): List<Fournisseur> {
        logger.debug { "Searching fournisseurs with query: $query" }
        return fournisseurRepository.findByRaisonSocialeContainingIgnoreCase(query).also { results ->
            logger.info { "Found ${results.size} fournisseurs matching '$query'" }
        }
    }

    @Transactional
    @CacheEvict(value = ["fournisseurs", "fournisseurs-actifs"], allEntries = true)
    fun save(fournisseur: Fournisseur): Fournisseur {
        logger.debug { "Saving fournisseur: ${fournisseur.code}" }

        // Validate unique code for new entities
        if (fournisseur.id == null) {
            if (fournisseurRepository.existsByCode(fournisseur.code)) {
                throw IllegalArgumentException("Un fournisseur avec le code '${fournisseur.code}' existe déjà")
            }
            if (!fournisseur.ice.isNullOrBlank() && fournisseurRepository.existsByIce(fournisseur.ice!!)) {
                throw IllegalArgumentException("Un fournisseur avec l'ICE '${fournisseur.ice}' existe déjà")
            }
        }

        return fournisseurRepository.save(fournisseur).also {
            logger.info { "Saved fournisseur with ID: ${it.id}" }
        }
    }
}

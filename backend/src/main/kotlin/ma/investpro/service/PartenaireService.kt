package ma.investpro.service

import ma.investpro.entity.Partenaire
import ma.investpro.repository.PartenaireRepository
import mu.KotlinLogging
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private val logger = KotlinLogging.logger {}

/**
 * Service for Partenaire entity
 * Provides CRUD operations for partners
 */
@Service
@Transactional(readOnly = true)
class PartenaireService(
    private val partenaireRepository: PartenaireRepository
) {

    /**
     * Find all partenaires
     */
    @Cacheable("partenaires")
    fun findAll(): List<Partenaire> {
        logger.debug { "Fetching all partenaires" }
        return partenaireRepository.findAll().also { partenaires ->
            logger.info { "Found ${partenaires.size} partenaires" }
        }
    }

    /**
     * Find partenaire by ID
     */
    fun findById(id: Long): Partenaire {
        logger.debug { "Fetching partenaire by ID: $id" }
        return partenaireRepository.findById(id)
            .orElseThrow {
                logger.warn { "Partenaire not found - ID: $id" }
                IllegalArgumentException("Partenaire avec ID $id non trouvé")
            }
    }

    /**
     * Find all active partenaires
     */
    @Cacheable("partenaires-actifs")
    fun findAllActive(): List<Partenaire> {
        logger.debug { "Fetching all active partenaires" }
        return partenaireRepository.findAll()
            .filter { it.actif }
            .also { partenaires ->
                logger.info { "Found ${partenaires.size} active partenaires" }
            }
    }

    /**
     * Save or update a partenaire
     */
    @Transactional
    @CacheEvict(value = ["partenaires", "partenaires-actifs"], allEntries = true)
    fun save(partenaire: Partenaire): Partenaire {
        logger.debug { "Saving partenaire: ${partenaire.code}" }
        return partenaireRepository.save(partenaire).also {
            logger.info { "Saved partenaire with ID: ${it.id}" }
        }
    }
}

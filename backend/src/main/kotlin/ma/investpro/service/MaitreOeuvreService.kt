package ma.investpro.service

import ma.investpro.dto.MaitreOeuvreRequest
import ma.investpro.dto.MaitreOeuvreResponse
import ma.investpro.entity.MaitreOeuvre
import ma.investpro.entity.TypeMaitreOeuvre
import ma.investpro.mapper.MaitreOeuvreMapper
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.MaitreOeuvreRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class MaitreOeuvreService(
    private val repository: MaitreOeuvreRepository,
    private val conventionRepository: ConventionRepository,
    private val mapper: MaitreOeuvreMapper
) {

    /**
     * Récupère tous les MO/MOD actifs d'une convention
     */
    fun getAllByConvention(conventionId: Long): List<MaitreOeuvreResponse> {
        val entities = repository.findByConventionIdAndActifTrue(conventionId)
        return mapper.toResponseList(entities)
    }

    /**
     * Récupère tous les MO d'une convention
     */
    fun getMOByConvention(conventionId: Long): List<MaitreOeuvreResponse> {
        val entities = repository.findByConventionIdAndTypeMoAndActifTrue(conventionId, TypeMaitreOeuvre.MO)
        return mapper.toResponseList(entities)
    }

    /**
     * Récupère tous les MOD d'une convention
     */
    fun getMODByConvention(conventionId: Long): List<MaitreOeuvreResponse> {
        val entities = repository.findByConventionIdAndTypeMoAndActifTrue(conventionId, TypeMaitreOeuvre.MOD)
        return mapper.toResponseList(entities)
    }

    /**
     * Récupère un MO/MOD par ID
     */
    fun getById(id: Long): MaitreOeuvreResponse {
        val entity = repository.findById(id)
            .orElseThrow { IllegalArgumentException("Maître d'Œuvre non trouvé avec l'ID: $id") }

        if (!entity.actif) {
            throw IllegalArgumentException("Maître d'Œuvre inactif")
        }

        return mapper.toResponse(entity)
    }

    /**
     * Crée un nouveau MO/MOD
     */
    fun create(request: MaitreOeuvreRequest): MaitreOeuvreResponse {
        // Vérifier si le code existe déjà
        if (repository.existsByCodeAndActifTrue(request.code)) {
            throw IllegalArgumentException("Un Maître d'Œuvre avec le code '${request.code}' existe déjà")
        }

        // Récupérer la convention
        val convention = conventionRepository.findById(request.conventionId)
            .orElseThrow { IllegalArgumentException("Convention non trouvée avec l'ID: ${request.conventionId}") }

        // Créer l'entité
        val entity = MaitreOeuvre(
            convention = convention,
            code = request.code,
            designation = request.designation,
            typeMo = request.typeMo,
            email = request.email,
            telephone = request.telephone,
            adresse = request.adresse,
            organisme = request.organisme,
            missions = request.missions,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
            actif = true
        )

        val saved = repository.save(entity)
        return mapper.toResponse(saved)
    }

    /**
     * Met à jour un MO/MOD existant
     */
    fun update(id: Long, request: MaitreOeuvreRequest): MaitreOeuvreResponse {
        val entity = repository.findById(id)
            .orElseThrow { IllegalArgumentException("Maître d'Œuvre non trouvé avec l'ID: $id") }

        if (!entity.actif) {
            throw IllegalArgumentException("Impossible de modifier un Maître d'Œuvre inactif")
        }

        // Vérifier si le code est déjà utilisé par un autre MO/MOD
        val existingWithCode = repository.findByCodeAndActifTrue(request.code)
        if (existingWithCode != null && existingWithCode.id != id) {
            throw IllegalArgumentException("Un Maître d'Œuvre avec le code '${request.code}' existe déjà")
        }

        // Mettre à jour les champs
        entity.code = request.code
        entity.designation = request.designation
        entity.typeMo = request.typeMo
        entity.email = request.email
        entity.telephone = request.telephone
        entity.adresse = request.adresse
        entity.organisme = request.organisme
        entity.missions = request.missions
        entity.updatedAt = LocalDateTime.now()

        val updated = repository.save(entity)
        return mapper.toResponse(updated)
    }

    /**
     * Supprime (soft delete) un MO/MOD
     */
    fun delete(id: Long) {
        val entity = repository.findById(id)
            .orElseThrow { IllegalArgumentException("Maître d'Œuvre non trouvé avec l'ID: $id") }

        entity.actif = false
        entity.updatedAt = LocalDateTime.now()
        repository.save(entity)
    }

    /**
     * Restaure un MO/MOD inactif
     */
    fun restore(id: Long): MaitreOeuvreResponse {
        val entity = repository.findById(id)
            .orElseThrow { IllegalArgumentException("Maître d'Œuvre non trouvé avec l'ID: $id") }

        entity.actif = true
        entity.updatedAt = LocalDateTime.now()
        val restored = repository.save(entity)
        return mapper.toResponse(restored)
    }
}

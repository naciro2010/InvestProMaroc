package ma.investpro.service

import ma.investpro.dto.SubventionDTO
import ma.investpro.dto.SubventionRequest
import ma.investpro.entity.Subvention
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.SubventionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SubventionService(
    private val subventionRepository: SubventionRepository,
    private val conventionRepository: ConventionRepository
) {

    fun findAll(): List<SubventionDTO> {
        return subventionRepository.findAll()
            .filter { it.actif }
            .map { it.toDTO() }
    }

    fun findByConventionId(conventionId: Long): List<SubventionDTO> {
        return subventionRepository.findActiveByConventionId(conventionId)
            .map { it.toDTO() }
    }

    fun findById(id: Long): SubventionDTO? {
        return subventionRepository.findById(id)
            .filter { it.actif }
            .map { it.toDTO() }
            .orElse(null)
    }

    @Transactional
    fun create(request: SubventionRequest): SubventionDTO {
        val convention = conventionRepository.findById(request.conventionId)
            .orElseThrow { IllegalArgumentException("Convention non trouvée: ${request.conventionId}") }

        val subvention = Subvention(
            convention = convention,
            organismeBailleur = request.organismeBailleur,
            typeSubvention = request.typeSubvention,
            montantTotal = request.montantTotal,
            devise = request.devise,
            tauxChange = request.tauxChange,
            dateSignature = request.dateSignature,
            dateDebutValidite = request.dateDebutValidite,
            dateFinValidite = request.dateFinValidite,
            conditions = request.conditions,
            observations = request.observations
        )

        return subventionRepository.save(subvention).toDTO()
    }

    @Transactional
    fun update(id: Long, request: SubventionRequest): SubventionDTO {
        val subvention = subventionRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Subvention non trouvée: $id") }

        // Update convention if changed
        if (subvention.convention.id != request.conventionId) {
            val newConvention = conventionRepository.findById(request.conventionId)
                .orElseThrow { IllegalArgumentException("Convention non trouvée: ${request.conventionId}") }
            subvention.convention = newConvention
        }

        subvention.organismeBailleur = request.organismeBailleur
        subvention.typeSubvention = request.typeSubvention
        subvention.montantTotal = request.montantTotal
        subvention.devise = request.devise
        subvention.tauxChange = request.tauxChange
        subvention.dateSignature = request.dateSignature
        subvention.dateDebutValidite = request.dateDebutValidite
        subvention.dateFinValidite = request.dateFinValidite
        subvention.conditions = request.conditions
        subvention.observations = request.observations

        return subventionRepository.save(subvention).toDTO()
    }

    @Transactional
    fun delete(id: Long) {
        val subvention = subventionRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Subvention non trouvée: $id") }
        subvention.actif = false
        subventionRepository.save(subvention)
    }

    fun countByConventionId(conventionId: Long): Long {
        return subventionRepository.countByConventionId(conventionId)
    }

    // Extension function to map entity to DTO
    private fun Subvention.toDTO() = SubventionDTO(
        id = this.id,
        conventionId = this.convention.id!!,
        organismeBailleur = this.organismeBailleur,
        typeSubvention = this.typeSubvention,
        montantTotal = this.montantTotal,
        devise = this.devise,
        tauxChange = this.tauxChange,
        dateSignature = this.dateSignature,
        dateDebutValidite = this.dateDebutValidite,
        dateFinValidite = this.dateFinValidite,
        conditions = this.conditions,
        observations = this.observations,
        actif = this.actif,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

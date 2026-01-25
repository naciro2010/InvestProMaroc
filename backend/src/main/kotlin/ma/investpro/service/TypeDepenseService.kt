package ma.investpro.service

import ma.investpro.dto.CreateTypeDepenseDTO
import ma.investpro.dto.TypeDepenseDTO
import ma.investpro.dto.TypeDepenseListDTO
import ma.investpro.dto.UpdateTypeDepenseDTO
import ma.investpro.entity.TypeDepense
import ma.investpro.mapper.TypeDepenseMapper
import ma.investpro.repository.TypeDepenseRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class TypeDepenseService(
    private val repository: TypeDepenseRepository,
    private val mapper: TypeDepenseMapper
) {

    fun findAll(): List<TypeDepenseDTO> {
        return repository.findAll().map(mapper::toDTO)
    }

    fun findAllActive(): List<TypeDepenseDTO> {
        return repository.findByActifTrue().map(mapper::toDTO)
    }

    /**
     * Optimized list for dropdowns (minimal payload)
     */
    fun findAllActiveList(): List<TypeDepenseListDTO> {
        return repository.findByActifTrueOrderByOrdreAffichageAsc()
            .map(mapper::toListDTO)
    }

    fun findById(id: Long): TypeDepenseDTO? {
        return repository.findById(id)
            .map(mapper::toDTO)
            .orElse(null)
    }

    fun findByCode(code: String): TypeDepenseDTO? {
        return repository.findByCode(code)?.let(mapper::toDTO)
    }

    fun create(dto: CreateTypeDepenseDTO): TypeDepenseDTO {
        val entity = mapper.toEntity(dto)
        val saved = repository.save(entity)
        return mapper.toDTO(saved)
    }

    fun update(id: Long, dto: UpdateTypeDepenseDTO): TypeDepenseDTO? {
        val entity = repository.findById(id).orElse(null) ?: return null
        val updated = mapper.updateEntity(entity, dto)
        val saved = repository.save(updated)
        return mapper.toDTO(saved)
    }

    fun delete(id: Long): Boolean {
        return repository.findById(id).map { entity ->
            entity.actif = false
            repository.save(entity)
            true
        }.orElse(false)
    }

    fun hardDelete(id: Long): Boolean {
        return if (repository.existsById(id)) {
            repository.deleteById(id)
            true
        } else {
            false
        }
    }
}

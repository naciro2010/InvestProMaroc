package ma.investpro.service

import ma.investpro.dto.CreateCategorieDepenseDTO
import ma.investpro.dto.CategorieDepenseDTO
import ma.investpro.dto.CategorieDepenseListDTO
import ma.investpro.dto.UpdateCategorieDepenseDTO
import ma.investpro.entity.CategorieDepense
import ma.investpro.mapper.CategorieDepenseMapper
import ma.investpro.repository.CategorieDepenseRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class CategorieDepenseService(
    private val repository: CategorieDepenseRepository,
    private val mapper: CategorieDepenseMapper
) {

    fun findAll(): List<CategorieDepenseDTO> {
        return repository.findAll().map(mapper::toDTO)
    }

    fun findAllActive(): List<CategorieDepenseDTO> {
        return repository.findByActifTrue().map(mapper::toDTO)
    }

    /**
     * Optimized list for dropdowns (minimal payload)
     */
    fun findAllActiveList(): List<CategorieDepenseListDTO> {
        return repository.findByActifTrueOrderByOrdreAffichageAsc()
            .map(mapper::toListDTO)
    }

    fun findById(id: Long): CategorieDepenseDTO? {
        return repository.findById(id)
            .map(mapper::toDTO)
            .orElse(null)
    }

    fun findByCode(code: String): CategorieDepenseDTO? {
        return repository.findByCode(code)?.let(mapper::toDTO)
    }

    fun create(dto: CreateCategorieDepenseDTO): CategorieDepenseDTO {
        val entity = mapper.toEntity(dto)
        val saved = repository.save(entity)
        return mapper.toDTO(saved)
    }

    fun update(id: Long, dto: UpdateCategorieDepenseDTO): CategorieDepenseDTO? {
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

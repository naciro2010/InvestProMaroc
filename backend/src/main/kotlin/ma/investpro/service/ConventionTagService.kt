package ma.investpro.service

import ma.investpro.dto.ConventionTagDTO
import ma.investpro.dto.CreateConventionTagRequest
import ma.investpro.dto.UpdateConventionTagRequest
import ma.investpro.entity.ConventionTag
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.ConventionTagRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class ConventionTagService(
    private val tagRepository: ConventionTagRepository,
    private val conventionRepository: ConventionRepository
) {

    @Transactional(readOnly = true)
    fun getAllTags(): List<ConventionTagDTO> =
        tagRepository.findByActifTrue().map { toDTO(it) }

    @Transactional(readOnly = true)
    fun getTagsForConvention(conventionId: Long): List<ConventionTagDTO> =
        tagRepository.findByConventionId(conventionId).map { toDTO(it) }

    fun createTag(request: CreateConventionTagRequest): ConventionTagDTO {
        require(!tagRepository.existsByNameIgnoreCase(request.name)) {
            "Un tag avec ce nom existe déjà"
        }
        val tag = ConventionTag(
            name = request.name,
            color = request.color,
            description = request.description
        )
        return toDTO(tagRepository.save(tag))
    }

    fun updateTag(tagId: Long, request: UpdateConventionTagRequest): ConventionTagDTO {
        val tag = tagRepository.findByIdOrNull(tagId)
            ?: throw IllegalArgumentException("Tag introuvable")
        request.name?.let { tag.name = it }
        request.color?.let { tag.color = it }
        request.description?.let { tag.description = it }
        return toDTO(tagRepository.save(tag))
    }

    fun deleteTag(tagId: Long) {
        val tag = tagRepository.findByIdOrNull(tagId)
            ?: throw IllegalArgumentException("Tag introuvable")
        tag.actif = false
        tagRepository.save(tag)
    }

    fun assignTag(conventionId: Long, tagId: Long) {
        val convention = conventionRepository.findByIdOrNull(conventionId)
            ?: throw IllegalArgumentException("Convention introuvable")
        val tag = tagRepository.findByIdOrNull(tagId)
            ?: throw IllegalArgumentException("Tag introuvable")
        tag.conventions.add(convention)
        tagRepository.save(tag)
    }

    fun removeTag(conventionId: Long, tagId: Long) {
        val tag = tagRepository.findByIdOrNull(tagId)
            ?: throw IllegalArgumentException("Tag introuvable")
        tag.conventions.removeIf { it.id == conventionId }
        tagRepository.save(tag)
    }

    private fun toDTO(tag: ConventionTag): ConventionTagDTO = ConventionTagDTO(
        id = tag.id!!,
        name = tag.name,
        color = tag.color,
        description = tag.description,
        conventionCount = tag.conventions.size
    )
}

package ma.investpro.mapper

import ma.investpro.dto.MaitreOeuvreResponse
import ma.investpro.dto.MaitreOeuvreSummary
import ma.investpro.entity.MaitreOeuvre
import org.springframework.stereotype.Component

@Component
class MaitreOeuvreMapper {

    fun toResponse(entity: MaitreOeuvre): MaitreOeuvreResponse {
        return MaitreOeuvreResponse(
            id = entity.id!!,
            conventionId = entity.convention.id!!,
            conventionCode = entity.convention.code,
            code = entity.code,
            designation = entity.designation,
            typeMo = entity.typeMo,
            email = entity.email,
            telephone = entity.telephone,
            adresse = entity.adresse,
            organisme = entity.organisme,
            missions = entity.missions,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            actif = entity.actif
        )
    }

    fun toSummary(entity: MaitreOeuvre): MaitreOeuvreSummary {
        return MaitreOeuvreSummary(
            id = entity.id!!,
            code = entity.code,
            designation = entity.designation,
            typeMo = entity.typeMo,
            email = entity.email,
            telephone = entity.telephone
        )
    }

    fun toResponseList(entities: List<MaitreOeuvre>): List<MaitreOeuvreResponse> {
        return entities.map { toResponse(it) }
    }

    fun toSummaryList(entities: List<MaitreOeuvre>): List<MaitreOeuvreSummary> {
        return entities.map { toSummary(it) }
    }
}

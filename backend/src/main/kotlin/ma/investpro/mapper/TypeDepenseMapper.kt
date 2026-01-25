package ma.investpro.mapper

import ma.investpro.dto.CreateTypeDepenseDTO
import ma.investpro.dto.TypeDepenseDTO
import ma.investpro.dto.TypeDepenseListDTO
import ma.investpro.dto.UpdateTypeDepenseDTO
import ma.investpro.entity.TypeDepense
import org.springframework.stereotype.Component

@Component
class TypeDepenseMapper {

    fun toDTO(entity: TypeDepense): TypeDepenseDTO {
        return TypeDepenseDTO(
            id = entity.id,
            code = entity.code,
            libelle = entity.libelle,
            description = entity.description,
            categorie = entity.categorie,
            ordreAffichage = entity.ordreAffichage,
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    fun toListDTO(entity: TypeDepense): TypeDepenseListDTO {
        return TypeDepenseListDTO(
            id = entity.id ?: 0,
            code = entity.code,
            libelle = entity.libelle,
            categorie = entity.categorie
        )
    }

    fun toEntity(dto: CreateTypeDepenseDTO): TypeDepense {
        return TypeDepense(
            code = dto.code,
            libelle = dto.libelle,
            description = dto.description,
            categorie = dto.categorie,
            ordreAffichage = dto.ordreAffichage
        )
    }

    fun updateEntity(entity: TypeDepense, dto: UpdateTypeDepenseDTO): TypeDepense {
        dto.code?.let { entity.code = it }
        dto.libelle?.let { entity.libelle = it }
        dto.description?.let { entity.description = it }
        dto.categorie?.let { entity.categorie = it }
        dto.ordreAffichage?.let { entity.ordreAffichage = it }
        dto.actif?.let { entity.actif = it }
        return entity
    }
}

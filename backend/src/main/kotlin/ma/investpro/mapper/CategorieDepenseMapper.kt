package ma.investpro.mapper

import ma.investpro.dto.CreateCategorieDepenseDTO
import ma.investpro.dto.CategorieDepenseDTO
import ma.investpro.dto.CategorieDepenseListDTO
import ma.investpro.dto.UpdateCategorieDepenseDTO
import ma.investpro.entity.CategorieDepense
import org.springframework.stereotype.Component

@Component
class CategorieDepenseMapper {

    fun toDTO(entity: CategorieDepense): CategorieDepenseDTO {
        return CategorieDepenseDTO(
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

    fun toListDTO(entity: CategorieDepense): CategorieDepenseListDTO {
        return CategorieDepenseListDTO(
            id = entity.id ?: 0,
            code = entity.code,
            libelle = entity.libelle,
            categorie = entity.categorie
        )
    }

    fun toEntity(dto: CreateCategorieDepenseDTO): CategorieDepense {
        return CategorieDepense(
            code = dto.code,
            libelle = dto.libelle,
            description = dto.description,
            categorie = dto.categorie,
            ordreAffichage = dto.ordreAffichage
        )
    }

    fun updateEntity(entity: CategorieDepense, dto: UpdateCategorieDepenseDTO): CategorieDepense {
        dto.code?.let { entity.code = it }
        dto.libelle?.let { entity.libelle = it }
        dto.description?.let { entity.description = it }
        dto.categorie?.let { entity.categorie = it }
        dto.ordreAffichage?.let { entity.ordreAffichage = it }
        dto.actif?.let { entity.actif = it }
        return entity
    }
}

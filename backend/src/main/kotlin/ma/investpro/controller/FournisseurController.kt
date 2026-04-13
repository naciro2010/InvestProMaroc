package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.CreateFournisseurDTO
import ma.investpro.dto.FournisseurDTO
import ma.investpro.dto.FournisseurSimpleDTO
import ma.investpro.dto.UpdateFournisseurDTO
import ma.investpro.mapper.FournisseurMapper
import ma.investpro.service.FournisseurService
import ma.investpro.dto.PageResponse
import mu.KotlinLogging
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly

private val logger = KotlinLogging.logger {}

/**
 * REST Controller for Fournisseur entity
 * Provides full CRUD endpoints for managing suppliers
 */
@RestController
@RequestMapping("/api/fournisseurs")
class FournisseurController(
    private val fournisseurService: FournisseurService,
    private val fournisseurMapper: FournisseurMapper
) {

    @GetMapping("/page")
    @ReadAccess
    fun getAllPaged(@PageableDefault(size = 25) pageable: Pageable): ResponseEntity<ApiResponse<PageResponse<FournisseurSimpleDTO>>> {
        val page = fournisseurService.findAll(pageable)
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(page) { fournisseurMapper.toSimpleDTO(it) }))
    }

    @GetMapping
    @ReadAccess
    fun getAll(): ResponseEntity<ApiResponse<List<FournisseurDTO>>> {
        val fournisseurs = fournisseurService.findAll()
        return ResponseEntity.ok(ApiResponse.success(fournisseurMapper.toDTOList(fournisseurs)))
    }

    @GetMapping("/active")
    @ReadAccess
    fun getAllActive(): ResponseEntity<ApiResponse<List<FournisseurSimpleDTO>>> {
        val fournisseurs = fournisseurService.findAllActive()
        return ResponseEntity.ok(ApiResponse.success(fournisseurMapper.toSimpleDTOList(fournisseurs)))
    }

    @GetMapping("/search")
    @ReadAccess
    fun search(@RequestParam q: String): ResponseEntity<ApiResponse<List<FournisseurSimpleDTO>>> {
        val fournisseurs = fournisseurService.search(q)
        return ResponseEntity.ok(ApiResponse.success(fournisseurMapper.toSimpleDTOList(fournisseurs)))
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<FournisseurDTO>> {
        val fournisseur = fournisseurService.findById(id)
        return ResponseEntity.ok(ApiResponse.success(fournisseurMapper.toDTO(fournisseur)))
    }

    @PostMapping
    @WriteAccess
    fun create(@Valid @RequestBody dto: CreateFournisseurDTO): ResponseEntity<ApiResponse<FournisseurDTO>> {
        val fournisseur = fournisseurMapper.toEntity(dto)
        val saved = fournisseurService.save(fournisseur)
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(fournisseurMapper.toDTO(saved), "Fournisseur créé avec succès"))
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun update(@PathVariable id: Long, @Valid @RequestBody dto: UpdateFournisseurDTO): ResponseEntity<ApiResponse<FournisseurDTO>> {
        val existing = fournisseurService.findById(id)
        fournisseurMapper.updateEntityFromDTO(dto, existing)
        val saved = fournisseurService.save(existing)
        return ResponseEntity.ok(ApiResponse.success(fournisseurMapper.toDTO(saved), "Fournisseur modifié avec succès"))
    }

    @DeleteMapping("/{id}")
    @WriteAccess
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Nothing>> {
        val fournisseur = fournisseurService.findById(id)
        fournisseur.actif = false
        fournisseurService.save(fournisseur)
        return ResponseEntity.ok(ApiResponse.ok("Fournisseur supprimé avec succès"))
    }
}

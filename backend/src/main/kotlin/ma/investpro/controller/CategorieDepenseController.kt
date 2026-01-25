package ma.investpro.controller

import ma.investpro.dto.CreateCategorieDepenseDTO
import ma.investpro.dto.CategorieDepenseDTO
import ma.investpro.dto.CategorieDepenseListDTO
import ma.investpro.dto.UpdateCategorieDepenseDTO
import ma.investpro.dto.ApiResponse
import ma.investpro.service.CategorieDepenseService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/categories-depenses")
class CategorieDepenseController(
    private val service: CategorieDepenseService
) {

    @GetMapping
    fun getAll(): ResponseEntity<ApiResponse<List<CategorieDepenseDTO>>> {
        val items = service.findAll()
        return ResponseEntity.ok(ApiResponse.success(items, "Liste des types de dépenses"))
    }

    @GetMapping("/active")
    fun getAllActive(): ResponseEntity<ApiResponse<List<CategorieDepenseDTO>>> {
        val items = service.findAllActive()
        return ResponseEntity.ok(ApiResponse.success(items, "Liste des types de dépenses actifs"))
    }

    /**
     * Optimized endpoint for dropdowns (minimal payload)
     */
    @GetMapping("/list")
    fun getActiveList(): ResponseEntity<ApiResponse<List<CategorieDepenseListDTO>>> {
        val items = service.findAllActiveList()
        return ResponseEntity.ok(ApiResponse.success(items, "Liste simplifiée pour les formulaires"))
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<CategorieDepenseDTO>> {
        val item = service.findById(id)
        return if (item != null) {
            ResponseEntity.ok(ApiResponse.success(item))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Type de dépense non trouvé"))
        }
    }

    @GetMapping("/code/{code}")
    fun getByCode(@PathVariable code: String): ResponseEntity<ApiResponse<CategorieDepenseDTO>> {
        val item = service.findByCode(code)
        return if (item != null) {
            ResponseEntity.ok(ApiResponse.success(item))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Type de dépense non trouvé"))
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun create(@RequestBody dto: CreateCategorieDepenseDTO): ResponseEntity<ApiResponse<CategorieDepenseDTO>> {
        val created = service.create(dto)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Type de dépense créé avec succès"))
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun update(
        @PathVariable id: Long,
        @RequestBody dto: UpdateCategorieDepenseDTO
    ): ResponseEntity<ApiResponse<CategorieDepenseDTO>> {
        val updated = service.update(id, dto)
        return if (updated != null) {
            ResponseEntity.ok(ApiResponse.success(updated, "Type de dépense modifié avec succès"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Type de dépense non trouvé"))
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        val deleted = service.delete(id)
        return if (deleted) {
            ResponseEntity.ok(ApiResponse.success("Type de dépense désactivé avec succès"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Type de dépense non trouvé"))
        }
    }
}

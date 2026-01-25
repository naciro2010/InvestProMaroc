package ma.investpro.controller

import ma.investpro.dto.CreateTypeDepenseDTO
import ma.investpro.dto.TypeDepenseDTO
import ma.investpro.dto.TypeDepenseListDTO
import ma.investpro.dto.UpdateTypeDepenseDTO
import ma.investpro.response.ApiResponse
import ma.investpro.service.TypeDepenseService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/types-depenses")
class TypeDepenseController(
    private val service: TypeDepenseService
) {

    @GetMapping
    fun getAll(): ResponseEntity<ApiResponse<List<TypeDepenseDTO>>> {
        val items = service.findAll()
        return ResponseEntity.ok(ApiResponse.success(items, "Liste des types de dépenses"))
    }

    @GetMapping("/active")
    fun getAllActive(): ResponseEntity<ApiResponse<List<TypeDepenseDTO>>> {
        val items = service.findAllActive()
        return ResponseEntity.ok(ApiResponse.success(items, "Liste des types de dépenses actifs"))
    }

    /**
     * Optimized endpoint for dropdowns (minimal payload)
     */
    @GetMapping("/list")
    fun getActiveList(): ResponseEntity<ApiResponse<List<TypeDepenseListDTO>>> {
        val items = service.findAllActiveList()
        return ResponseEntity.ok(ApiResponse.success(items, "Liste simplifiée pour les formulaires"))
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<TypeDepenseDTO>> {
        val item = service.findById(id)
        return if (item != null) {
            ResponseEntity.ok(ApiResponse.success(item))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Type de dépense non trouvé"))
        }
    }

    @GetMapping("/code/{code}")
    fun getByCode(@PathVariable code: String): ResponseEntity<ApiResponse<TypeDepenseDTO>> {
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
    fun create(@RequestBody dto: CreateTypeDepenseDTO): ResponseEntity<ApiResponse<TypeDepenseDTO>> {
        val created = service.create(dto)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Type de dépense créé avec succès"))
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun update(
        @PathVariable id: Long,
        @RequestBody dto: UpdateTypeDepenseDTO
    ): ResponseEntity<ApiResponse<TypeDepenseDTO>> {
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

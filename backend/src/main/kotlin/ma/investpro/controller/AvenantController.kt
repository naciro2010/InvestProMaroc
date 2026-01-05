package ma.investpro.controller

import ma.investpro.dto.ConsolidatedVersionResponse
import ma.investpro.dto.VersionHistoryEntry
import ma.investpro.entity.Avenant
import ma.investpro.service.AvenantService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/avenants")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class AvenantController(
    private val avenantService: AvenantService
) {

    // ========== CRUD Endpoints ==========

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAll(): ResponseEntity<List<Avenant>> {
        return ResponseEntity.ok(avenantService.findAll())
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getById(@PathVariable id: Long): ResponseEntity<Avenant> {
        val avenant = avenantService.findById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(avenant)
    }

    @GetMapping("/convention/{conventionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getByConvention(@PathVariable conventionId: Long): ResponseEntity<List<Avenant>> {
        return ResponseEntity.ok(avenantService.findByConvention(conventionId))
    }

    @GetMapping("/convention/{conventionId}/valides")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAvenantsValidesOrdonnes(@PathVariable conventionId: Long): ResponseEntity<List<Avenant>> {
        return ResponseEntity.ok(avenantService.findAvenantsValidesOrdonnes(conventionId))
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun create(@RequestBody avenant: Avenant): ResponseEntity<Avenant> {
        return try {
            val created = avenantService.create(avenant)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun update(
        @PathVariable id: Long,
        @RequestBody avenant: Avenant
    ): ResponseEntity<Avenant> {
        return try {
            val updated = avenantService.update(id, avenant)
            ResponseEntity.ok(updated)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            avenantService.delete(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    // ========== Workflow Endpoints ==========

    @PostMapping("/{id}/soumettre")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun soumettre(@PathVariable id: Long): ResponseEntity<Avenant> {
        return try {
            val avenant = avenantService.soumettre(id)
            ResponseEntity.ok(avenant)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun valider(
        @PathVariable id: Long,
        @RequestBody request: Map<String, Long>
    ): ResponseEntity<Avenant> {
        return try {
            val valideParId = request["valideParId"]
                ?: return ResponseEntity.badRequest().build()

            val avenant = avenantService.valider(id, valideParId)
            ResponseEntity.ok(avenant)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun rejeter(
        @PathVariable id: Long,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<Avenant> {
        return try {
            val motif = request["motif"] ?: "Aucun motif fourni"
            val avenant = avenantService.rejeter(id, motif)
            ResponseEntity.ok(avenant)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/annuler")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun annuler(
        @PathVariable id: Long,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<Avenant> {
        return try {
            val motif = request["motif"] ?: "Aucun motif fourni"
            val avenant = avenantService.annuler(id, motif)
            ResponseEntity.ok(avenant)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    // ========== Version & Historique ==========

    @GetMapping("/convention/{conventionId}/version-consolidee")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getVersionConsolidee(@PathVariable conventionId: Long): ResponseEntity<ConsolidatedVersionResponse> {
        return ResponseEntity.ok(avenantService.getVersionConsolidee(conventionId))
    }

    @GetMapping("/convention/{conventionId}/historique")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getHistoriqueVersions(@PathVariable conventionId: Long): ResponseEntity<List<VersionHistoryEntry>> {
        return ResponseEntity.ok(avenantService.getHistoriqueVersions(conventionId))
    }
}

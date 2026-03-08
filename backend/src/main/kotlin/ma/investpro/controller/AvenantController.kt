package ma.investpro.controller

import ma.investpro.dto.ConsolidatedVersionResponse
import ma.investpro.dto.VersionHistoryEntry
import ma.investpro.entity.Avenant
import ma.investpro.service.AvenantService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly

@RestController
@RequestMapping("/api/avenants")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class AvenantController(
    private val avenantService: AvenantService
) {

    // ========== CRUD Endpoints ==========

    @GetMapping
    @ReadAccess
    fun getAll(): ResponseEntity<List<Avenant>> {
        return ResponseEntity.ok(avenantService.findAll())
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getById(@PathVariable id: Long): ResponseEntity<Avenant> {
        val avenant = avenantService.findById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(avenant)
    }

    @GetMapping("/convention/{conventionId}")
    @ReadAccess
    fun getByConvention(@PathVariable conventionId: Long): ResponseEntity<List<Avenant>> {
        return ResponseEntity.ok(avenantService.findByConvention(conventionId))
    }

    @GetMapping("/convention/{conventionId}/valides")
    @ReadAccess
    fun getAvenantsValidesOrdonnes(@PathVariable conventionId: Long): ResponseEntity<List<Avenant>> {
        return ResponseEntity.ok(avenantService.findAvenantsValidesOrdonnes(conventionId))
    }

    @PostMapping
    @WriteAccess
    fun create(@Valid @RequestBody avenant: Avenant): ResponseEntity<Avenant> {
        return try {
            val created = avenantService.create(avenant)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody avenant: Avenant
    ): ResponseEntity<Avenant> {
        return try {
            val updated = avenantService.update(id, avenant)
            ResponseEntity.ok(updated)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    @AdminOnly
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
    @WriteAccess
    fun soumettre(@PathVariable id: Long): ResponseEntity<Avenant> {
        return try {
            val avenant = avenantService.soumettre(id)
            ResponseEntity.ok(avenant)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/valider")
    @WriteAccess
    fun valider(
        @PathVariable id: Long,
        @Valid @RequestBody request: Map<String, Long>
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
    @WriteAccess
    fun rejeter(
        @PathVariable id: Long,
        @Valid @RequestBody request: Map<String, String>
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
    @WriteAccess
    fun annuler(
        @PathVariable id: Long,
        @Valid @RequestBody request: Map<String, String>
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
    @ReadAccess
    fun getVersionConsolidee(@PathVariable conventionId: Long): ResponseEntity<ConsolidatedVersionResponse> {
        return ResponseEntity.ok(avenantService.getVersionConsolidee(conventionId))
    }

    @GetMapping("/convention/{conventionId}/historique")
    @ReadAccess
    fun getHistoriqueVersions(@PathVariable conventionId: Long): ResponseEntity<List<VersionHistoryEntry>> {
        return ResponseEntity.ok(avenantService.getHistoriqueVersions(conventionId))
    }
}

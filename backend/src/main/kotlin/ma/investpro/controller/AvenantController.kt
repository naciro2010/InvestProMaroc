package ma.investpro.controller

import ma.investpro.entity.Avenant
import ma.investpro.service.AvenantService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/avenants")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000"])
class AvenantController(
    private val avenantService: AvenantService
) {

    // ========== CRUD Endpoints ==========

    @GetMapping
    fun getAll(): ResponseEntity<List<Avenant>> {
        return ResponseEntity.ok(avenantService.findAll())
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<Avenant> {
        val avenant = avenantService.findById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(avenant)
    }

    @GetMapping("/convention/{conventionId}")
    fun getByConvention(@PathVariable conventionId: Long): ResponseEntity<List<Avenant>> {
        return ResponseEntity.ok(avenantService.findByConvention(conventionId))
    }

    @GetMapping("/convention/{conventionId}/valides")
    fun getAvenantsValidesOrdonnes(@PathVariable conventionId: Long): ResponseEntity<List<Avenant>> {
        return ResponseEntity.ok(avenantService.findAvenantsValidesOrdonnes(conventionId))
    }

    @PostMapping
    fun create(@RequestBody avenant: Avenant): ResponseEntity<Avenant> {
        return try {
            val created = avenantService.create(avenant)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
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
    fun soumettre(@PathVariable id: Long): ResponseEntity<Avenant> {
        return try {
            val avenant = avenantService.soumettre(id)
            ResponseEntity.ok(avenant)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/valider")
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
    fun getVersionConsolidee(@PathVariable conventionId: Long): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(avenantService.getVersionConsolidee(conventionId))
    }

    @GetMapping("/convention/{conventionId}/historique")
    fun getHistoriqueVersions(@PathVariable conventionId: Long): ResponseEntity<List<Map<String, Any?>>> {
        return ResponseEntity.ok(avenantService.getHistoriqueVersions(conventionId))
    }
}

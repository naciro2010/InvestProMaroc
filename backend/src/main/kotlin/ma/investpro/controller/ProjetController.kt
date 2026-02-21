package ma.investpro.controller

import ma.investpro.dto.ProjetDTO
import ma.investpro.dto.ProjetSimpleDTO
import ma.investpro.entity.Projet
import ma.investpro.entity.StatutProjet
import ma.investpro.mapper.ProjetMapper
import ma.investpro.service.ProjetService
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

/**
 * Contrôleur REST pour la gestion des Projets.
 *
 * SÉCURITÉ (via hiérarchie des rôles):
 * - @ReadAccess: USER, MANAGER, ADMIN
 * - @WriteAccess: MANAGER, ADMIN
 * - @AdminOnly: ADMIN uniquement
 */
@RestController
@RequestMapping("/api/projets")
class ProjetController(
    private val projetService: ProjetService,
    private val projetMapper: ProjetMapper
) {

    // ========== CRUD Endpoints ==========

    @GetMapping
    @ReadAccess
    fun getAll(): ResponseEntity<List<ProjetDTO>> {
        val projets = projetService.findAll()
        val dtos = projetMapper.toDTOList(projets)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getById(@PathVariable id: Long): ResponseEntity<ProjetDTO> {
        val projet = projetService.findById(id)
            ?: return ResponseEntity.notFound().build()
        val dto = projetMapper.toDTO(projet)
        return ResponseEntity.ok(dto)
    }

    @GetMapping("/code/{code}")
    @ReadAccess
    fun getByCode(@PathVariable code: String): ResponseEntity<ProjetDTO> {
        val projet = projetService.findByCode(code)
            ?: return ResponseEntity.notFound().build()
        val dto = projetMapper.toDTO(projet)
        return ResponseEntity.ok(dto)
    }

    @GetMapping("/statut/{statut}")
    @ReadAccess
    fun getByStatut(@PathVariable statut: StatutProjet): ResponseEntity<List<ProjetDTO>> {
        val projets = projetService.findByStatut(statut)
        val dtos = projetMapper.toDTOList(projets)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/actifs")
    @ReadAccess
    fun getActifs(): ResponseEntity<List<ProjetSimpleDTO>> {
        val projets = projetService.findProjetsActifs()
        val dtos = projetMapper.toSimpleDTOList(projets)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/en-retard")
    @ReadAccess
    fun getEnRetard(): ResponseEntity<List<ProjetDTO>> {
        val projets = projetService.findProjetsEnRetard()
        val dtos = projetMapper.toDTOList(projets)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/convention/{conventionId}")
    @ReadAccess
    fun getByConvention(@PathVariable conventionId: Long): ResponseEntity<List<ProjetSimpleDTO>> {
        val projets = projetService.findByConventionId(conventionId)
        val dtos = projetMapper.toSimpleDTOList(projets)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/chef-projet/{chefProjetId}")
    @ReadAccess
    fun getByChefProjet(@PathVariable chefProjetId: Long): ResponseEntity<List<ProjetSimpleDTO>> {
        val projets = projetService.findByChefProjetId(chefProjetId)
        val dtos = projetMapper.toSimpleDTOList(projets)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/periode")
    @ReadAccess
    fun getByPeriode(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) debut: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) fin: LocalDate
    ): ResponseEntity<List<ProjetDTO>> {
        val projets = projetService.findByPeriode(debut, fin)
        val dtos = projetMapper.toDTOList(projets)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/search")
    @ReadAccess
    fun search(@RequestParam q: String): ResponseEntity<List<ProjetSimpleDTO>> {
        val projets = projetService.search(q)
        val dtos = projetMapper.toSimpleDTOList(projets)
        return ResponseEntity.ok(dtos)
    }

    @PostMapping
    @WriteAccess
    fun create(@Valid @RequestBody projet: Projet): ResponseEntity<ProjetDTO> {
        return try {
            val created = projetService.create(projet)
            val dto = projetMapper.toDTO(created)
            ResponseEntity.status(HttpStatus.CREATED).body(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody projet: Projet
    ): ResponseEntity<ProjetDTO> {
        return try {
            val updated = projetService.update(id, projet)
            val dto = projetMapper.toDTO(updated)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{id}")
    @AdminOnly
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            projetService.delete(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.notFound().build()
        }
    }

    // ========== Workflow Endpoints ==========

    @PostMapping("/{id}/demarrer")
    @WriteAccess
    fun demarrer(@PathVariable id: Long): ResponseEntity<ProjetDTO> {
        return try {
            val projet = projetService.demarrer(id)
            val dto = projetMapper.toDTO(projet)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/suspendre")
    @WriteAccess
    fun suspendre(
        @PathVariable id: Long,
        @RequestParam(required = false) motif: String?
    ): ResponseEntity<ProjetDTO> {
        return try {
            val projet = projetService.suspendre(id, motif)
            val dto = projetMapper.toDTO(projet)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/reprendre")
    @WriteAccess
    fun reprendre(@PathVariable id: Long): ResponseEntity<ProjetDTO> {
        return try {
            val projet = projetService.reprendre(id)
            val dto = projetMapper.toDTO(projet)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/terminer")
    @WriteAccess
    fun terminer(@PathVariable id: Long): ResponseEntity<ProjetDTO> {
        return try {
            val projet = projetService.terminer(id)
            val dto = projetMapper.toDTO(projet)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/annuler")
    @WriteAccess
    fun annuler(
        @PathVariable id: Long,
        @RequestParam(required = false) motif: String?
    ): ResponseEntity<ProjetDTO> {
        return try {
            val projet = projetService.annuler(id, motif)
            val dto = projetMapper.toDTO(projet)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}/avancement")
    @WriteAccess
    fun mettreAJourAvancement(
        @PathVariable id: Long,
        @RequestParam pourcentage: Double
    ): ResponseEntity<ProjetDTO> {
        return try {
            val projet = projetService.mettreAJourAvancement(id, pourcentage)
            val dto = projetMapper.toDTO(projet)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    // ========== Statistics ==========

    @GetMapping("/statistiques")
    @ReadAccess
    fun getStatistiques(): ResponseEntity<Map<String, Long>> {
        val stats = projetService.getStatistiques()
        return ResponseEntity.ok(stats)
    }
}

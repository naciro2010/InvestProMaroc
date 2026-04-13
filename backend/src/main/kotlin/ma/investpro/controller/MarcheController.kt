package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.entity.Marche
import ma.investpro.entity.StatutMarche
import ma.investpro.service.MarcheService
import ma.investpro.mapper.MarcheMapper
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly
import mu.KotlinLogging
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

/**
 * Contrôleur REST pour la gestion des Marchés.
 *
 * SÉCURITÉ (via hiérarchie des rôles):
 * - @ReadAccess: USER, MANAGER, ADMIN
 * - @WriteAccess: MANAGER, ADMIN
 * - @AdminOnly: ADMIN uniquement
 */
@RestController
@RequestMapping("/api/marches")
class MarcheController(
    private val marcheService: MarcheService,
    private val marcheMapper: MarcheMapper
) {

    @GetMapping("/page")
    @ReadAccess
    fun getAllPaged(@PageableDefault(size = 25) pageable: Pageable): ResponseEntity<ApiResponse<PageResponse<MarcheSimpleDTO>>> {
        val page = marcheService.findAll(pageable)
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(page) { marcheMapper.toSimpleDTO(it) }))
    }

    @GetMapping("/list")
    @ReadAccess
    fun getMarchesList(): ResponseEntity<List<MarcheListDTO>> {
        logger.info { "🌐 API: GET /api/marches/list (optimized for list view)" }
        val marches = marcheService.findAllForListView()
        return ResponseEntity.ok(marches)
    }

    @GetMapping("/stats")
    @ReadAccess
    fun getMarchesStats(): ResponseEntity<ApiResponse<MarcheGlobalStatsDTO>> {
        logger.info { "🌐 API: GET /api/marches/stats" }
        val stats = marcheService.getMarcheStats()
        return ResponseEntity.ok(ApiResponse.success(stats))
    }

    @GetMapping
    @ReadAccess
    fun getAllMarches(): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches (returns DTOs)" }
        val marches = marcheService.findAll()
        val dtos = marcheMapper.toDTOList(marches)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getMarcheById(@PathVariable id: Long): ResponseEntity<ApiResponse<MarcheDTO>> {
        val marche = marcheService.findById(id)
        val dto = marcheMapper.toDTO(marche)
        return ResponseEntity.ok(ApiResponse.success(dto))
    }

    @PostMapping
    @WriteAccess
    fun createMarche(@Valid @RequestBody marche: Marche): ResponseEntity<ApiResponse<MarcheDTO>> {
        val createdMarche = marcheService.create(marche)
        val dto = marcheMapper.toDTO(createdMarche)
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(dto, "Marché créé avec succès"))
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun updateMarche(@PathVariable id: Long, @Valid @RequestBody marche: Marche): ResponseEntity<ApiResponse<MarcheDTO>> {
        val updatedMarche = marcheService.update(id, marche)
        val dto = marcheMapper.toDTO(updatedMarche)
        return ResponseEntity.ok(ApiResponse.success(dto, "Marché mis à jour"))
    }

    @DeleteMapping("/{id}")
    @AdminOnly
    fun deleteMarche(@PathVariable id: Long): ResponseEntity<ApiResponse<Nothing>> {
        marcheService.delete(id)
        return ResponseEntity.ok(ApiResponse.ok("Marché supprimé"))
    }

    @GetMapping("/fournisseur/{fournisseurId}")
    @ReadAccess
    fun getMarchesByFournisseur(@PathVariable fournisseurId: Long): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/fournisseur/$fournisseurId" }
        val marches = marcheService.findByFournisseur(fournisseurId)
        val dtos = marcheMapper.toDTOList(marches)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/convention/{conventionId}")
    @ReadAccess
    fun getMarchesByConvention(@PathVariable conventionId: Long): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/convention/$conventionId" }
        val marches = marcheService.findByConvention(conventionId)
        val dtos = marcheMapper.toDTOList(marches)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/projet/{projetId}")
    @ReadAccess
    fun getMarchesByProjet(@PathVariable projetId: Long): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/projet/$projetId" }
        return try {
            val marches = marcheService.findByProjet(projetId)
            val dtos = marcheMapper.toDTOList(marches)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Projet non trouvé"))
        }
    }

    @GetMapping("/statut/{statut}")
    @ReadAccess
    fun getMarchesByStatut(@PathVariable statut: StatutMarche): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/statut/$statut" }
        val marches = marcheService.findByStatut(statut)
        val dtos = marcheMapper.toDTOList(marches)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/retard")
    @ReadAccess
    fun getMarchesEnRetard(): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/retard" }
        val marches = marcheService.findMarchesEnRetard()
        val dtos = marcheMapper.toDTOList(marches)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/{id}/lignes")
    @ReadAccess
    fun getMarcheLignes(@PathVariable id: Long): ResponseEntity<ApiResponse<List<MarcheLigneDTO>>> {
        logger.info { "🌐 API: GET /api/marches/$id/lignes (granular: line items only)" }
        return try {
            val lignes = marcheService.findLignesByMarcheId(id)
            val dtos = marcheMapper.toLigneDTOList(lignes)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        }
    }

    @GetMapping("/{id}/avenants")
    @ReadAccess
    fun getMarcheAvenants(@PathVariable id: Long): ResponseEntity<ApiResponse<List<AvenantMarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/$id/avenants (granular: amendments only)" }
        return try {
            val avenants = marcheService.findAvenantsByMarcheId(id)
            val dtos = marcheMapper.toAvenantDTOList(avenants)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        }
    }

    @GetMapping("/{id}/decomptes")
    @ReadAccess
    fun getMarcheDecomptes(@PathVariable id: Long): ResponseEntity<ApiResponse<List<DecompteSimpleDTO>>> {
        logger.info { "🌐 API: GET /api/marches/$id/decomptes (granular: billing statements only)" }
        return try {
            val decomptes = marcheService.findDecomptesByMarcheId(id)
            val dtos = marcheMapper.toDecompteSimpleDTOList(decomptes)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        }
    }

    @GetMapping("/{id}/paiements")
    @ReadAccess
    fun getMarchePaiements(@PathVariable id: Long): ResponseEntity<ApiResponse<List<MarchePaiementDTO>>> {
        logger.info { "🌐 API: GET /api/marches/$id/paiements (granular: payments via decomptes chain)" }
        return try {
            val paiements = marcheService.findPaiementsByMarcheId(id)
            ResponseEntity.ok(ApiResponse.success(paiements))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        }
    }

    @GetMapping("/{id}/situation-paiement")
    @ReadAccess
    fun getMarcheSituationPaiement(@PathVariable id: Long): ResponseEntity<ApiResponse<MarcheSituationPaiementDTO>> {
        logger.info { "🌐 API: GET /api/marches/$id/situation-paiement (payment situation summary)" }
        return try {
            val situation = marcheService.getSituationPaiement(id)
            ResponseEntity.ok(ApiResponse.success(situation))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        }
    }
}

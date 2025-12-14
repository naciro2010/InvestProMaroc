package ma.investpro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.investpro.dto.ApiResponse;
import ma.investpro.dto.ConventionDTO;
import ma.investpro.service.ConventionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/conventions")
@RequiredArgsConstructor
@Tag(name = "Conventions", description = "Gestion des conventions de commissions")
@CrossOrigin(origins = "*")
public class ConventionController {

    private final ConventionService conventionService;

    @GetMapping
    @Operation(summary = "Récupérer toutes les conventions")
    public ResponseEntity<ApiResponse<List<ConventionDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(conventionService.getAll()));
    }

    @GetMapping("/active")
    @Operation(summary = "Récupérer les conventions actives")
    public ResponseEntity<ApiResponse<List<ConventionDTO>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(conventionService.getAllActive()));
    }

    @GetMapping("/active-at")
    @Operation(summary = "Récupérer les conventions actives à une date donnée")
    public ResponseEntity<ApiResponse<List<ConventionDTO>>> getActiveAtDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(conventionService.getActiveAtDate(date)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une convention par ID")
    public ResponseEntity<ApiResponse<ConventionDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(conventionService.getById(id)));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Récupérer une convention par code")
    public ResponseEntity<ApiResponse<ConventionDTO>> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(conventionService.getByCode(code)));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des conventions")
    public ResponseEntity<ApiResponse<List<ConventionDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(conventionService.search(q)));
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle convention")
    public ResponseEntity<ApiResponse<ConventionDTO>> create(@Valid @RequestBody ConventionDTO dto) {
        ConventionDTO created = conventionService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Convention créée avec succès", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une convention")
    public ResponseEntity<ApiResponse<ConventionDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ConventionDTO dto) {
        ConventionDTO updated = conventionService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Convention mise à jour avec succès", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Désactiver une convention (soft delete)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        conventionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Convention désactivée avec succès", null));
    }

    @DeleteMapping("/{id}/hard")
    @Operation(summary = "Supprimer définitivement une convention")
    public ResponseEntity<ApiResponse<Void>> hardDelete(@PathVariable Long id) {
        conventionService.hardDelete(id);
        return ResponseEntity.ok(ApiResponse.success("Convention supprimée avec succès", null));
    }
}

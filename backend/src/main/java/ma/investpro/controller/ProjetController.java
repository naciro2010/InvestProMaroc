package ma.investpro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.investpro.dto.ApiResponse;
import ma.investpro.dto.ProjetDTO;
import ma.investpro.service.ProjetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
@RequiredArgsConstructor
@Tag(name = "Projets", description = "Gestion des projets d'investissement")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "Bearer Authentication")
public class ProjetController {

    private final ProjetService projetService;

    @GetMapping
    @Operation(summary = "Récupérer tous les projets")
    public ResponseEntity<ApiResponse<List<ProjetDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(projetService.getAll()));
    }

    @GetMapping("/active")
    @Operation(summary = "Récupérer les projets actifs")
    public ResponseEntity<ApiResponse<List<ProjetDTO>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(projetService.getAllActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un projet par ID")
    public ResponseEntity<ApiResponse<ProjetDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(projetService.getById(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des projets")
    public ResponseEntity<ApiResponse<List<ProjetDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(projetService.search(q)));
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau projet")
    public ResponseEntity<ApiResponse<ProjetDTO>> create(@Valid @RequestBody ProjetDTO dto) {
        ProjetDTO created = projetService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Projet créé avec succès", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un projet")
    public ResponseEntity<ApiResponse<ProjetDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProjetDTO dto) {
        ProjetDTO updated = projetService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Projet mis à jour avec succès", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Désactiver un projet")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        projetService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Projet désactivé avec succès", null));
    }
}

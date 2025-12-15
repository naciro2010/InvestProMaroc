package ma.investpro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.investpro.dto.ApiResponse;
import ma.investpro.dto.FournisseurDTO;
import ma.investpro.service.FournisseurService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fournisseurs")
@RequiredArgsConstructor
@Tag(name = "Fournisseurs", description = "Gestion des fournisseurs")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "Bearer Authentication")
public class FournisseurController {

    private final FournisseurService fournisseurService;

    @GetMapping
    @Operation(summary = "Récupérer tous les fournisseurs")
    public ResponseEntity<ApiResponse<List<FournisseurDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(fournisseurService.getAll()));
    }

    @GetMapping("/active")
    @Operation(summary = "Récupérer les fournisseurs actifs")
    public ResponseEntity<ApiResponse<List<FournisseurDTO>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(fournisseurService.getAllActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un fournisseur par ID")
    public ResponseEntity<ApiResponse<FournisseurDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(fournisseurService.getById(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des fournisseurs")
    public ResponseEntity<ApiResponse<List<FournisseurDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(fournisseurService.search(q)));
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau fournisseur")
    public ResponseEntity<ApiResponse<FournisseurDTO>> create(@Valid @RequestBody FournisseurDTO dto) {
        FournisseurDTO created = fournisseurService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Fournisseur créé avec succès", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un fournisseur")
    public ResponseEntity<ApiResponse<FournisseurDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody FournisseurDTO dto) {
        FournisseurDTO updated = fournisseurService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Fournisseur mis à jour avec succès", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Désactiver un fournisseur")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        fournisseurService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Fournisseur désactivé avec succès", null));
    }
}

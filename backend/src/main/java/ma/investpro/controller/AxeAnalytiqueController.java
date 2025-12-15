package ma.investpro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.investpro.dto.ApiResponse;
import ma.investpro.dto.AxeAnalytiqueDTO;
import ma.investpro.service.AxeAnalytiqueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/axes-analytiques")
@RequiredArgsConstructor
@Tag(name = "Axes Analytiques", description = "Gestion des axes analytiques")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "Bearer Authentication")
public class AxeAnalytiqueController {

    private final AxeAnalytiqueService axeAnalytiqueService;

    @GetMapping
    @Operation(summary = "Récupérer tous les axes analytiques")
    public ResponseEntity<ApiResponse<List<AxeAnalytiqueDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(axeAnalytiqueService.getAll()));
    }

    @GetMapping("/active")
    @Operation(summary = "Récupérer les axes analytiques actifs")
    public ResponseEntity<ApiResponse<List<AxeAnalytiqueDTO>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(axeAnalytiqueService.getAllActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un axe analytique par ID")
    public ResponseEntity<ApiResponse<AxeAnalytiqueDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(axeAnalytiqueService.getById(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des axes analytiques")
    public ResponseEntity<ApiResponse<List<AxeAnalytiqueDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(axeAnalytiqueService.search(q)));
    }

    @PostMapping
    @Operation(summary = "Créer un nouvel axe analytique")
    public ResponseEntity<ApiResponse<AxeAnalytiqueDTO>> create(@Valid @RequestBody AxeAnalytiqueDTO dto) {
        AxeAnalytiqueDTO created = axeAnalytiqueService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Axe analytique créé avec succès", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un axe analytique")
    public ResponseEntity<ApiResponse<AxeAnalytiqueDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody AxeAnalytiqueDTO dto) {
        AxeAnalytiqueDTO updated = axeAnalytiqueService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Axe analytique mis à jour avec succès", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Désactiver un axe analytique")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        axeAnalytiqueService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Axe analytique désactivé avec succès", null));
    }
}

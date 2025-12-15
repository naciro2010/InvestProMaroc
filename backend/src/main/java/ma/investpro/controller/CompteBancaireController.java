package ma.investpro.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.investpro.dto.ApiResponse;
import ma.investpro.dto.CompteBancaireDTO;
import ma.investpro.service.CompteBancaireService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comptes-bancaires")
@RequiredArgsConstructor
@Tag(name = "Comptes Bancaires", description = "Gestion des comptes bancaires")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "Bearer Authentication")
public class CompteBancaireController {

    private final CompteBancaireService compteBancaireService;

    @GetMapping
    @Operation(summary = "Récupérer tous les comptes bancaires")
    public ResponseEntity<ApiResponse<List<CompteBancaireDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(compteBancaireService.getAll()));
    }

    @GetMapping("/active")
    @Operation(summary = "Récupérer les comptes bancaires actifs")
    public ResponseEntity<ApiResponse<List<CompteBancaireDTO>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(compteBancaireService.getAllActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un compte bancaire par ID")
    public ResponseEntity<ApiResponse<CompteBancaireDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(compteBancaireService.getById(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des comptes bancaires")
    public ResponseEntity<ApiResponse<List<CompteBancaireDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(compteBancaireService.search(q)));
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau compte bancaire")
    public ResponseEntity<ApiResponse<CompteBancaireDTO>> create(@Valid @RequestBody CompteBancaireDTO dto) {
        CompteBancaireDTO created = compteBancaireService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Compte bancaire créé avec succès", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un compte bancaire")
    public ResponseEntity<ApiResponse<CompteBancaireDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody CompteBancaireDTO dto) {
        CompteBancaireDTO updated = compteBancaireService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Compte bancaire mis à jour avec succès", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Désactiver un compte bancaire")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        compteBancaireService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Compte bancaire désactivé avec succès", null));
    }
}

package ma.investpro.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionDTO {
    private Long id;

    @NotNull(message = "La dépense est obligatoire")
    private Long depenseId;
    private String depenseNumeroFacture;

    @NotNull(message = "La convention est obligatoire")
    private Long conventionId;
    private String conventionLibelle;

    @NotNull(message = "La date de calcul est obligatoire")
    private LocalDate dateCalcul;

    @NotBlank(message = "La base de calcul est obligatoire")
    private String baseCalcul;

    @NotNull(message = "Le montant de base est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal montantBase;

    @NotNull(message = "Le taux de commission est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal tauxCommission;

    @NotNull(message = "Le taux de TVA est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal tauxTva;

    @NotNull(message = "Le montant commission HT est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal montantCommissionHt;

    @NotNull(message = "Le montant TVA commission est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal montantTvaCommission;

    @NotNull(message = "Le montant commission TTC est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal montantCommissionTtc;

    private String remarques;
    private Boolean actif;

    // Informations supplémentaires pour les rapports
    private String projetNom;
    private String fournisseurNom;
}

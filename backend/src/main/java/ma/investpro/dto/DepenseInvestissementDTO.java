package ma.investpro.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepenseInvestissementDTO {
    private Long id;

    @NotBlank(message = "Le numéro de facture est obligatoire")
    @Size(max = 100)
    private String numeroFacture;

    @NotNull(message = "La date de facture est obligatoire")
    private LocalDate dateFacture;

    @NotNull(message = "Le fournisseur est obligatoire")
    private Long fournisseurId;
    private String fournisseurNom;

    @NotNull(message = "Le projet est obligatoire")
    private Long projetId;
    private String projetNom;

    private Long axeAnalytiqueId;
    private String axeAnalytiqueLibelle;

    private Long conventionId;
    private String conventionLibelle;

    @NotNull(message = "Le montant HT est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal montantHt;

    @NotNull(message = "Le taux de TVA est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal tauxTva;

    @NotNull(message = "Le montant TVA est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal montantTva;

    @NotNull(message = "Le montant TTC est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal montantTtc;

    @Size(max = 100)
    private String referenceMarche;

    @Size(max = 100)
    private String numeroDecompte;

    @DecimalMin("0.00")
    private BigDecimal retenueTva;

    @DecimalMin("0.00")
    private BigDecimal retenueIsTiers;

    @DecimalMin("0.00")
    private BigDecimal retenueNonResident;

    @DecimalMin("0.00")
    private BigDecimal retenueGarantie;

    private LocalDate datePaiement;

    @Size(max = 100)
    private String referencePaiement;

    private Long compteBancaireId;
    private String compteBancaireLibelle;

    private Boolean paye;
    private String remarques;
    private Boolean actif;

    // Champ calculé
    private BigDecimal montantNetAPayer;
}

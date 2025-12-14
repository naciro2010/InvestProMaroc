package ma.investpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entité représentant une dépense d'investissement
 */
@Entity
@Table(name = "depenses_investissement", indexes = {
    @Index(name = "idx_depense_numero_facture", columnList = "numeroFacture"),
    @Index(name = "idx_depense_date_facture", columnList = "dateFacture"),
    @Index(name = "idx_depense_fournisseur", columnList = "fournisseur_id"),
    @Index(name = "idx_depense_projet", columnList = "projet_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepenseInvestissement extends BaseEntity {

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Le numéro de facture est obligatoire")
    @Size(max = 100, message = "Le numéro de facture ne peut pas dépasser 100 caractères")
    private String numeroFacture;

    @Column(nullable = false)
    @NotNull(message = "La date de facture est obligatoire")
    private LocalDate dateFacture;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fournisseur_id", nullable = false)
    @NotNull(message = "Le fournisseur est obligatoire")
    private Fournisseur fournisseur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projet_id", nullable = false)
    @NotNull(message = "Le projet est obligatoire")
    private Projet projet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "axe_analytique_id")
    private AxeAnalytique axeAnalytique;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id")
    private Convention convention;

    // Montants de la facture
    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Le montant HT est obligatoire")
    @DecimalMin(value = "0.00", message = "Le montant HT doit être positif")
    private BigDecimal montantHt;

    @Column(nullable = false, precision = 5, scale = 2)
    @NotNull(message = "Le taux de TVA est obligatoire")
    @DecimalMin(value = "0.00", message = "Le taux de TVA doit être positif")
    private BigDecimal tauxTva = new BigDecimal("20.00");

    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Le montant TVA est obligatoire")
    @DecimalMin(value = "0.00", message = "Le montant TVA doit être positif")
    private BigDecimal montantTva;

    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Le montant TTC est obligatoire")
    @DecimalMin(value = "0.00", message = "Le montant TTC doit être positif")
    private BigDecimal montantTtc;

    // Références marché / décompte
    @Column(length = 100)
    @Size(max = 100, message = "La référence marché ne peut pas dépasser 100 caractères")
    private String referenceMarche;

    @Column(length = 100)
    @Size(max = 100, message = "Le numéro de décompte ne peut pas dépasser 100 caractères")
    private String numeroDecompte;

    // Retenues
    @Column(precision = 15, scale = 2)
    @DecimalMin(value = "0.00", message = "La retenue TVA doit être positive")
    private BigDecimal retenueTva = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    @DecimalMin(value = "0.00", message = "La retenue IS tiers doit être positive")
    private BigDecimal retenueIsTiers = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    @DecimalMin(value = "0.00", message = "La retenue non-résident doit être positive")
    private BigDecimal retenueNonResident = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    @DecimalMin(value = "0.00", message = "La retenue garantie doit être positive")
    private BigDecimal retenueGarantie = BigDecimal.ZERO;

    // Informations de paiement
    @Column
    private LocalDate datePaiement;

    @Column(length = 100)
    @Size(max = 100, message = "La référence de paiement ne peut pas dépasser 100 caractères")
    private String referencePaiement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_bancaire_id")
    private CompteBancaire compteBancaire;

    @Column(nullable = false)
    private Boolean paye = false;

    @Column(columnDefinition = "TEXT")
    private String remarques;

    // Calculs automatiques
    @PrePersist
    @PreUpdate
    private void calculateAmounts() {
        // Calcul TVA si pas déjà défini
        if (montantHt != null && tauxTva != null) {
            montantTva = montantHt.multiply(tauxTva).divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
            montantTtc = montantHt.add(montantTva);
        }

        // Calcul automatique retenue garantie 10% si non défini
        if (montantHt != null && retenueGarantie == null) {
            retenueGarantie = montantHt.multiply(new BigDecimal("0.10")).setScale(2, BigDecimal.ROUND_HALF_UP);
        }

        // Calcul IS tiers 10% pour fournisseurs non-résidents
        if (fournisseur != null && fournisseur.getNonResident() && montantHt != null) {
            retenueIsTiers = montantHt.multiply(new BigDecimal("0.10")).setScale(2, BigDecimal.ROUND_HALF_UP);
        }
    }

    /**
     * Calcule le montant net à payer
     */
    public BigDecimal getMontantNetAPayer() {
        BigDecimal montantNet = montantTtc;
        if (retenueTva != null) montantNet = montantNet.subtract(retenueTva);
        if (retenueIsTiers != null) montantNet = montantNet.subtract(retenueIsTiers);
        if (retenueNonResident != null) montantNet = montantNet.subtract(retenueNonResident);
        if (retenueGarantie != null) montantNet = montantNet.subtract(retenueGarantie);
        return montantNet;
    }
}

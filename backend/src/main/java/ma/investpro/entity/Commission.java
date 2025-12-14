package ma.investpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entité représentant une commission d'intervention calculée
 */
@Entity
@Table(name = "commissions", indexes = {
    @Index(name = "idx_commission_depense", columnList = "depense_id"),
    @Index(name = "idx_commission_convention", columnList = "convention_id"),
    @Index(name = "idx_commission_date", columnList = "dateCalcul")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Commission extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "depense_id", nullable = false, unique = true)
    @NotNull(message = "La dépense est obligatoire")
    private DepenseInvestissement depense;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "convention_id", nullable = false)
    @NotNull(message = "La convention est obligatoire")
    private Convention convention;

    @Column(nullable = false)
    @NotNull(message = "La date de calcul est obligatoire")
    private LocalDate dateCalcul;

    // Base de calcul
    @Column(nullable = false, length = 10)
    @NotBlank(message = "La base de calcul est obligatoire")
    private String baseCalcul; // HT, TTC, AUTRE

    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Le montant de base est obligatoire")
    @DecimalMin(value = "0.00", message = "Le montant de base doit être positif")
    private BigDecimal montantBase;

    // Taux appliqués (stockés pour historique)
    @Column(nullable = false, precision = 5, scale = 2)
    @NotNull(message = "Le taux de commission est obligatoire")
    @DecimalMin(value = "0.00", message = "Le taux doit être positif")
    private BigDecimal tauxCommission;

    @Column(nullable = false, precision = 5, scale = 2)
    @NotNull(message = "Le taux de TVA est obligatoire")
    @DecimalMin(value = "0.00", message = "Le taux de TVA doit être positif")
    private BigDecimal tauxTva;

    // Montants calculés
    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Le montant commission HT est obligatoire")
    @DecimalMin(value = "0.00", message = "Le montant commission HT doit être positif")
    private BigDecimal montantCommissionHt;

    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Le montant TVA commission est obligatoire")
    @DecimalMin(value = "0.00", message = "Le montant TVA doit être positif")
    private BigDecimal montantTvaCommission;

    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Le montant commission TTC est obligatoire")
    @DecimalMin(value = "0.00", message = "Le montant commission TTC doit être positif")
    private BigDecimal montantCommissionTtc;

    @Column(columnDefinition = "TEXT")
    private String remarques;

    @PrePersist
    private void setDateCalcul() {
        if (dateCalcul == null) {
            dateCalcul = LocalDate.now();
        }
    }

    /**
     * Calcule automatiquement la commission à partir de la convention et de la dépense
     */
    public static Commission calculer(DepenseInvestissement depense, Convention convention) {
        Commission commission = new Commission();
        commission.setDepense(depense);
        commission.setConvention(convention);
        commission.setDateCalcul(LocalDate.now());
        commission.setBaseCalcul(convention.getBaseCalcul());
        commission.setTauxCommission(convention.getTauxCommission());
        commission.setTauxTva(convention.getTauxTva());

        // Déterminer le montant de base selon le type de calcul
        BigDecimal montantBase;
        switch (convention.getBaseCalcul()) {
            case "HT":
                montantBase = depense.getMontantHt();
                break;
            case "TTC":
                montantBase = depense.getMontantTtc();
                break;
            default:
                montantBase = depense.getMontantHt();
        }
        commission.setMontantBase(montantBase);

        // Calcul de la commission
        BigDecimal commissionHt = montantBase
            .multiply(convention.getTauxCommission())
            .divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
        commission.setMontantCommissionHt(commissionHt);

        // Calcul de la TVA sur commission
        BigDecimal tvaCommission = commissionHt
            .multiply(convention.getTauxTva())
            .divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
        commission.setMontantTvaCommission(tvaCommission);

        // Calcul du TTC
        commission.setMontantCommissionTtc(commissionHt.add(tvaCommission));

        return commission;
    }
}

package ma.investpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entité représentant une convention de commission d'intervention
 */
@Entity
@Table(name = "conventions", uniqueConstraints = {
    @UniqueConstraint(columnNames = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Convention extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Le code de la convention est obligatoire")
    @Size(max = 50, message = "Le code ne peut pas dépasser 50 caractères")
    private String code;

    @Column(nullable = false, length = 200)
    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 200, message = "Le libellé ne peut pas dépasser 200 caractères")
    private String libelle;

    @Column(nullable = false, precision = 5, scale = 2)
    @NotNull(message = "Le taux de commission est obligatoire")
    @DecimalMin(value = "0.00", message = "Le taux doit être positif")
    @DecimalMax(value = "100.00", message = "Le taux ne peut pas dépasser 100%")
    private BigDecimal tauxCommission;

    @Column(nullable = false, length = 10)
    @NotBlank(message = "La base de calcul est obligatoire")
    @Pattern(regexp = "HT|TTC|AUTRE", message = "La base doit être HT, TTC ou AUTRE")
    private String baseCalcul; // HT, TTC, AUTRE

    @Column(nullable = false, precision = 5, scale = 2)
    @NotNull(message = "Le taux de TVA est obligatoire")
    @DecimalMin(value = "0.00", message = "Le taux de TVA doit être positif")
    private BigDecimal tauxTva = new BigDecimal("20.00"); // TVA standard au Maroc

    @Column(nullable = false)
    @NotNull(message = "La date de début est obligatoire")
    private LocalDate dateDebut;

    @Column
    private LocalDate dateFin;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Validation métier : date fin >= date début
    @PrePersist
    @PreUpdate
    private void validateDates() {
        if (dateFin != null && dateFin.isBefore(dateDebut)) {
            throw new IllegalStateException("La date de fin doit être postérieure à la date de début");
        }
    }

    /**
     * Vérifie si la convention est valide à une date donnée
     */
    public boolean isValidAt(LocalDate date) {
        return !date.isBefore(dateDebut) &&
               (dateFin == null || !date.isAfter(dateFin)) &&
               getActif();
    }
}

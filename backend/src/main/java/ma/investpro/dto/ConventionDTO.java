package ma.investpro.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConventionDTO {
    private Long id;

    @NotBlank(message = "Le code est obligatoire")
    @Size(max = 50)
    private String code;

    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 200)
    private String libelle;

    @NotNull(message = "Le taux de commission est obligatoire")
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal tauxCommission;

    @NotBlank(message = "La base de calcul est obligatoire")
    @Pattern(regexp = "HT|TTC|AUTRE")
    private String baseCalcul;

    @NotNull(message = "Le taux de TVA est obligatoire")
    @DecimalMin("0.00")
    private BigDecimal tauxTva;

    @NotNull(message = "La date de début est obligatoire")
    private LocalDate dateDebut;

    private LocalDate dateFin;
    private String description;
    private Boolean actif;
}

package ma.investpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Entité représentant un axe analytique
 */
@Entity
@Table(name = "axes_analytiques", uniqueConstraints = {
    @UniqueConstraint(columnNames = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AxeAnalytique extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Le code de l'axe est obligatoire")
    @Size(max = 50, message = "Le code ne peut pas dépasser 50 caractères")
    private String code;

    @Column(nullable = false, length = 200)
    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 200, message = "Le libellé ne peut pas dépasser 200 caractères")
    private String libelle;

    @Column(length = 50)
    @Size(max = 50, message = "Le type ne peut pas dépasser 50 caractères")
    private String type; // Département, Centre de coût, Activité, etc.

    @Column(columnDefinition = "TEXT")
    private String description;
}

package ma.investpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Entité représentant un fournisseur
 */
@Entity
@Table(name = "fournisseurs", uniqueConstraints = {
    @UniqueConstraint(columnNames = "code"),
    @UniqueConstraint(columnNames = "ice")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fournisseur extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Le code du fournisseur est obligatoire")
    @Size(max = 50, message = "Le code ne peut pas dépasser 50 caractères")
    private String code;

    @Column(nullable = false, length = 200)
    @NotBlank(message = "La raison sociale est obligatoire")
    @Size(max = 200, message = "La raison sociale ne peut pas dépasser 200 caractères")
    private String raisonSociale;

    @Column(length = 20)
    @Size(max = 20, message = "L'IF ne peut pas dépasser 20 caractères")
    @Pattern(regexp = "^[0-9]*$", message = "L'IF doit contenir uniquement des chiffres")
    private String identifiantFiscal; // IF

    @Column(unique = true, length = 15)
    @Size(min = 15, max = 15, message = "L'ICE doit contenir exactement 15 caractères")
    @Pattern(regexp = "^[0-9]{15}$", message = "L'ICE doit contenir exactement 15 chiffres")
    private String ice;

    @Column(columnDefinition = "TEXT")
    private String adresse;

    @Column(length = 100)
    @Size(max = 100, message = "La ville ne peut pas dépasser 100 caractères")
    private String ville;

    @Column(length = 20)
    @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "Le téléphone doit contenir uniquement des chiffres et caractères spéciaux valides")
    private String telephone;

    @Column(length = 20)
    @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "Le fax doit contenir uniquement des chiffres et caractères spéciaux valides")
    private String fax;

    @Column(length = 150)
    @Email(message = "L'email doit être valide")
    private String email;

    @Column(length = 100)
    @Size(max = 100, message = "Le contact ne peut pas dépasser 100 caractères")
    private String contact;

    @Column(nullable = false)
    private Boolean nonResident = false; // Pour application IS tiers 10%

    @Column(columnDefinition = "TEXT")
    private String remarques;
}

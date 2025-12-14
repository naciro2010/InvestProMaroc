package ma.investpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Entité représentant un compte bancaire
 */
@Entity
@Table(name = "comptes_bancaires", uniqueConstraints = {
    @UniqueConstraint(columnNames = "code"),
    @UniqueConstraint(columnNames = "rib")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompteBancaire extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Le code du compte est obligatoire")
    @Size(max = 50, message = "Le code ne peut pas dépasser 50 caractères")
    private String code;

    @Column(nullable = false, unique = true, length = 24)
    @NotBlank(message = "Le RIB est obligatoire")
    @Size(min = 24, max = 24, message = "Le RIB doit contenir exactement 24 caractères")
    @Pattern(regexp = "^[0-9]{24}$", message = "Le RIB doit contenir exactement 24 chiffres")
    private String rib;

    @Column(nullable = false, length = 200)
    @NotBlank(message = "Le nom de la banque est obligatoire")
    @Size(max = 200, message = "Le nom de la banque ne peut pas dépasser 200 caractères")
    private String banque;

    @Column(length = 200)
    @Size(max = 200, message = "Le nom de l'agence ne peut pas dépasser 200 caractères")
    private String agence;

    @Column(length = 50)
    @Size(max = 50, message = "Le type de compte ne peut pas dépasser 50 caractères")
    private String typeCompte; // GENERAL, PROJET, REGIE, etc.

    @Column(length = 200)
    @Size(max = 200, message = "Le titulaire ne peut pas dépasser 200 caractères")
    private String titulaire;

    @Column(length = 10)
    @Size(max = 10, message = "La devise ne peut pas dépasser 10 caractères")
    private String devise = "MAD";

    @Column(columnDefinition = "TEXT")
    private String remarques;
}

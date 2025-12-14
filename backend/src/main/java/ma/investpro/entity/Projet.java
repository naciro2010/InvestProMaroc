package ma.investpro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Entité représentant un projet d'investissement
 */
@Entity
@Table(name = "projets", uniqueConstraints = {
    @UniqueConstraint(columnNames = "code")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Projet extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Le code du projet est obligatoire")
    @Size(max = 50, message = "Le code ne peut pas dépasser 50 caractères")
    private String code;

    @Column(nullable = false, length = 200)
    @NotBlank(message = "Le nom du projet est obligatoire")
    @Size(max = 200, message = "Le nom ne peut pas dépasser 200 caractères")
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    @Size(max = 100, message = "Le responsable ne peut pas dépasser 100 caractères")
    private String responsable;

    @Column(length = 50)
    private String statut; // EN_COURS, TERMINE, SUSPENDU
}

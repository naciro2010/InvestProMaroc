package ma.investpro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjetDTO {
    private Long id;

    @NotBlank(message = "Le code est obligatoire")
    @Size(max = 50)
    private String code;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 200)
    private String nom;

    private String description;

    @Size(max = 100)
    private String responsable;

    private String statut;
    private Boolean actif;
}

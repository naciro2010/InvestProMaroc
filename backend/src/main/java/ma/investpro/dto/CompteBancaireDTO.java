package ma.investpro.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompteBancaireDTO {
    private Long id;

    @NotBlank(message = "Le code est obligatoire")
    @Size(max = 50)
    private String code;

    @NotBlank(message = "Le RIB est obligatoire")
    @Size(min = 24, max = 24)
    @Pattern(regexp = "^[0-9]{24}$", message = "Le RIB doit contenir 24 chiffres")
    private String rib;

    @NotBlank(message = "Le nom de la banque est obligatoire")
    @Size(max = 200)
    private String banque;

    @Size(max = 200)
    private String agence;

    @Size(max = 50)
    private String typeCompte;

    @Size(max = 200)
    private String titulaire;

    @Size(max = 10)
    private String devise;

    private String remarques;
    private Boolean actif;
}

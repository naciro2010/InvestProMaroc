package ma.investpro.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FournisseurDTO {
    private Long id;

    @NotBlank(message = "Le code est obligatoire")
    @Size(max = 50)
    private String code;

    @NotBlank(message = "La raison sociale est obligatoire")
    @Size(max = 200)
    private String raisonSociale;

    @Size(max = 20)
    @Pattern(regexp = "^[0-9]*$", message = "L'IF doit contenir uniquement des chiffres")
    private String identifiantFiscal;

    @Size(min = 15, max = 15, message = "L'ICE doit contenir 15 caractères")
    @Pattern(regexp = "^[0-9]{15}$", message = "L'ICE doit contenir 15 chiffres")
    private String ice;

    private String adresse;

    @Size(max = 100)
    private String ville;

    @Pattern(regexp = "^[0-9+\\-\\s()]*$")
    private String telephone;

    @Pattern(regexp = "^[0-9+\\-\\s()]*$")
    private String fax;

    @Email
    private String email;

    @Size(max = 100)
    private String contact;

    private Boolean nonResident;
    private String remarques;
    private Boolean actif;
}

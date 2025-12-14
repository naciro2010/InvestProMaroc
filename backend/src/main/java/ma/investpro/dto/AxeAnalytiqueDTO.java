package ma.investpro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AxeAnalytiqueDTO {
    private Long id;

    @NotBlank(message = "Le code est obligatoire")
    @Size(max = 50)
    private String code;

    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 200)
    private String libelle;

    @Size(max = 50)
    private String type;

    private String description;
    private Boolean actif;
}

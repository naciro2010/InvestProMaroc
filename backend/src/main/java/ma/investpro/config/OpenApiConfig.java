package ma.investpro.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI investProOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("InvestPro Maroc API")
                .description("API pour la gestion des dépenses d'investissement et calcul des commissions d'intervention")
                .version("1.0.0")
                .contact(new Contact()
                    .name("InvestPro Support")
                    .email("support@investpro.ma"))
                .license(new License()
                    .name("Propriétaire")
                    .url("https://investpro.ma")));
    }
}

package ma.investpro.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "app.cors")
data class CorsProperties(
    var allowedOrigins: String = "",
    var allowedMethods: String = "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    var allowedHeaders: String = "*",
    var allowCredentials: Boolean = true
)

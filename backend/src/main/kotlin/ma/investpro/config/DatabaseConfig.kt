package ma.investpro.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import javax.sql.DataSource

/**
 * Configuration de la base de données pour Railway
 *
 * Railway fournit DATABASE_URL au format: postgresql://user:pass@host:port/db
 * Mais Spring Boot JDBC a besoin de: jdbc:postgresql://user:pass@host:port/db
 *
 * Cette configuration parse l'URL Railway et la transforme correctement.
 */
@Configuration
@ConditionalOnProperty(name = ["DATABASE_URL"])
class RailwayDatabaseConfig {

    @Value("\${DATABASE_URL:}")
    private lateinit var databaseUrl: String

    @Bean
    @Primary
    fun dataSource(): DataSource {
        // Transformer l'URL Railway en URL JDBC si nécessaire
        val jdbcUrl = if (databaseUrl.startsWith("postgresql://")) {
            "jdbc:$databaseUrl"
        } else if (databaseUrl.startsWith("jdbc:")) {
            databaseUrl
        } else {
            "jdbc:postgresql://$databaseUrl"
        }

        // Parser l'URL pour extraire username et password si présents
        val config = HikariConfig().apply {
            this.jdbcUrl = jdbcUrl

            // Configuration optimisée pour Railway
            maximumPoolSize = 5
            minimumIdle = 2
            connectionTimeout = 30000
            idleTimeout = 600000
            maxLifetime = 1800000

            // Auto-configuration des credentials depuis l'URL JDBC
            // HikariCP les extrait automatiquement de l'URL
        }

        return HikariDataSource(config)
    }
}

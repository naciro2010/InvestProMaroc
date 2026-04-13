package ma.investpro.config

import ma.investpro.security.JwtAuthenticationFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler
import org.springframework.security.access.hierarchicalroles.RoleHierarchy
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

/**
 * Configuration centralisée de la sécurité pour InvestPro.
 *
 * ARCHITECTURE DE SÉCURITÉ:
 * ========================
 *
 * 1. HIÉRARCHIE DES RÔLES (Role Hierarchy):
 *    ADMIN > MANAGER > USER
 *    - ADMIN hérite automatiquement de toutes les permissions de MANAGER et USER
 *    - MANAGER hérite automatiquement de toutes les permissions de USER
 *    - Cela évite de devoir spécifier hasAnyRole('ADMIN', 'MANAGER', 'USER') partout
 *
 * 2. PROTECTION PAR DÉFAUT:
 *    - Toutes les routes /api/… (pattern wildcard) sont protégées par défaut (authentification requise)
 *    - Seules les routes explicitement listées en permitAll() sont publiques
 *    - Les nouvelles routes sont automatiquement protégées sans configuration supplémentaire
 *
 * 3. PERMISSIONS PAR NIVEAU:
 *    - ADMIN: Accès total (gestion utilisateurs, suppressions, configuration système)
 *    - MANAGER: Opérations métier (CRUD conventions, marchés, décomptes, paiements)
 *    - USER: Lecture seule (consultation, reporting)
 *
 * 4. UTILISATION DANS LES CONTROLLERS:
 *    @PreAuthorize("hasRole('USER')")     -> Accessible à USER, MANAGER, ADMIN
 *    @PreAuthorize("hasRole('MANAGER')")  -> Accessible à MANAGER, ADMIN
 *    @PreAuthorize("hasRole('ADMIN')")    -> Accessible uniquement à ADMIN
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    private val userDetailsService: UserDetailsService,
    private val corsProperties: CorsProperties
) {

    companion object {
        /**
         * Routes publiques accessibles sans authentification.
         * TOUTE ROUTE NON LISTÉE ICI NÉCESSITE UNE AUTHENTIFICATION.
         */
        val PUBLIC_ROUTES = arrayOf(
            "/api/auth/**",           // Authentification (login, register, refresh)
            "/actuator/**",           // Health checks (production monitoring)
            "/api-docs/**",           // OpenAPI documentation
            "/swagger-ui/**",         // Swagger UI
            "/swagger-ui.html",       // Swagger HTML
            "/error",                 // Error page
            "/favicon.ico"            // Favicon
        )
    }

    /**
     * Hiérarchie des rôles: ADMIN > MANAGER > USER
     *
     * Avec cette configuration:
     * - hasRole('USER') retourne true pour USER, MANAGER et ADMIN
     * - hasRole('MANAGER') retourne true pour MANAGER et ADMIN
     * - hasRole('ADMIN') retourne true uniquement pour ADMIN
     *
     * Cela simplifie les @PreAuthorize annotations:
     * Au lieu de @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
     * On écrit simplement @PreAuthorize("hasRole('USER')")
     */
    @Bean
    fun roleHierarchy(): RoleHierarchy {
        return RoleHierarchyImpl.withDefaultRolePrefix()
            .role("ADMIN").implies("MANAGER")
            .role("MANAGER").implies("USER")
            .build()
    }

    /**
     * Expression handler qui utilise la hiérarchie des rôles.
     * Nécessaire pour que @PreAuthorize prenne en compte la hiérarchie.
     */
    @Bean
    fun methodSecurityExpressionHandler(roleHierarchy: RoleHierarchy): MethodSecurityExpressionHandler {
        val handler = DefaultMethodSecurityExpressionHandler()
        handler.setRoleHierarchy(roleHierarchy)
        return handler
    }

    /**
     * Chaîne de filtres de sécurité principale.
     *
     * Ordre d'exécution:
     * 1. CORS filter
     * 2. JWT Authentication filter
     * 3. Authorization checks
     * 4. Controller method
     */
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            // Désactiver CSRF (JWT est stateless, pas de cookies)
            .csrf { it.disable() }

            // Configuration CORS
            .cors { it.configurationSource(corsConfigurationSource()) }

            // Headers de sécurité OWASP
            .headers { headers ->
                headers.contentTypeOptions { }
                headers.frameOptions { it.deny() }
                headers.httpStrictTransportSecurity {
                    it.includeSubDomains(true)
                    it.maxAgeInSeconds(31536000)
                }
                headers.xssProtection { it.headerValue(org.springframework.security.web.header.writers.XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK) }
                headers.referrerPolicy { it.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN) }
            }

            // Session stateless (pas de session côté serveur)
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }

            // Configuration des autorisations
            .authorizeHttpRequests { auth ->
                auth
                    // Routes publiques (authentification non requise)
                    .requestMatchers(*PUBLIC_ROUTES).permitAll()

                    // Permettre les requêtes OPTIONS (CORS preflight)
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // ============================================================
                    // PROTECTION PAR DÉFAUT: Toutes les autres routes nécessitent
                    // une authentification. Les nouvelles routes sont automatiquement
                    // protégées sans configuration supplémentaire.
                    // ============================================================
                    .anyRequest().authenticated()
            }

            // Provider d'authentification (BCrypt + UserDetailsService)
            .authenticationProvider(authenticationProvider())

            // Filtre JWT avant le filtre d'authentification standard
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

            // Gestion des exceptions d'authentification
            .exceptionHandling { exceptions ->
                exceptions
                    // Retourner 401 pour les requêtes non authentifiées
                    .authenticationEntryPoint { _, response, authException ->
                        response.contentType = "application/json"
                        response.status = 401
                        response.writer.write("""
                            {
                                "success": false,
                                "message": "Non authentifié: ${authException.message}",
                                "data": null
                            }
                        """.trimIndent())
                    }
                    // Retourner 403 pour les requêtes non autorisées
                    .accessDeniedHandler { _, response, accessDeniedException ->
                        response.contentType = "application/json"
                        response.status = 403
                        response.writer.write("""
                            {
                                "success": false,
                                "message": "Accès refusé: ${accessDeniedException.message}",
                                "data": null
                            }
                        """.trimIndent())
                    }
            }

        return http.build()
    }

    /**
     * Configuration CORS dynamique depuis les propriétés.
     */
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource =
        UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", CorsConfiguration().apply {
                allowedOrigins = corsProperties.allowedOrigins.split(",").map { it.trim() }
                allowedMethods = corsProperties.allowedMethods.split(",").map { it.trim() }
                allowedHeaders = corsProperties.allowedHeaders.split(",").map { it.trim() }
                exposedHeaders = listOf("Authorization", "X-Total-Count", "X-Token-Expired")
                allowCredentials = corsProperties.allowCredentials
                maxAge = 3600  // 1 hour cache for preflight
            })
        }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(10)

    @Bean
    fun authenticationProvider(): AuthenticationProvider {
        return DaoAuthenticationProvider().apply {
            setUserDetailsService(userDetailsService)
            setPasswordEncoder(passwordEncoder())
        }
    }

    @Bean
    fun authenticationManager(config: AuthenticationConfiguration): AuthenticationManager {
        return config.authenticationManager
    }
}

package ma.investpro.security.annotations

import org.springframework.security.access.prepost.PreAuthorize

/**
 * Annotations de sécurité centralisées pour InvestPro.
 *
 * Ces annotations simplifient et standardisent les contrôles d'accès dans les contrôleurs.
 * Grâce à la hiérarchie des rôles (ADMIN > MANAGER > USER), les annotations fonctionnent
 * de manière intuitive:
 *
 * - @ReadAccess: Accessible à tous les utilisateurs authentifiés (USER, MANAGER, ADMIN)
 * - @WriteAccess: Accessible aux MANAGER et ADMIN (opérations de création/modification)
 * - @AdminOnly: Accessible uniquement aux ADMIN (suppression, configuration système)
 *
 * UTILISATION:
 * ============
 *
 * Au niveau de la classe (s'applique à toutes les méthodes):
 * ```kotlin
 * @RestController
 * @RequestMapping("/api/conventions")
 * @ReadAccess  // Toutes les méthodes sont accessibles aux utilisateurs authentifiés
 * class ConventionController {
 *     ...
 * }
 * ```
 *
 * Au niveau de la méthode (surcharge l'annotation de classe):
 * ```kotlin
 * @RestController
 * @RequestMapping("/api/conventions")
 * @ReadAccess
 * class ConventionController {
 *
 *     @GetMapping
 *     fun getAll(): List<Convention>  // Utilise @ReadAccess de la classe
 *
 *     @PostMapping
 *     @WriteAccess  // Surcharge: nécessite MANAGER ou ADMIN
 *     fun create(@RequestBody dto: CreateDTO): Convention
 *
 *     @DeleteMapping("/{id}")
 *     @AdminOnly  // Surcharge: nécessite ADMIN uniquement
 *     fun delete(@PathVariable id: Long)
 * }
 * ```
 *
 * HIÉRARCHIE DES RÔLES:
 * ====================
 * La configuration SecurityConfig définit la hiérarchie:
 * - ADMIN > MANAGER > USER
 *
 * Donc:
 * - @ReadAccess (hasRole('USER'))     -> USER, MANAGER, ADMIN peuvent accéder
 * - @WriteAccess (hasRole('MANAGER')) -> MANAGER, ADMIN peuvent accéder
 * - @AdminOnly (hasRole('ADMIN'))     -> Seul ADMIN peut accéder
 */

/**
 * Accès en lecture seule.
 * Accessible à tous les utilisateurs authentifiés (USER, MANAGER, ADMIN).
 *
 * Utilisation typique:
 * - GET endpoints (listes, détails, recherche)
 * - Endpoints de consultation
 * - Reporting en lecture seule
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('USER')")
annotation class ReadAccess

/**
 * Accès en écriture.
 * Accessible aux MANAGER et ADMIN.
 *
 * Utilisation typique:
 * - POST endpoints (création)
 * - PUT endpoints (modification)
 * - Actions métier (soumettre, valider, rejeter)
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MANAGER')")
annotation class WriteAccess

/**
 * Accès administrateur uniquement.
 * Accessible uniquement aux ADMIN.
 *
 * Utilisation typique:
 * - DELETE endpoints (suppression)
 * - Gestion des utilisateurs
 * - Configuration système
 * - Opérations sensibles
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('ADMIN')")
annotation class AdminOnly

/**
 * Accès public (pas d'authentification requise).
 * Utiliser avec précaution - uniquement pour les endpoints vraiment publics.
 *
 * Note: Cette annotation ne fait rien en soi car la configuration SecurityConfig
 * gère déjà les routes publiques. Elle sert de documentation et de marqueur.
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class PublicAccess

/**
 * Accès propriétaire uniquement.
 * L'utilisateur ne peut accéder qu'à ses propres ressources.
 *
 * Note: Cette annotation nécessite une implémentation personnalisée dans le contrôleur
 * pour vérifier que l'utilisateur actuel est bien le propriétaire de la ressource.
 *
 * Exemple d'utilisation:
 * ```kotlin
 * @GetMapping("/{id}")
 * @OwnerOnly
 * fun getMyProfile(@PathVariable id: Long, @AuthenticationPrincipal user: User): Profile {
 *     if (user.id != id) throw AccessDeniedException("Accès refusé")
 *     return profileService.findById(id)
 * }
 * ```
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("isAuthenticated()")
annotation class OwnerOnly

/**
 * Classe utilitaire avec les expressions SpEL réutilisables.
 * Peut être utilisée pour des cas complexes non couverts par les annotations ci-dessus.
 */
object SecurityExpressions {
    /**
     * Vérifie si l'utilisateur a au moins le rôle USER.
     */
    const val HAS_READ_ACCESS = "hasRole('USER')"

    /**
     * Vérifie si l'utilisateur a au moins le rôle MANAGER.
     */
    const val HAS_WRITE_ACCESS = "hasRole('MANAGER')"

    /**
     * Vérifie si l'utilisateur a le rôle ADMIN.
     */
    const val HAS_ADMIN_ACCESS = "hasRole('ADMIN')"

    /**
     * Vérifie si l'utilisateur est authentifié.
     */
    const val IS_AUTHENTICATED = "isAuthenticated()"

    /**
     * Vérifie si l'utilisateur est le propriétaire de la ressource.
     * Utiliser avec un paramètre nommé 'userId' ou 'ownerId'.
     */
    const val IS_OWNER = "authentication.principal.id == #userId"

    /**
     * Vérifie si l'utilisateur est ADMIN ou propriétaire.
     */
    const val IS_ADMIN_OR_OWNER = "hasRole('ADMIN') or authentication.principal.id == #userId"
}

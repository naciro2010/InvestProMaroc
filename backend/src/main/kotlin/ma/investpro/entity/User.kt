package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

/**
 * Entité représentant un utilisateur du système
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["username"]),
        UniqueConstraint(columnNames = ["email"])
    ]
)
class User(
    @Column(nullable = false, unique = true, length = 50)
    @field:NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @field:Size(min = 3, max = 50, message = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")
    private var username: String = "",

    @Column(nullable = false, unique = true, length = 150)
    @field:NotBlank(message = "L'email est obligatoire")
    @field:Email(message = "L'email doit être valide")
    var email: String = "",

    @Column(nullable = false)
    @field:NotBlank(message = "Le mot de passe est obligatoire")
    private var password: String = "",

    @Column(nullable = false, length = 100)
    @field:NotBlank(message = "Le nom complet est obligatoire")
    @field:Size(max = 100, message = "Le nom complet ne peut pas dépasser 100 caractères")
    var fullName: String = "",

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = [JoinColumn(name = "user_id")])
    @Column(name = "role")
    var roles: MutableSet<String> = mutableSetOf(),

    @Column(nullable = false)
    private var accountNonExpired: Boolean = true,

    @Column(nullable = false)
    private var accountNonLocked: Boolean = true,

    @Column(nullable = false)
    private var credentialsNonExpired: Boolean = true,

    @Column(nullable = false)
    private var enabled: Boolean = true

) : BaseEntity(), UserDetails {

    override fun getAuthorities(): Collection<GrantedAuthority> =
        roles.map { SimpleGrantedAuthority("ROLE_$it") }

    override fun getPassword(): String = password

    fun setPassword(password: String) {
        this.password = password
    }

    override fun getUsername(): String = username

    fun setUsername(username: String) {
        this.username = username
    }

    override fun isAccountNonExpired(): Boolean = accountNonExpired

    override fun isAccountNonLocked(): Boolean = accountNonLocked

    override fun isCredentialsNonExpired(): Boolean = credentialsNonExpired

    override fun isEnabled(): Boolean = enabled
}

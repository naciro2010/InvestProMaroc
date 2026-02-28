package ma.investpro.config

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import ma.investpro.events.ActivityNotificationEvent
import ma.investpro.repository.UserRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class ActivityEventInterceptor(
    private val eventPublisher: ApplicationEventPublisher,
    private val userRepository: UserRepository
) : HandlerInterceptor {

    override fun afterCompletion(request: HttpServletRequest, response: HttpServletResponse, handler: Any, ex: Exception?) {
        if (ex != null || response.status !in 200..299) return

        val method = request.method
        if (method == "GET" || method == "OPTIONS") return

        val uri = request.requestURI
        if (!uri.startsWith("/api/") || uri.startsWith("/api/auth") || uri.startsWith("/api/notifications") || uri.startsWith("/api/team-messages")) {
            return
        }

        val username = SecurityContextHolder.getContext().authentication?.name ?: return
        val actor = userRepository.findByUsername(username).orElse(null) ?: return
        val actorId = actor.id ?: return

        val resource = uri.removePrefix("/api/").split('/').firstOrNull()?.replace('-', ' ') ?: "ressource"
        val title = "Activité équipe: ${resource.replaceFirstChar { it.uppercase() }}"
        val message = "${actor.fullName} a effectué l'action ${method.uppercase()} sur ${uri.removePrefix("/api")}."

        eventPublisher.publishEvent(
            ActivityNotificationEvent(
                actorUserId = actorId,
                title = title,
                message = message,
                type = if (method == "DELETE") "warning" else "info",
                contextType = resource,
                contextId = request.getParameter("id")
            )
        )
    }
}

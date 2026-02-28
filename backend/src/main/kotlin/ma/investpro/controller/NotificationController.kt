package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.NotificationDTO
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.service.NotificationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/notifications")
@ReadAccess
class NotificationController(
    private val notificationService: NotificationService
) {

    @GetMapping
    fun getMyNotifications(
        @RequestParam(defaultValue = "false") unreadOnly: Boolean
    ): ResponseEntity<ApiResponse<List<NotificationDTO>>> = ResponseEntity.ok(
        ApiResponse.success(notificationService.getMyNotifications(unreadOnly), "Notifications récupérées")
    )

    @GetMapping("/unread-count")
    fun unreadCount(): ResponseEntity<ApiResponse<Long>> = ResponseEntity.ok(
        ApiResponse.success(notificationService.getUnreadCount(), "Compteur récupéré")
    )

    @PutMapping("/{id}/read")
    fun markAsRead(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        notificationService.markAsRead(id)
        return ResponseEntity.ok(ApiResponse.success("OK", "Notification marquée comme lue"))
    }

    @PutMapping("/read-all")
    fun markAllAsRead(): ResponseEntity<ApiResponse<String>> {
        notificationService.markAllAsRead()
        return ResponseEntity.ok(ApiResponse.success("OK", "Toutes les notifications sont marquées comme lues"))
    }
}

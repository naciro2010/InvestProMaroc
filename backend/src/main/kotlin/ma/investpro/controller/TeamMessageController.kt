package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.*
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.service.TeamMessageService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/team-messages")
@ReadAccess
class TeamMessageController(
    private val teamMessageService: TeamMessageService
) {

    @GetMapping("/conversations")
    fun getConversations(): ResponseEntity<ApiResponse<List<ConversationItemDTO>>> = ResponseEntity.ok(
        ApiResponse.success(teamMessageService.getConversations(), "Conversations récupérées")
    )

    @GetMapping("/with/{userId}")
    fun getConversation(@PathVariable userId: Long): ResponseEntity<ApiResponse<List<TeamMessageDTO>>> = ResponseEntity.ok(
        ApiResponse.success(teamMessageService.getConversation(userId), "Messages récupérés")
    )

    @PostMapping
    fun send(@Valid @RequestBody request: CreateMessageRequest): ResponseEntity<ApiResponse<TeamMessageDTO>> = ResponseEntity.ok(
        ApiResponse.success(teamMessageService.sendMessage(request), "Message envoyé")
    )

    @PutMapping("/{id}/read")
    fun markAsRead(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        teamMessageService.markAsRead(id)
        return ResponseEntity.ok(ApiResponse.success("OK", "Message marqué comme lu"))
    }
}

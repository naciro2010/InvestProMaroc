package ma.investpro.events

data class ActivityNotificationEvent(
    val actorUserId: Long,
    val title: String,
    val message: String,
    val type: String = "info",
    val contextType: String? = null,
    val contextId: String? = null
)

data class DirectMessageNotificationEvent(
    val recipientId: Long,
    val senderName: String,
    val preview: String
)

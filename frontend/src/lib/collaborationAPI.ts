import { api } from './api'

interface ApiWrapper<T> {
  success: boolean
  message: string
  data: T
}

export interface AppNotification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  contextType?: string | null
  contextId?: string | null
  read: boolean
  createdAt?: string
}

export interface TeamMessage {
  id: number
  senderId: number
  senderName: string
  recipientId: number
  recipientName: string
  content: string
  read: boolean
  createdAt?: string
}

export interface ConversationItem {
  userId: number
  userName: string
  lastMessage: string
  lastMessageAt?: string
  unreadCount: number
}

export const collaborationAPI = {
  getNotifications: (unreadOnly = false) =>
    api.get<ApiWrapper<AppNotification[]>>('/notifications', { params: { unreadOnly } }),
  getUnreadCount: () => api.get<ApiWrapper<number>>('/notifications/unread-count'),
  markNotificationRead: (id: number) => api.put<ApiWrapper<string>>(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put<ApiWrapper<string>>('/notifications/read-all'),

  getConversations: () => api.get<ApiWrapper<ConversationItem[]>>('/team-messages/conversations'),
  getConversationWith: (userId: number) => api.get<ApiWrapper<TeamMessage[]>>(`/team-messages/with/${userId}`),
  sendMessage: (recipientId: number, content: string) =>
    api.post<ApiWrapper<TeamMessage>>('/team-messages', { recipientId, content }),
  markMessageRead: (id: number) => api.put<ApiWrapper<string>>(`/team-messages/${id}/read`),
}

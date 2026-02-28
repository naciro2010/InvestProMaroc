import { useEffect, useMemo, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { collaborationAPI, ConversationItem, TeamMessage } from '@/lib/collaborationAPI'
import api from '@/lib/api'

interface SimpleUser { id: number; fullName: string; username: string }

const TeamMessagingPage = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [users, setUsers] = useState<SimpleUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [messages, setMessages] = useState<TeamMessage[]>([])
  const [newMessage, setNewMessage] = useState('')

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId])

  const fetchConversations = async () => {
    const res = await collaborationAPI.getConversations()
    setConversations(res.data.data)
  }

  const fetchUsers = async () => {
    const res = await api.get('/users')
    const list = Array.isArray(res.data?.data) ? res.data.data : res.data
    setUsers((list || []).map((u: any) => ({ id: u.id, fullName: u.fullName || u.username, username: u.username })))
  }

  const fetchMessages = async (userId: number) => {
    const res = await collaborationAPI.getConversationWith(userId)
    setMessages(res.data.data)
  }

  useEffect(() => {
    fetchConversations()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!selectedUserId && conversations.length > 0) setSelectedUserId(conversations[0].userId)
  }, [conversations, selectedUserId])

  useEffect(() => {
    if (!selectedUserId) return
    fetchMessages(selectedUserId)
  }, [selectedUserId])

  const handleSend = async () => {
    if (!selectedUserId || !newMessage.trim()) return
    await collaborationAPI.sendMessage(selectedUserId, newMessage.trim())
    setNewMessage('')
    fetchMessages(selectedUserId)
    fetchConversations()
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-7rem)] grid grid-cols-12 gap-4">
        <aside className="col-span-4 bg-white rounded-xl border border-gray-200 p-3 overflow-y-auto">
          <h2 className="font-semibold mb-3">Conversations d'équipe</h2>
          {conversations.map(conv => (
            <button key={conv.userId} onClick={() => setSelectedUserId(conv.userId)} className={`w-full text-left p-3 rounded-lg mb-2 ${selectedUserId === conv.userId ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
              <div className="font-medium">{conv.userName}</div>
              <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
              {conv.unreadCount > 0 && <span className="text-xs text-blue-600">{conv.unreadCount} non lus</span>}
            </button>
          ))}

          <div className="mt-4">
            <label className="text-xs text-gray-500">Nouveau message vers</label>
            <select className="w-full mt-1 border rounded-md p-2" value={selectedUserId ?? ''} onChange={(e) => setSelectedUserId(Number(e.target.value))}>
              <option value="">Choisir membre</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
            </select>
          </div>
        </aside>

        <section className="col-span-8 bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
          <h2 className="font-semibold mb-4">{selectedUser ? `Discussion avec ${selectedUser.fullName}` : 'Sélectionnez un membre'}</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map(msg => (
              <div key={msg.id} className={`max-w-[70%] p-3 rounded-xl ${msg.recipientId === selectedUserId ? 'bg-gray-100' : 'bg-blue-100 ml-auto'}`}>
                <div className="text-xs text-gray-500 mb-1">{msg.senderName}</div>
                <div>{msg.content}</div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t mt-3 flex gap-2">
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" placeholder="Écrire un message..." />
            <button onClick={handleSend} className="bg-blue-600 text-white px-4 rounded-lg">Envoyer</button>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default TeamMessagingPage

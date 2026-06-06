import { create } from 'zustand'

let msgIdCounter = 1

const useChatStore = create((set, get) => ({
  conversations: [
    {
      id: 'conv-1',
      title: 'Market Analysis Report',
      agentId: 'analyst',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      messageCount: 12,
    },
    {
      id: 'conv-2',
      title: 'Q3 Financial Summary',
      agentId: 'finance',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      messageCount: 8,
    },
    {
      id: 'conv-3',
      title: 'Product Roadmap Planning',
      agentId: 'strategy',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      messageCount: 24,
    },
  ],
  activeConversationId: null,
  messages: {},
  isStreaming: false,
  streamingMessageId: null,
  inputValue: '',
  attachments: [],
  isTyping: false,
  tokenUsage: { prompt: 0, completion: 0, total: 0 },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  createConversation: (agentId = 'general') => {
    const id = `conv-${Date.now()}`
    const conv = {
      id,
      title: 'New Conversation',
      agentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    }
    set((state) => ({
      conversations: [conv, ...state.conversations],
      activeConversationId: id,
    }))
    return id
  },

  deleteConversation: (id) => {
    set((state) => {
      const convs = state.conversations.filter((c) => c.id !== id)
      const msgs = { ...state.messages }
      delete msgs[id]
      return {
        conversations: convs,
        messages: msgs,
        activeConversationId: state.activeConversationId === id ? (convs[0]?.id || null) : state.activeConversationId,
      }
    })
  },

  renameConversation: (id, title) => {
    set((state) => ({
      conversations: state.conversations.map((c) => c.id === id ? { ...c, title } : c),
    }))
  },

  getMessages: (convId) => {
    return get().messages[convId] || []
  },

  addMessage: (convId, message) => {
    const id = message.id || `msg-${msgIdCounter++}`
    const msg = {
      id,
      role: 'user',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'sent',
      attachments: [],
      ...message,
    }
    set((state) => ({
      messages: {
        ...state.messages,
        [convId]: [...(state.messages[convId] || []), msg],
      },
      conversations: state.conversations.map((c) =>
        c.id === convId ? { ...c, messageCount: (c.messageCount || 0) + 1, updatedAt: new Date().toISOString() } : c
      ),
    }))
    return id
  },

  updateMessage: (convId, msgId, updates) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [convId]: (state.messages[convId] || []).map((m) =>
          m.id === msgId ? { ...m, ...updates } : m
        ),
      },
    }))
  },

  appendToMessage: (convId, msgId, chunk) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [convId]: (state.messages[convId] || []).map((m) =>
          m.id === msgId ? { ...m, content: m.content + chunk } : m
        ),
      },
    }))
  },

  setStreaming: (isStreaming, messageId = null) => set({ isStreaming, streamingMessageId: messageId }),

  setInputValue: (v) => set({ inputValue: v }),

  addAttachment: (file) => {
    set((state) => ({
      attachments: [...state.attachments, { id: Date.now(), file, name: file.name, size: file.size, type: file.type, progress: 0, status: 'pending' }]
    }))
  },

  removeAttachment: (id) => set((state) => ({ attachments: state.attachments.filter((a) => a.id !== id) })),

  clearAttachments: () => set({ attachments: [] }),

  setTyping: (isTyping) => set({ isTyping }),

  updateTokenUsage: (usage) => set({ tokenUsage: usage }),

  updateConversationTitle: (convId, title) => {
    set((state) => ({
      conversations: state.conversations.map((c) => c.id === convId ? { ...c, title } : c),
    }))
  },
}))

export default useChatStore

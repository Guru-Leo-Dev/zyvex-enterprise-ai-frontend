import { useRef, useCallback } from 'react'
import { toast } from 'react-toastify'
import useChatStore from '@/store/chatStore'
import useAgentStore from '@/store/agentStore'
import { chatService } from '@/services/chatService'

export function useChat() {
  const abortRef = useRef(null)
  const {
    activeConversationId, createConversation, addMessage,
    updateMessage, appendToMessage, setStreaming, setTyping,
    setInputValue, inputValue, attachments, clearAttachments,
    updateTokenUsage, updateConversationTitle, getMessages,
  } = useChatStore()
  const { getActiveAgent } = useAgentStore()

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() && attachments.length === 0) return

    const agent = getActiveAgent()
    let convId = activeConversationId
    if (!convId) convId = createConversation(agent.id)

    // Add user message
    addMessage(convId, {
      role: 'user',
      content: content.trim(),
      attachments: [...attachments],
      status: 'sent',
    })

    setInputValue('')
    clearAttachments()

    // Add placeholder assistant message
    const assistantMsgId = addMessage(convId, {
      role: 'assistant',
      content: '',
      agentId: agent.id,
      status: 'streaming',
    })

    setStreaming(true, assistantMsgId)
    setTyping(true)

    // Update title from first message
    const msgs = getMessages(convId)
    if (msgs.length <= 2) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
      updateConversationTitle(convId, title)
    }

    // Build messages for API
    const apiMessages = getMessages(convId)
      .filter(m => m.status !== 'streaming' || m.id !== assistantMsgId)
      .filter(m => m.content)
      .map(m => ({ role: m.role, content: m.content }))

    abortRef.current = new AbortController()

    await chatService.streamFromAnthropic({
      agent,
      messages: apiMessages,
      signal: abortRef.current.signal,
      onChunk: (chunk) => {
        setTyping(false)
        appendToMessage(convId, assistantMsgId, chunk)
      },
      onComplete: ({ usage }) => {
        updateMessage(convId, assistantMsgId, { status: 'done' })
        setStreaming(false, null)
        setTyping(false)
        if (usage) updateTokenUsage({ prompt: usage.input_tokens, completion: usage.output_tokens, total: usage.input_tokens + usage.output_tokens })
      },
      onError: (error) => {
        updateMessage(convId, assistantMsgId, { status: 'error', error: error.message })
        setStreaming(false, null)
        setTyping(false)
        toast.error(error.message || 'Something went wrong. Please try again.')
      },
    })
  }, [activeConversationId, attachments, inputValue, getActiveAgent])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setStreaming(false, null)
    setTyping(false)
    const { activeConversationId, streamingMessageId, messages } = useChatStore.getState()
    if (activeConversationId && streamingMessageId) {
      useChatStore.getState().updateMessage(activeConversationId, streamingMessageId, { status: 'done' })
    }
  }, [])

  const retryMessage = useCallback(async (msgId) => {
    const { activeConversationId, messages } = useChatStore.getState()
    if (!activeConversationId) return
    const convMsgs = messages[activeConversationId] || []
    const idx = convMsgs.findIndex(m => m.id === msgId)
    if (idx < 1) return
    const prevUser = convMsgs[idx - 1]
    if (prevUser?.role !== 'user') return
    useChatStore.getState().updateMessage(activeConversationId, msgId, { content: '', status: 'streaming' })
    const agent = useAgentStore.getState().getActiveAgent()
    setStreaming(true, msgId)
    setTyping(true)
    const apiMessages = convMsgs.slice(0, idx).filter(m => m.content).map(m => ({ role: m.role, content: m.content }))
    abortRef.current = new AbortController()
    await chatService.streamFromAnthropic({
      agent,
      messages: apiMessages,
      signal: abortRef.current.signal,
      onChunk: (chunk) => { setTyping(false); appendToMessage(activeConversationId, msgId, chunk) },
      onComplete: () => { updateMessage(activeConversationId, msgId, { status: 'done' }); setStreaming(false, null); setTyping(false) },
      onError: (error) => { updateMessage(activeConversationId, msgId, { status: 'error', error: error.message }); setStreaming(false, null); setTyping(false) },
    })
  }, [])

  return { sendMessage, stopStreaming, retryMessage }
}

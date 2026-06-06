import apiClient from './apiClient'

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

export const chatService = {
  // Stream directly from Anthropic (for demo/direct use)
  async streamFromAnthropic({ agent, messages, onChunk, onComplete, onError, signal }) {
    try {
      const response = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: agent.model || 'claude-sonnet-4-20250514',
          max_tokens: agent.maxTokens || 4096,
          system: agent.systemPrompt,
          temperature: agent.temperature || 0.7,
          stream: true,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || 'Stream failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let usage = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'content_block_delta' && data.delta?.type === 'text_delta') {
              fullContent += data.delta.text
              onChunk?.(data.delta.text)
            }
            if (data.type === 'message_delta' && data.usage) {
              usage = data.usage
            }
          } catch {}
        }
      }

      onComplete?.({ content: fullContent, usage })
    } catch (error) {
      if (error.name === 'AbortError') return
      onError?.(error)
    }
  },

  // Via backend proxy
  async streamFromBackend({ convId, messages, agentId, onChunk, onComplete, onError, signal }) {
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiClient.defaults.headers.common?.Authorization || '',
        },
        body: JSON.stringify({ conversationId: convId, messages, agentId }),
        signal,
      })
      // same SSE parsing as above
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value, { stream: true }).split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.content) { fullContent += data.content; onChunk?.(data.content) }
            if (data.done) { onComplete?.({ content: fullContent, usage: data.usage }); return }
          } catch {}
        }
      }
      onComplete?.({ content: fullContent })
    } catch (error) {
      if (error.name === 'AbortError') return
      onError?.(error)
    }
  },

  async getConversations() {
    const { data } = await apiClient.get('/conversations')
    return data
  },

  async getMessages(convId, { page = 1, limit = 50 } = {}) {
    const { data } = await apiClient.get(`/conversations/${convId}/messages`, { params: { page, limit } })
    return data
  },

  async uploadFile(file, onProgress) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post('/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
    })
    return data
  },
}

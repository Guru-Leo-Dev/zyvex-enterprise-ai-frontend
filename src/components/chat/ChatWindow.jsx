import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, Sparkles, Zap, BarChart3, DollarSign, Code2, Target } from 'lucide-react'
import useChatStore from '@/store/chatStore'
import useAgentStore from '@/store/agentStore'
import ChatMessage from './ChatMessage'
import { useChat } from '@/hooks/useChat'

const STARTERS = [
  { text: 'Analyze our Q3 revenue trends', icon: BarChart3 },
  { text: 'Write a Python data pipeline', icon: Code2 },
  { text: 'Summarize this document', icon: Sparkles },
  { text: 'Create a market report', icon: Target },
]

function EmptyState() {
  const { sendMessage } = useChat()
  const agent = useAgentStore(s => s.getActiveAgent())

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center h-full px-6 py-12 text-center"
    >
      {/* Animated logo */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
        style={{ background: agent.gradient, boxShadow: `0 0 40px ${agent.color}40` }}>
        {agent.icon}
      </motion.div>

      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        Hi, I'm {agent.name}
      </h2>
      <p className="text-sm max-w-xs leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
        {agent.description}. Ask me anything or choose a starter.
      </p>

      {/* Starter prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
        {STARTERS.map((s, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            onClick={() => sendMessage(s.text)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-sm transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)',
            }}>
            <s.icon size={14} style={{ color: agent.color, flexShrink: 0 }} />
            <span className="text-xs">{s.text}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default function ChatWindow() {
  const bottomRef = useRef(null)
  const scrollRef = useRef(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const { retryMessage } = useChat()

  const { activeConversationId, getMessages, isStreaming, tokenUsage } = useChatStore()
  const messages = activeConversationId ? getMessages(activeConversationId) : []

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, isStreaming])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120)
  }, [])

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Token usage bar */}
      {tokenUsage.total > 0 && (
        <div className="flex items-center justify-end gap-3 px-4 py-1.5 text-xs" style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
            ↑ {tokenUsage.prompt.toLocaleString()} · ↓ {tokenUsage.completion.toLocaleString()} · Σ {tokenUsage.total.toLocaleString()} tokens
          </span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} onRetry={retryMessage} />
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-4 right-4 p-2 rounded-full z-10 shadow-lg transition-all hover:scale-110"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
            <ArrowDown size={15} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, RefreshCw, AlertCircle, User } from 'lucide-react'
import useAgentStore from '@/store/agentStore'
import useThemeStore from '@/store/themeStore'
import { cn } from '@/utils/helpers'

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)
  const { theme } = useThemeStore()
  const isDark = theme !== 'light'

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-3 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
        <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>{language || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all hover:bg-[var(--bg-elevated)]" style={{ color: 'var(--text-muted)' }}>
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={isDark ? oneDark : oneLight}
        customStyle={{ margin: 0, borderRadius: 0, background: 'var(--bg-secondary)', fontSize: '0.8rem', lineHeight: 1.6 }}
        showLineNumbers={String(children).split('\n').length > 5}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  )
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 1, 2].map(i => (
      <div key={i} className="w-2 h-2 rounded-full typing-dot" style={{ background: 'var(--text-muted)', animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
)

const ChatMessage = memo(({ message, onRetry }) => {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.status === 'error'
  const isStreaming = message.status === 'streaming'

  const agent = useAgentStore((s) => s.agents.find(a => a.id === message.agentId))

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ background: 'var(--gradient-brand)' }}>
            <User size={13} />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: agent?.gradient || 'var(--gradient-brand)' }}>
            {agent?.icon || '✦'}
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col max-w-[75%] min-w-0', isUser ? 'items-end' : 'items-start')}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{agent?.name || 'Zyvex'}</span>
            {isStreaming && (
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-primary)', fontSize: '0.6rem' }}>
                ● streaming
              </span>
            )}
          </div>
        )}

        <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed relative', isUser ? 'rounded-tr-sm' : 'rounded-tl-sm')}
          style={{
            background: isUser ? 'var(--gradient-brand)' : isError ? 'rgba(220,38,38,0.08)' : 'var(--bg-elevated)',
            color: isUser ? '#fff' : isError ? 'var(--accent-danger)' : 'var(--text-primary)',
            border: isUser ? 'none' : isError ? '1px solid rgba(220,38,38,0.2)' : '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}>

          {isError ? (
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-xs">Response failed</p>
                <p className="text-xs mt-1 opacity-80">{message.error || 'An error occurred. Please try again.'}</p>
              </div>
            </div>
          ) : isStreaming && !message.content ? (
            <TypingIndicator />
          ) : isUser ? (
            <div className="prose-chat">{message.content}</div>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <CodeBlock language={match[1]}>{children}</CodeBlock>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    )
                  },
                  pre({ children }) { return <>{children}</> },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse" style={{ background: 'var(--accent-primary)' }} />}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={cn('flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity', isUser ? 'flex-row-reverse' : 'flex-row')}>
          {!isUser && message.content && !isStreaming && (
            <button onClick={handleCopy} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-[var(--bg-elevated)]"
              style={{ color: 'var(--text-muted)' }}>
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          {isError && onRetry && (
            <button onClick={() => onRetry(message.id)} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-colors"
              style={{ color: 'var(--accent-primary)', background: 'var(--bg-elevated)' }}>
              <RefreshCw size={10} /> Retry
            </button>
          )}
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  )
})

ChatMessage.displayName = 'ChatMessage'
export default ChatMessage

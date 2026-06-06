import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Square, X, Loader2 } from 'lucide-react'
import useChatStore from '@/store/chatStore'
import { useChat } from '@/hooks/useChat'
import { formatBytes, getFileIcon } from '@/utils/helpers'
import { cn } from '@/utils/helpers'

export default function ChatInput() {
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)

  const { inputValue, setInputValue, attachments, addAttachment, removeAttachment, isStreaming } = useChatStore()
  const { sendMessage, stopStreaming } = useChat()

  const handleSend = async () => {
    if (isStreaming) { stopStreaming(); return }
    const val = inputValue.trim()
    if (!val && attachments.length === 0) return
    await sendMessage(val)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (files) => {
    Array.from(files).forEach(file => {
      if (file.size > 25 * 1024 * 1024) { alert('File too large (max 25MB)'); return }
      addAttachment(file)
    })
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileChange(e.dataTransfer.files)
  }, [])

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  const autoResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  const canSend = (inputValue.trim() || attachments.length > 0) && !isStreaming

  return (
    <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att) => (
              <motion.div key={att.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                <span>{getFileIcon(att.type)}</span>
                <div>
                  <p className="font-medium truncate max-w-24" style={{ color: 'var(--text-primary)' }}>{att.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{formatBytes(att.size)}</p>
                </div>
                <button onClick={() => removeAttachment(att.id)} className="ml-1 hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input */}
      <div
        onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
        className={cn('relative flex items-end gap-2 rounded-2xl px-3 py-2.5 transition-all duration-200', isDragging && 'ring-2 ring-[var(--accent-primary)]')}
        style={{ background: 'var(--bg-secondary)', border: `1px solid ${isDragging ? 'var(--accent-primary)' : 'var(--border-default)'}` }}>

        {isDragging && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center text-sm font-medium z-10"
            style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--accent-primary)' }}>
            Drop files here
          </div>
        )}

        {/* Upload */}
        <button onClick={() => fileRef.current?.click()} className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
          style={{ color: 'var(--text-muted)' }}>
          <Paperclip size={16} />
        </button>
        <input ref={fileRef} type="file" multiple className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.json,.md"
          onChange={e => handleFileChange(e.target.files)} />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={e => { setInputValue(e.target.value); autoResize(e) }}
          onKeyDown={handleKeyDown}
          placeholder="Message Zyvex..."
          rows={1}
          className="flex-1 resize-none outline-none text-sm leading-relaxed bg-transparent min-h-[20px]"
          style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-primary)', maxHeight: '200px' }}
        />

        {/* Send / Stop */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!canSend && !isStreaming}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: isStreaming ? 'var(--accent-danger)' : canSend ? 'var(--gradient-brand)' : 'var(--bg-tertiary)',
            color: canSend || isStreaming ? '#fff' : 'var(--text-muted)',
          }}>
          {isStreaming ? <Square size={13} fill="currentColor" /> : <Send size={13} />}
        </motion.button>
      </div>

      <p className="text-center mt-1.5 text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
        ↵ Send · Shift+↵ New line · Drag files to attach
      </p>
    </div>
  )
}

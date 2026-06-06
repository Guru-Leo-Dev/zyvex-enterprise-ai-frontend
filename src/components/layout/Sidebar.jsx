import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, Trash2, Bot, FileText, ChevronDown, Edit2, Check, X } from 'lucide-react'
import useChatStore from '@/store/chatStore'
import useAgentStore from '@/store/agentStore'
import { cn, formatRelativeTime, truncate } from '@/utils/helpers'

export default function Sidebar({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('chats')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const {
    conversations, activeConversationId, setActiveConversation,
    createConversation, deleteConversation, renameConversation,
  } = useChatStore()

  const { agents, activeAgentId, setActiveAgent } = useAgentStore()

  const handleNewChat = () => {
    createConversation(activeAgentId)
    onClose?.()
  }

  const handleSelectConv = (id) => {
    setActiveConversation(id)
    onClose?.()
  }

  const startEdit = (conv, e) => {
    e.stopPropagation()
    setEditingId(conv.id)
    setEditTitle(conv.title)
  }

  const confirmEdit = (id, e) => {
    e.stopPropagation()
    if (editTitle.trim()) renameConversation(id, editTitle.trim())
    setEditingId(null)
  }

  const tabs = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'docs', label: 'Docs', icon: FileText },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--gradient-brand)' }}>Z</div>
        <span className="font-display font-bold text-lg gradient-text" style={{ fontFamily: 'var(--font-display)' }}>Zyvex</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: 'auto', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--font-mono)' }}>AI</span>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <button onClick={handleNewChat} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: 'var(--gradient-brand)', color: '#fff' }}>
          <Plus size={15} />
          New Conversation
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-3 mb-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
            }}>
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2">
        <AnimatePresence mode="wait">
          {activeTab === 'chats' && (
            <motion.div key="chats" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
              {conversations.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const agent = useAgentStore.getState().agents.find(a => a.id === conv.agentId)
                  const isActive = conv.id === activeConversationId
                  return (
                    <motion.div key={conv.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleSelectConv(conv.id)}
                      className="group relative flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer mb-0.5 transition-all"
                      style={{
                        background: isActive ? 'var(--bg-elevated)' : 'transparent',
                        boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                      }}>
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                        style={{ background: agent?.gradient || 'var(--gradient-brand)', opacity: isActive ? 1 : 0.7 }}>
                        {agent?.icon || '✦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingId === conv.id ? (
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') confirmEdit(conv.id, e); if (e.key === 'Escape') setEditingId(null) }}
                              className="flex-1 text-xs px-1.5 py-0.5 rounded outline-none"
                              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                              autoFocus />
                            <button onClick={e => confirmEdit(conv.id, e)} style={{ color: 'var(--accent-success)' }}><Check size={11} /></button>
                            <button onClick={e => { e.stopPropagation(); setEditingId(null) }} style={{ color: 'var(--accent-danger)' }}><X size={11} /></button>
                          </div>
                        ) : (
                          <p className="text-xs font-medium leading-snug truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {conv.title}
                          </p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {agent?.name} · {formatRelativeTime(conv.updatedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => startEdit(conv, e)} className="p-1 rounded hover:bg-black/10 transition-colors" style={{ color: 'var(--text-muted)' }}><Edit2 size={11} /></button>
                        <button onClick={e => { e.stopPropagation(); deleteConversation(conv.id) }} className="p-1 rounded transition-colors" style={{ color: 'var(--accent-danger)' }}><Trash2 size={11} /></button>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}

          {activeTab === 'agents' && (
            <motion.div key="agents" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
              {agents.map((agent) => (
                <button key={agent.id} onClick={() => setActiveAgent(agent.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-all"
                  style={{
                    background: activeAgentId === agent.id ? 'var(--bg-elevated)' : 'transparent',
                    boxShadow: activeAgentId === agent.id ? 'var(--shadow-sm)' : 'none',
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: agent.gradient }}>
                    {agent.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{agent.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{agent.description}</p>
                  </div>
                  {activeAgentId === agent.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-success)' }} />
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div key="docs" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
              <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                <FileText size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">No documents uploaded</p>
                <p className="text-xs mt-1 opacity-60">Upload files in Settings</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="text-center" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
          Zyvex Enterprise · v2.1.0
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block h-full flex-shrink-0" style={{ width: 'var(--sidebar-width)' }}>
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
              style={{ width: 'var(--sidebar-width)' }}>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

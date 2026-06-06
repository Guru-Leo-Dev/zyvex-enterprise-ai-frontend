import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Bot, Upload, User, Sliders, Check } from 'lucide-react'
import useThemeStore, { THEMES } from '@/store/themeStore'
import useAgentStore from '@/store/agentStore'
import useAuthStore from '@/store/authStore'

function ThemeSection() {
  const { theme, setTheme } = useThemeStore()
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Appearance</h3>
      <div className="grid grid-cols-2 gap-2">
        {THEMES.map((t) => (
          <button key={t.id} onClick={() => setTheme(t.id)}
            className="relative flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
            style={{
              background: theme === t.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
              border: `1px solid ${theme === t.id ? 'var(--accent-primary)' : 'var(--border-default)'}`,
            }}>
            <span className="text-xl">{t.icon}</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
            </div>
            {theme === t.id && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-primary)' }}>
                <Check size={10} color="#fff" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function AgentsSection() {
  const { agents, activeAgentId, setActiveAgent } = useAgentStore()
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Active Agent</h3>
      <div className="flex flex-col gap-1.5">
        {agents.map((agent) => (
          <button key={agent.id} onClick={() => setActiveAgent(agent.id)}
            className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
            style={{
              background: activeAgentId === agent.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
              border: `1px solid ${activeAgentId === agent.id ? 'var(--accent-primary)' : 'var(--border-default)'}`,
            }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: agent.gradient }}>{agent.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{agent.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{agent.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs flex-shrink-0">
              <span className="px-2 py-0.5 rounded-full font-mono" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                T={agent.temperature}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ModelSection() {
  const { getActiveAgent, updateAgent, activeAgentId } = useAgentStore()
  const agent = getActiveAgent()
  const models = [
    { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', speed: 'Fast', quality: 'High' },
    { id: 'claude-opus-4-20250514', label: 'Claude Opus 4', speed: 'Slower', quality: 'Best' },
    { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', speed: 'Fastest', quality: 'Good' },
  ]
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Model Selection</h3>
      <div className="flex flex-col gap-1.5">
        {models.map((m) => (
          <button key={m.id} onClick={() => updateAgent(activeAgentId, { model: m.id })}
            className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
            style={{
              background: agent.model === m.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
              border: `1px solid ${agent.model === m.id ? 'var(--accent-primary)' : 'var(--border-default)'}`,
            }}>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Speed: {m.speed} · Quality: {m.quality}</p>
            </div>
            {agent.model === m.id && <Check size={14} style={{ color: 'var(--accent-primary)' }} />}
          </button>
        ))}
      </div>
    </div>
  )
}

const TABS = [
  { id: 'appearance', label: 'Theme', icon: Palette, component: ThemeSection },
  { id: 'agents', label: 'Agents', icon: Bot, component: AgentsSection },
  { id: 'model', label: 'Model', icon: Sliders, component: ModelSection },
]

export default function SettingsModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('appearance')
  const ActiveComponent = TABS.find(t => t.id === tab)?.component || ThemeSection

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-lg rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xl)', maxHeight: '85vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h2 className="font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Settings</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Configure your Zyvex experience</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pt-3" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: tab === t.id ? 'var(--bg-secondary)' : 'transparent',
                    color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>
                  <t.icon size={12} />{t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                  <ActiveComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

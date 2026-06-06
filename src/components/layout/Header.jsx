import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Settings, ChevronDown, LogOut, User, Shield, Moon, Sun } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import useThemeStore, { THEMES } from '@/store/themeStore'
import useAgentStore from '@/store/agentStore'

export default function Header({ onMenuToggle, onSettingsOpen }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, role, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const { getActiveAgent } = useAgentStore()
  const agent = getActiveAgent()

  const roleColors = { admin: '#2563eb', user: '#059669', viewer: '#d97706' }
  const roleColor = roleColors[role] || '#a1a1aa'

  return (
    <header className="flex items-center gap-3 px-4 h-full relative" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
      {/* Mobile menu toggle */}
      <button onClick={onMenuToggle} className="md:hidden p-2 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]" style={{ color: 'var(--text-secondary)' }}>
        <Menu size={18} />
      </button>

      {/* Agent indicator */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs" style={{ background: agent.gradient }}>{agent.icon}</div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{agent.name}</span>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-success)' }} />
        </div>
      </div>

      {/* Logo center on mobile */}
      <div className="absolute left-1/2 -translate-x-1/2 md:hidden flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--gradient-brand)' }}>Z</div>
        <span className="font-bold text-sm gradient-text" style={{ fontFamily: 'var(--font-display)' }}>Zyvex</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Quick theme toggle */}
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
          style={{ color: 'var(--text-secondary)' }}>
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Settings */}
        <button onClick={onSettingsOpen} className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]" style={{ color: 'var(--text-secondary)' }}>
          <Settings size={16} />
        </button>

        {/* Profile */}
        <div className="relative ml-1">
          <button onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: 'var(--gradient-brand)' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium leading-none" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{user?.email}</p>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xl)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: 'var(--gradient-brand)' }}>
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Shield size={9} style={{ color: roleColor }} />
                        <span style={{ color: roleColor, fontSize: '0.65rem', textTransform: 'capitalize', fontWeight: 600 }}>{role}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-1.5">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-secondary)]" style={{ color: 'var(--text-secondary)' }}>
                    <User size={14} /> Profile Settings
                  </button>
                  <button onClick={() => { setProfileOpen(false); logout() }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ color: 'var(--accent-danger)' }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

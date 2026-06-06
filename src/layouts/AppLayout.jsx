import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ChatWindow from '@/components/chat/ChatWindow'
import ChatInput from '@/components/chat/ChatInput'
import SettingsModal from '@/components/settings/SettingsModal'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Header */}
        <div style={{ height: 'var(--header-height)', flexShrink: 0 }}>
          <Header
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            onSettingsOpen={() => setSettingsOpen(true)}
          />
        </div>

        {/* Chat area */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <ChatWindow />
          <ChatInput />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

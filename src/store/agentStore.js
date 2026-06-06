import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_AGENTS = [
  {
    id: 'general',
    name: 'Zyvex Assistant',
    description: 'General purpose AI assistant for any task',
    model: 'claude-sonnet-4-20250514',
    icon: '✦',
    color: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    systemPrompt: 'You are Zyvex, a helpful, accurate and thoughtful AI assistant.',
    capabilities: ['chat', 'analysis', 'writing', 'code'],
    temperature: 0.7,
    maxTokens: 4096,
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    description: 'Specialized in data analysis and insights',
    model: 'claude-sonnet-4-20250514',
    icon: '📊',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #0891b2)',
    systemPrompt: 'You are a data analyst expert. Provide precise, data-driven insights with clear visualizations and actionable recommendations.',
    capabilities: ['analysis', 'data', 'reporting'],
    temperature: 0.3,
    maxTokens: 8192,
  },
  {
    id: 'finance',
    name: 'Finance Advisor',
    description: 'Financial analysis, planning, and reporting',
    model: 'claude-sonnet-4-20250514',
    icon: '💹',
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #dc2626)',
    systemPrompt: 'You are a financial advisor with expertise in corporate finance, investment analysis, and financial reporting.',
    capabilities: ['finance', 'analysis', 'reporting'],
    temperature: 0.2,
    maxTokens: 8192,
  },
  {
    id: 'strategy',
    name: 'Strategy Consultant',
    description: 'Business strategy and competitive analysis',
    model: 'claude-sonnet-4-20250514',
    icon: '🎯',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #db2777)',
    systemPrompt: 'You are a strategic business consultant with expertise in competitive analysis, market positioning, and organizational strategy.',
    capabilities: ['strategy', 'analysis', 'planning'],
    temperature: 0.6,
    maxTokens: 4096,
  },
  {
    id: 'coder',
    name: 'Code Engineer',
    description: 'Software development and code review',
    model: 'claude-sonnet-4-20250514',
    icon: '⚡',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #2563eb)',
    systemPrompt: 'You are an expert software engineer. Write clean, efficient, well-documented code and provide detailed technical explanations.',
    capabilities: ['code', 'review', 'architecture'],
    temperature: 0.1,
    maxTokens: 8192,
  },
]

const useAgentStore = create(
  persist(
    (set, get) => ({
      agents: DEFAULT_AGENTS,
      activeAgentId: 'general',

      getActiveAgent: () => {
        const { agents, activeAgentId } = get()
        return agents.find((a) => a.id === activeAgentId) || agents[0]
      },

      setActiveAgent: (id) => set({ activeAgentId: id }),

      getAgent: (id) => get().agents.find((a) => a.id === id),

      addAgent: (agent) => {
        const id = `agent-${Date.now()}`
        set((state) => ({ agents: [...state.agents, { ...agent, id }] }))
        return id
      },

      updateAgent: (id, updates) => {
        set((state) => ({
          agents: state.agents.map((a) => a.id === id ? { ...a, ...updates } : a),
        }))
      },

      removeAgent: (id) => {
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
          activeAgentId: state.activeAgentId === id ? 'general' : state.activeAgentId,
        }))
      },
    }),
    { name: 'zyvex-agents' }
  )
)

export default useAgentStore

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function formatRelativeTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export function truncate(str, n = 40) {
  return str.length > n ? str.slice(0, n) + '…' : str
}

export function getFileIcon(type) {
  if (type?.startsWith('image/')) return '🖼️'
  if (type === 'application/pdf') return '📄'
  if (type?.includes('spreadsheet') || type?.includes('excel')) return '📊'
  if (type?.includes('word') || type?.includes('document')) return '📝'
  if (type?.includes('text/')) return '📃'
  return '📎'
}

export function sanitizeInput(str) {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
}

export function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

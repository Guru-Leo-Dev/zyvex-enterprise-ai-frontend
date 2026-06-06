import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { authService } from '@/services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: 'var(--gradient-brand)' }}>Z</div>
            <span className="text-2xl font-bold gradient-text" style={{ fontFamily: 'var(--font-display)' }}>Zyvex</span>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xl)' }}>
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <CheckCircle size={40} className="mx-auto mb-3" style={{ color: 'var(--accent-success)' }} />
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Check your inbox</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>We sent a reset link to <strong>{email}</strong></p>
              <Link to="/auth/login" className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>← Back to login</Link>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Link to="/auth/login" className="p-1 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]" style={{ color: 'var(--text-muted)' }}>
                  <ArrowLeft size={15} />
                </Link>
                <div>
                  <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Reset password</h1>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>We'll send you a reset link</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
                  </div>
                </div>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'var(--gradient-brand)', opacity: loading ? 0.7 : 1 }}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : 'Send Reset Link'}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

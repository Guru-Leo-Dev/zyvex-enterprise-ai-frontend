import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, hasRole } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="text-4xl mb-4">🔐</p>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Access Restricted</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>You need <strong>{requiredRole}</strong> role to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}

export function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

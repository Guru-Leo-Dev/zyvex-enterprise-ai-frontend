import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Something went wrong</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--gradient-brand)' }}>
              Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

import apiClient from './apiClient'

export const authService = {
  async login(email, password) {
    // Demo: return mock data
    await new Promise(r => setTimeout(r, 800))
    if (email && password) {
      return {
        user: { id: 'u1', name: email.split('@')[0], email, role: 'admin', avatar: null },
        token: 'demo-jwt-token',
        refreshToken: 'demo-refresh-token',
      }
    }
    throw { message: 'Invalid credentials' }
  },

  async signup(name, email, password) {
    await new Promise(r => setTimeout(r, 1000))
    return {
      user: { id: 'u2', name, email, role: 'user', avatar: null },
      token: 'demo-jwt-token',
      refreshToken: 'demo-refresh-token',
    }
  },

  async forgotPassword(email) {
    await new Promise(r => setTimeout(r, 600))
    return { message: 'Reset link sent to ' + email }
  },

  async logout() {
    try { await apiClient.post('/auth/logout') } catch {}
  },

  async refreshToken(refreshToken) {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken })
    return data
  },

  async getProfile() {
    const { data } = await apiClient.get('/auth/me')
    return data
  },
}

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.zyvex.ai/v1'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor - attach JWT
apiClient.interceptors.request.use(
  (config) => {
    try {
      const auth = JSON.parse(localStorage.getItem('zyvex-auth') || '{}')
      const token = auth?.state?.token
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {}
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors & refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const auth = JSON.parse(localStorage.getItem('zyvex-auth') || '{}')
        const refreshToken = auth?.state?.refreshToken
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const stored = JSON.parse(localStorage.getItem('zyvex-auth'))
        stored.state.token = data.token
        localStorage.setItem('zyvex-auth', JSON.stringify(stored))
        original.headers.Authorization = `Bearer ${data.token}`
        return apiClient(original)
      } catch {
        localStorage.removeItem('zyvex-auth')
        window.location.href = '/auth/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(normalizeError(error))
  }
)

function normalizeError(error) {
  if (error.response) {
    return {
      message: error.response.data?.message || error.response.data?.error || 'Request failed',
      status: error.response.status,
      code: error.response.data?.code,
      data: error.response.data,
    }
  }
  if (error.request) return { message: 'Network error. Please check your connection.', status: 0 }
  return { message: error.message || 'An unexpected error occurred', status: -1 }
}

export default apiClient

import type { AuthResponse } from '@/store/auth'
import config from '@/config'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

class AuthService {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string = config.API_BASE_URL) {
    this.baseUrl = baseUrl
    this.timeout = config.API_TIMEOUT
  }

  private async fetchWithTimeout(input: RequestInfo, init?: RequestInit) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    try {
      const options = Object.assign({}, init || {}, { signal: controller.signal })
      const res = await fetch(input, options)
      clearTimeout(timeoutId)
      return res
    } catch (err) {
      clearTimeout(timeoutId)
      throw err
    }
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const url = `${this.baseUrl}/auth/login`
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      return data
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed')
    }
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      const url = `${this.baseUrl}/auth/register`
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const data = await response.json()
      return data
    } catch (error) {
      throw error instanceof Error ? error : new Error('Registration failed')
    }
  }
}

export const authAPI = new AuthService()
export default AuthService

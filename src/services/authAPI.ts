import type { AuthResponse } from '@/store/auth'
import config from '@/config'
import { AppError } from '@/utils/errorHandler'

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
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  constructor(baseUrl: string = config.API_BASE_URL) {
    this.baseUrl = baseUrl
    this.timeout = config.API_TIMEOUT
  }

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback)
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token))
    this.refreshSubscribers = []
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

  async refreshToken(): Promise<string> {
    const url = `${this.baseUrl}/auth/refresh`
    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      throw new AppError('No refresh token available', {
        code: 'NO_REFRESH_TOKEN',
        endpoint: url,
      })
    }

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Refresh token is invalid or expired
        throw new AppError(data.error || 'Token refresh failed', {
          code: data.code || 'TOKEN_REFRESH_FAILED',
          statusCode: response.status,
          endpoint: url,
        })
      }

      // Update the access token
      const newAccessToken = data.data.accessToken
      localStorage.setItem('auth_token', newAccessToken)

      return newAccessToken
    } catch (error) {
      // Clear auth if refresh fails
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_user')

      if (error instanceof AppError) {
        throw error
      }

      throw new AppError(error instanceof Error ? error.message : 'Token refresh failed', {
        code: 'NETWORK_ERROR',
        endpoint: url,
      })
    }
  }

  async handleTokenRefresh(): Promise<string> {
    if (!this.isRefreshing) {
      this.isRefreshing = true
      try {
        const newToken = await this.refreshToken()
        this.isRefreshing = false
        this.onRefreshed(newToken)
        return newToken
      } catch (error) {
        this.isRefreshing = false
        throw error
      }
    }

    // Wait for the ongoing refresh to complete
    return new Promise((resolve) => {
      this.subscribeTokenRefresh((token: string) => {
        resolve(token)
      })
    })
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/login`

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new AppError(data.error || data.message || 'Login failed', {
          code: data.code || 'INVALID_CREDENTIALS',
          statusCode: response.status,
          endpoint: url,
          requestData: { email: request.email },
        })
      }

      return data
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      // Network or other errors
      throw new AppError(error instanceof Error ? error.message : 'Login failed', {
        code: 'NETWORK_ERROR',
        endpoint: url,
        requestData: { email: request.email },
      })
    }
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const url = `${this.baseUrl}/auth/register`

    try {
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new AppError(data.error || data.message || 'Registration failed', {
          code: data.code || 'REGISTRATION_FAILED',
          statusCode: response.status,
          endpoint: url,
          requestData: { email: request.email, name: request.name },
        })
      }

      return data
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      // Network or other errors
      throw new AppError(error instanceof Error ? error.message : 'Registration failed', {
        code: 'NETWORK_ERROR',
        endpoint: url,
        requestData: { email: request.email, name: request.name },
      })
    }
  }
}

export const authAPI = new AuthService()
export default AuthService

import { authAPI } from '@/services/authAPI'
import { useAuthStore } from '@/store/auth'
import { AppError } from './errorHandler'

interface RequestConfig extends RequestInit {
  _retry?: boolean
}

/**
 * Fetch wrapper that automatically handles token refresh on 401 errors
 */
export async function fetchWithAuth(input: RequestInfo, init?: RequestConfig): Promise<Response> {
  const token = localStorage.getItem('auth_token')

  // Add authorization header if token exists
  const headers = new Headers(init?.headers || {})
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const config: RequestConfig = {
    ...init,
    headers,
  }

  try {
    const response = await fetch(input, config)

    // If 401 and we haven't retried yet, try to refresh the token
    if (response.status === 401 && !config._retry) {
      try {
        // Attempt to refresh the token
        const newToken = await authAPI.handleTokenRefresh()

        // Update the authorization header with the new token
        headers.set('Authorization', `Bearer ${newToken}`)

        // Retry the original request with the new token
        const retryConfig: RequestConfig = {
          ...config,
          headers,
          _retry: true, // Mark as retry to prevent infinite loops
        }

        return await fetch(input, retryConfig)
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        const authStore = useAuthStore()
        authStore.clearAuth()

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        throw new AppError('Session expired. Please log in again.', {
          code: 'TOKEN_EXPIRED',
          statusCode: 401,
        })
      }
    }

    return response
  } catch (error) {
    // Network error or other fetch error
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(error instanceof Error ? error.message : 'Network error', {
      code: 'NETWORK_ERROR',
    })
  }
}

/**
 * Fetch wrapper with timeout and automatic token refresh
 */
export async function fetchWithAuthAndTimeout(
  input: RequestInfo,
  init?: RequestConfig,
  timeout: number = 30000,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const config: RequestConfig = {
      ...init,
      signal: controller.signal,
    }

    const response = await fetchWithAuth(input, config)
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)

    // Check if it was a timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError('Request timeout', {
        code: 'TIMEOUT',
      })
    }

    throw error
  }
}

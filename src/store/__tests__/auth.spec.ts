import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore, type AuthResponse } from '../auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should initialize with no token or user', () => {
      const store = useAuthStore()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.error).toBeNull()
      expect(store.onboardingCompleted).toBe(false)
    })

    it('should load persisted token and user from localStorage', () => {
      const mockAuth = {
        token: 'test-token-123',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      }

      localStorage.setItem('auth_token', mockAuth.token)
      localStorage.setItem('auth_user', JSON.stringify(mockAuth.user))

      const store = useAuthStore()

      expect(store.token).toBe(mockAuth.token)
      expect(store.user).toEqual(mockAuth.user)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should load onboarding completion state from localStorage', () => {
      localStorage.setItem('onboarding_completed', 'true')

      const store = useAuthStore()

      expect(store.onboardingCompleted).toBe(true)
    })
  })

  describe('setAuth', () => {
    it('should set token and user', () => {
      const store = useAuthStore()
      const authData: AuthResponse = {
        token: 'jwt-token',
        user: {
          id: 'user-1',
          email: 'user@test.com',
          name: 'John Doe',
        },
      }

      store.setAuth(authData)

      expect(store.token).toBe(authData.token)
      expect(store.user).toEqual(authData.user)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should persist auth data to localStorage', () => {
      const store = useAuthStore()
      const authData: AuthResponse = {
        token: 'jwt-token',
        user: {
          id: 'user-1',
          email: 'user@test.com',
        },
      }

      store.setAuth(authData)

      expect(localStorage.getItem('auth_token')).toBe('jwt-token')
      expect(JSON.parse(localStorage.getItem('auth_user') || '{}')).toEqual(authData.user)
    })

    it('should clear error when setting auth', () => {
      const store = useAuthStore()
      store.error = 'Previous error'

      store.setAuth({
        token: 'token',
        user: { id: '1', email: 'test@test.com' },
      })

      expect(store.error).toBeNull()
    })
  })

  describe('clearAuth', () => {
    it('should clear token and user', () => {
      const store = useAuthStore()
      store.setAuth({
        token: 'token',
        user: { id: '1', email: 'test@test.com' },
      })

      store.clearAuth()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should remove auth data from localStorage', () => {
      localStorage.setItem('auth_token', 'token')
      localStorage.setItem('auth_user', '{}')

      const store = useAuthStore()
      store.clearAuth()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should set error message', () => {
      const store = useAuthStore()
      const errorMsg = 'Login failed'

      store.setError(errorMsg)

      expect(store.error).toBe(errorMsg)
    })

    it('should clear error message', () => {
      const store = useAuthStore()
      store.setError('Error')

      store.clearError()

      expect(store.error).toBeNull()
    })
  })

  describe('Onboarding', () => {
    it('should mark onboarding as completed', () => {
      const store = useAuthStore()

      store.completeOnboarding()

      expect(store.onboardingCompleted).toBe(true)
      expect(localStorage.getItem('onboarding_completed')).toBe('true')
    })

    it('should reset onboarding', () => {
      const store = useAuthStore()
      localStorage.setItem('onboarding_completed', 'true')
      store.onboardingCompleted = true

      store.resetOnboarding()

      expect(store.onboardingCompleted).toBe(false)
      expect(localStorage.getItem('onboarding_completed')).toBeNull()
    })

    it('should persist onboarding completion state', () => {
      const store = useAuthStore()

      store.completeOnboarding()
      const savedState = localStorage.getItem('onboarding_completed')

      expect(savedState).toBe('true')
    })
  })

  describe('isAuthenticated computed', () => {
    it('should return true only when both token and user exist', () => {
      const store = useAuthStore()

      expect(store.isAuthenticated).toBe(false)

      store.token = 'token'
      expect(store.isAuthenticated).toBe(false)

      store.user = { id: '1', email: 'test@test.com' }
      expect(store.isAuthenticated).toBe(true)

      store.token = null
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null user gracefully', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: { id: '1', email: 'test@test.com' },
      })

      store.user = null

      expect(store.isAuthenticated).toBe(false)
    })

    it('should handle empty email in user', () => {
      const store = useAuthStore()

      store.setAuth({
        token: 'token',
        user: { id: '1', email: '' },
      })

      expect(store.isAuthenticated).toBe(true)
      expect(store.user?.email).toBe('')
    })

    it('should handle missing optional name field', () => {
      const store = useAuthStore()
      const authData: AuthResponse = {
        token: 'token',
        user: { id: '1', email: 'test@test.com' },
      }

      store.setAuth(authData)

      expect(store.user?.name).toBeUndefined()
    })

    it('should preserve onboarding state across multiple setAuth calls', () => {
      const store = useAuthStore()
      store.completeOnboarding()

      store.setAuth({
        token: 'new-token',
        user: { id: '2', email: 'new@test.com' },
      })

      expect(store.onboardingCompleted).toBe(true)
    })
  })

  describe('Multiple Store Instances', () => {
    it('should share state across instances', () => {
      const store1 = useAuthStore()
      const store2 = useAuthStore()

      store1.setAuth({
        token: 'token',
        user: { id: '1', email: 'test@test.com' },
      })

      expect(store2.token).toBe('token')
      expect(store2.isAuthenticated).toBe(true)
    })
  })
})

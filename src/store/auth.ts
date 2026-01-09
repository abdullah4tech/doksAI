import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  name?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Load token and user from localStorage if available
  const savedToken = localStorage.getItem('auth_token')
  const savedUser = localStorage.getItem('auth_user')
  const savedUserIdNeedingOnboarding = localStorage.getItem('user_needs_onboarding')

  const savedRefreshToken = localStorage.getItem('refresh_token')

  const token = ref<string | null>(savedToken || null)
  const refreshToken = ref<string | null>(savedRefreshToken || null)
  const user = ref<User | null>(savedUser ? JSON.parse(savedUser) : null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  // Track which user ID requires onboarding (set after registration)
  const userIdNeedingOnboarding = ref<string | null>(savedUserIdNeedingOnboarding || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  // Check if current user needs onboarding
  const needsOnboarding = computed(() => user.value?.id === userIdNeedingOnboarding.value)

  const setAuth = (authData: AuthResponse) => {
    token.value = authData.data.accessToken
    refreshToken.value = authData.data.refreshToken
    user.value = authData.data.user
    localStorage.setItem('auth_token', authData.data.accessToken)
    localStorage.setItem('refresh_token', authData.data.refreshToken)
    localStorage.setItem('auth_user', JSON.stringify(authData.data.user))
    error.value = null
  }

  const clearAuth = () => {
    token.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    clearOnboarding()
    error.value = null
  }

  const setError = (message: string) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const setOnboardingRequired = (userId: string) => {
    userIdNeedingOnboarding.value = userId
    localStorage.setItem('user_needs_onboarding', userId)
  }

  const completeOnboarding = () => {
    if (userIdNeedingOnboarding.value === user.value?.id) {
      userIdNeedingOnboarding.value = null
      localStorage.removeItem('user_needs_onboarding')
    }
  }

  const clearOnboarding = () => {
    userIdNeedingOnboarding.value = null
    localStorage.removeItem('user_needs_onboarding')
  }

  return {
    token,
    refreshToken,
    user,
    isLoading,
    error,
    userIdNeedingOnboarding,
    needsOnboarding,
    isAuthenticated,
    setAuth,
    clearAuth,
    setError,
    clearError,
    setOnboardingRequired,
    completeOnboarding,
    clearOnboarding,
  }
})

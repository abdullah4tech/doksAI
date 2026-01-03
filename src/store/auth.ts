import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  // Load token and user from localStorage if available
  const savedToken = localStorage.getItem('auth_token')
  const savedUser = localStorage.getItem('auth_user')

  const token = ref<string | null>(savedToken || null)
  const user = ref<User | null>(savedUser ? JSON.parse(savedUser) : null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const setAuth = (authData: AuthResponse) => {
    token.value = authData.token
    user.value = authData.user
    localStorage.setItem('auth_token', authData.token)
    localStorage.setItem('auth_user', JSON.stringify(authData.user))
    error.value = null
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    error.value = null
  }

  const setError = (message: string) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    setAuth,
    clearAuth,
    setError,
    clearError,
  }
})

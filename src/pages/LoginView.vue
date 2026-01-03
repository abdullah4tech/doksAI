<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { authAPI } from '@/services/authAPI'
import { useMotion } from '@vueuse/motion'
import gsap from 'gsap'
import LogoText from '@/components/LogoText.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

const containerRef = ref()
const formRef = ref()
const logoRef = ref()

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  error.value = null

  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true

  try {
    const response = await authAPI.login({
      email: email.value,
      password: password.value,
    })

    authStore.setAuth(response)

    // Redirect to previous page or home
    const redirectTo = (route.query.redirect as string) || '/c'
    router.push(redirectTo)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
    authStore.setError(error.value)
  } finally {
    isLoading.value = false
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !isLoading.value) {
    handleLogin()
  }
}

onMounted(() => {
  // Animate logo
  if (logoRef.value) {
    gsap.fromTo(
      logoRef.value,
      {
        y: -30,
        opacity: 0,
        scale: 0.9,
      },
      {
        duration: 0.8,
        y: 0,
        opacity: 1,
        scale: 1,
        ease: 'elastic.out(1, 0.6)',
        delay: 0.1,
      },
    )
  }

  // Animate form with Motion
  if (formRef.value) {
    useMotion(formRef.value, {
      initial: {
        opacity: 0,
        y: 20,
        scale: 0.95,
      },
      enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 600,
          delay: 300,
          type: 'spring',
          stiffness: 100,
          damping: 15,
        },
      },
    })
  }
})
</script>

<template>
  <div
    class="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50"
  >
    <!-- Grid background pattern -->
    <div
      class="absolute inset-0 opacity-5 pointer-events-none"
      style="
        background-image: linear-gradient(
          90deg,
          #e5e7eb 1px,
          transparent 1px
        ),
        linear-gradient(#e5e7eb 1px, transparent 1px);
        background-size: 50px 50px;
      "
    ></div>

    <!-- Main content container -->
    <div class="w-full max-w-md mx-auto z-10">
      <!-- Logo -->
      <div ref="logoRef" class="relative mb-8 text-center">
        <LogoText class="text-4xl sm:text-5xl mb-4" />
        <p class="text-sm text-gray-500">Document AI Assistant</p>
      </div>

      <!-- Form card -->
      <div
        ref="formRef"
        class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8"
      >
        <!-- Heading -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p class="text-sm text-gray-600">Sign in to your account to continue</p>
        </div>

        <!-- Error message -->
        <div
          v-if="error"
          class="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              :disabled="isLoading"
              @keydown="handleKeyDown"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <!-- Password input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                :disabled="isLoading"
                @keydown="handleKeyDown"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                :disabled="isLoading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
              >
                <EyeIcon v-if="showPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full mt-6 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium rounded-lg hover:from-sky-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span v-if="!isLoading">Sign in</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-sm text-gray-600">
          Don't have an account?
          <router-link
            to="/register"
            class="font-medium text-sky-600 hover:text-sky-700 transition-colors"
          >
            Create one
          </router-link>
        </p>
      </div>

      <!-- Additional info -->
      <p class="text-center text-xs text-gray-500 mt-6 px-4">
        Protected by JWT authentication. Your data is secure.
      </p>
    </div>
  </div>
</template>

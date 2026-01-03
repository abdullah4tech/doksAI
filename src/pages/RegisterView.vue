<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { authAPI } from '@/services/authAPI'
import { useMotion } from '@vueuse/motion'
import gsap from 'gsap'
import LogoText from '@/components/LogoText.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeToTerms = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

const containerRef = ref()
const formRef = ref()
const logoRef = ref()

const passwordsMatch = computed(() => password.value === confirmPassword.value)
const passwordStrength = computed(() => {
  const pwd = password.value
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 8) strength++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
  if (/\d/.test(pwd)) strength++
  if (/[^a-zA-Z\d]/.test(pwd)) strength++
  return strength
})

const strengthText = computed(() => {
  const levels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  return levels[passwordStrength.value] || 'Very Weak'
})

const strengthColor = computed(() => {
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500']
  return colors[passwordStrength.value] || 'bg-red-500'
})

const isFormValid = computed(
  () =>
    name.value.trim() &&
    email.value.trim() &&
    password.value &&
    confirmPassword.value &&
    passwordsMatch.value &&
    passwordStrength.value >= 2 &&
    agreeToTerms.value,
)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleRegister = async () => {
  error.value = null

  if (!isFormValid.value) {
    error.value = 'Please complete all fields correctly'
    return
  }

  isLoading.value = true

  try {
    const response = await authAPI.register({
      email: email.value,
      password: password.value,
      name: name.value,
    })

    authStore.setAuth(response)
    router.push('/c')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed'
    authStore.setError(error.value)
  } finally {
    isLoading.value = false
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !isLoading.value && isFormValid.value) {
    handleRegister()
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
    class="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50 py-8 sm:py-12"
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
        <p class="text-sm text-gray-500">Create your account</p>
      </div>

      <!-- Form card -->
      <div
        ref="formRef"
        class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8"
      >
        <!-- Heading -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Get started</h1>
          <p class="text-sm text-gray-600">Join us to analyze your documents</p>
        </div>

        <!-- Error message -->
        <div
          v-if="error"
          class="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Name input -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Full name
            </label>
            <input
              id="name"
              v-model="name"
              type="text"
              placeholder="John Doe"
              :disabled="isLoading"
              @keydown="handleKeyDown"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

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

            <!-- Password strength indicator -->
            <div v-if="password" class="mt-2">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-600">Strength:</span>
                <span class="text-xs font-medium text-gray-700">{{ strengthText }}</span>
              </div>
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  :class="[strengthColor, 'h-full transition-all duration-300']"
                  :style="{ width: `${(passwordStrength / 4) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Confirm password input -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••"
                :disabled="isLoading"
                @keydown="handleKeyDown"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                :class="{
                  'border-red-300': confirmPassword && !passwordsMatch,
                }"
              />
              <button
                type="button"
                @click="toggleConfirmPasswordVisibility"
                :disabled="isLoading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
              >
                <EyeIcon v-if="showConfirmPassword" class="w-5 h-5" />
                <EyeSlashIcon v-else class="w-5 h-5" />
              </button>
            </div>
            <p
              v-if="confirmPassword && !passwordsMatch"
              class="mt-1 text-xs text-red-600"
            >
              Passwords do not match
            </p>
          </div>

          <!-- Terms checkbox -->
          <div class="flex items-start gap-2">
            <input
              id="terms"
              v-model="agreeToTerms"
              type="checkbox"
              :disabled="isLoading"
              class="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-2 focus:ring-sky-500 cursor-pointer disabled:cursor-not-allowed"
            />
            <label for="terms" class="text-xs text-gray-600">
              I agree to the
              <a href="#" class="text-sky-600 hover:text-sky-700 transition-colors">
                Terms of Service
              </a>
              and
              <a href="#" class="text-sky-600 hover:text-sky-700 transition-colors">
                Privacy Policy
              </a>
            </label>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="w-full mt-6 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium rounded-lg hover:from-sky-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span v-if="!isLoading">Create account</span>
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
              Creating account...
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
          Already have an account?
          <router-link
            to="/login"
            class="font-medium text-sky-600 hover:text-sky-700 transition-colors"
          >
            Sign in
          </router-link>
        </p>
      </div>

      <!-- Additional info -->
      <p class="text-center text-xs text-gray-500 mt-6 px-4">
        We'll never share your data. Your privacy is our priority.
      </p>
    </div>
  </div>
</template>

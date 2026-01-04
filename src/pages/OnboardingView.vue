<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useMotion } from '@vueuse/motion'
import gsap from 'gsap'
import LogoText from '@/components/LogoText.vue'
import {
  CheckCircleIcon,
  DocumentPlusIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(0)
const skippedSteps = ref<Set<number>>(new Set())
const containerRef = ref()
const contentRef = ref()

const steps = [
  {
    id: 0,
    title: 'Welcome to Doks AI',
    description: 'Your intelligent document analysis assistant',
    icon: SparklesIcon,
    content:
      'Transform your documents into actionable insights. Upload PDFs, ask questions, and get instant answers powered by AI.',
  },
  {
    id: 1,
    title: 'Upload Documents',
    description: 'Start by adding your first document',
    icon: DocumentPlusIcon,
    content:
      'Drag and drop or click to upload PDF files. Our system will process and index your documents for intelligent querying.',
  },
  {
    id: 2,
    title: 'Ask Questions',
    description: 'Get instant answers from your documents',
    icon: ChatBubbleLeftRightIcon,
    content:
      'Type your questions in natural language. Our AI will search through your documents and provide accurate, cited answers.',
  },
  {
    id: 3,
    title: 'You\'re All Set!',
    description: 'Ready to start using Doks AI',
    icon: CheckCircleIcon,
    content:
      'You\'re now ready to explore your documents. Head to your first chat to begin asking questions.',
  },
]

const totalSteps = steps.length
const progress = computed(() => ((currentStep.value + 1) / totalSteps) * 100)
const isLastStep = computed(() => currentStep.value === totalSteps - 1)
const canGoBack = computed(() => currentStep.value > 0)

const nextStep = () => {
  if (currentStep.value < totalSteps - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const skipStep = () => {
  skippedSteps.value.add(currentStep.value)
  nextStep()
}

const skipOnboarding = () => {
  authStore.completeOnboarding()
  router.push('/')
}

const completeOnboarding = () => {
  authStore.completeOnboarding()
  router.push('/')
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight' && currentStep.value < totalSteps - 1) {
    nextStep()
  } else if (e.key === 'ArrowLeft' && currentStep.value > 0) {
    prevStep()
  } else if (e.key === 'Escape') {
    skipOnboarding()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)

  // Animate container
  if (containerRef.value) {
    gsap.fromTo(
      containerRef.value,
      { opacity: 0 },
      {
        duration: 0.6,
        opacity: 1,
        ease: 'power2.out',
      },
    )
  }

  // Animate content
  if (contentRef.value) {
    useMotion(contentRef.value, {
      initial: {
        opacity: 0,
        y: 20,
      },
      enter: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 600,
          delay: 200,
        },
      },
    })
  }
})

const currentStepData = computed(() => steps[currentStep.value])
const CurrentIcon = computed(() => currentStepData.value?.icon)
</script>

<template>
  <div
    ref="containerRef"
    class="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-white via-gray-50 to-blue-50"
    role="main"
    aria-label="Onboarding"
  >
    <!-- Grid background -->
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
      aria-hidden="true"
    ></div>

    <!-- Main container -->
    <div class="w-full max-w-2xl mx-auto z-10 pt-6">
      <!-- Progress bar -->
      <div class="mb-12">
        <div class="flex justify-between items-center mb-4">
          <span class="text-sm font-medium text-gray-700">
            Step {{ currentStep + 1 }} of {{ totalSteps }}
          </span>
          <button
            @click="skipOnboarding"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Skip onboarding"
            title="Press ESC to skip"
          >
            Skip
          </button>
        </div>
        <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500"
            :style="{ width: `${progress}%` }"
            role="progressbar"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      <!-- Content card -->
      <div
        ref="contentRef"
        class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12"
      >
        <!-- Icon -->
        <div class="flex justify-center mb-6">
          <div class="p-4 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full">
            <component
              :is="CurrentIcon"
              class="w-12 h-12 text-sky-600"
              aria-hidden="true"
            />
          </div>
        </div>

        <!-- Title and description -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {{ currentStepData?.title }}
          </h1>
          <p class="text-lg text-gray-600">
            {{ currentStepData?.description }}
          </p>
        </div>

        <!-- Content -->
        <div class="bg-gray-50 rounded-lg p-6 mb-8">
          <p class="text-gray-700 leading-relaxed">
            {{ currentStepData?.content }}
          </p>
        </div>

        <!-- Step indicators (dots) -->
        <div class="flex justify-center gap-2 mb-8" role="tablist" aria-label="Onboarding steps">
          <button
            v-for="(step, index) in steps"
            :key="step.id"
            @click="currentStep = index"
            :aria-selected="currentStep === index"
            :aria-label="`Go to step ${index + 1}: ${step.title}`"
            class="w-3 h-3 rounded-full transition-all duration-300"
            :class="[
              currentStep === index
                ? 'bg-sky-600 w-8'
                : 'bg-gray-300 hover:bg-gray-400',
            ]"
          ></button>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <!-- Back button -->
          <button
            v-if="canGoBack"
            @click="prevStep"
            :disabled="currentStep === 0"
            class="w-full sm:w-auto px-6 py-3 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Go to previous step"
          >
            Back
          </button>
          <div v-else class="hidden sm:block"></div>

          <!-- Skip button (center, mobile friendly) -->
          <button
            v-if="!isLastStep"
            @click="skipStep"
            class="w-full sm:w-auto px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
            :aria-label="`Skip step ${currentStep + 1}`"
          >
            Skip this step
          </button>
          <div v-else class="hidden sm:block"></div>

          <!-- Next / Complete button -->
          <button
            v-if="!isLastStep"
            @click="nextStep"
            class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
            aria-label="Go to next step"
          >
            Next
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button
            v-else
            @click="completeOnboarding"
            class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
            aria-label="Complete onboarding and start using DoksAI"
          >
            Get Started
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <!-- Keyboard hints -->
        <p class="text-xs text-gray-500 text-center mt-6">
          💡 Tip: Use arrow keys to navigate (← →) or press ESC to skip
        </p>
      </div>

      <!-- DoksAI branding -->
      <div class="text-center mt-8">
        <p class="text-sm text-gray-600">
          Powered by
          <span class="font-semibold text-gray-900">Doks</span>
          <span class="text-sky-600 font-semibold">AI</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions for step changes */
:deep([role='main']) {
  transition: all 0.3s ease-in-out;
}

/* Accessibility: Focus visible for keyboard navigation */
button:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}
</style>

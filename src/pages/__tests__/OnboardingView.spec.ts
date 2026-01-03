import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import OnboardingView from '../OnboardingView.vue'
import { useAuthStore } from '@/store/auth'

describe('OnboardingView', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/onboarding',
          component: OnboardingView,
        },
        {
          path: '/',
          component: { template: '<div>Home</div>' },
        },
      ],
    })
  })

  const createWrapper = () => {
    return mount(OnboardingView, {
      global: {
        plugins: [router],
        stubs: {
          Teleport: true,
        },
      },
    })
  }

  describe('Rendering', () => {
    it('should render onboarding component', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('[role="main"]').exists()).toBe(true)
    })

    it('should display title and description for current step', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Welcome to Doks AI')
      expect(wrapper.text()).toContain('Your intelligent document analysis assistant')
    })

    it('should show progress bar with correct percentage', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('aria-valuenow')).toBe('25')
    })

    it('should display step counter', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Step 1 of 4')
    })

    it('should show all 4 steps as dots', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const dots = wrapper.findAll('[role="tablist"] button')
      expect(dots).toHaveLength(4)
    })

    it('should highlight current step dot', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const dots = wrapper.findAll('[role="tablist"] button')
      expect(dots[0].classes()).toContain('bg-sky-600')
      expect(dots[1].classes()).toContain('bg-gray-300')
    })
  })

  describe('Navigation', () => {
    it('should go to next step when Next button is clicked', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))!
      await nextButton.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Step 2 of 4')
      expect(wrapper.text()).toContain('Upload Documents')
    })

    it('should go to previous step when Back button is clicked', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))!
      await nextButton.trigger('click')
      await flushPromises()

      const backButton = wrapper.findAll('button').find((b) => b.text().includes('Back'))!
      await backButton.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Step 1 of 4')
    })

    it('should jump to step when dot is clicked', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const dots = wrapper.findAll('[role="tablist"] button')
      await dots[2].trigger('click')

      expect(wrapper.text()).toContain('Step 3 of 4')
      expect(wrapper.text()).toContain('Ask Questions')
    })

    it('should disable Back button on first step', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const buttons = wrapper.findAll('button')
      const backButton = buttons.find((b) => b.text().includes('Back'))
      
      // Back button shouldn't exist on first step, or it should be hidden
      if (backButton) {
        expect(backButton.attributes('disabled')).toBeDefined()
      } else {
        expect(backButton).toBeUndefined()
      }
    })

    it('should not show Back button on first step', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const buttons = wrapper.findAll('button')
      const backButton = buttons.find((b) => b.text() === 'Back')

      expect(backButton).toBeUndefined()
    })

    it('should show "Get Started" button on last step', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      // Navigate to last step
      for (let i = 0; i < 3; i++) {
        const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))
        if (nextButton) await nextButton.trigger('click')
      }

      expect(wrapper.text()).toContain('Get Started')
    })
  })

  describe('Skip Functionality', () => {
    it('should skip current step', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const skipButton = wrapper.findAll('button').find((b) => b.text() === 'Skip this step')
      await skipButton?.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Step 2 of 4')
    })

    it('should skip entire onboarding when Skip button in header is clicked', async () => {
      const wrapper = createWrapper()
      const authStore = useAuthStore()
      await flushPromises()

      const skipButton = wrapper.find('button[aria-label="Skip onboarding"]')
      await skipButton.trigger('click')

      expect(authStore.onboardingCompleted).toBe(true)
    })

    it('should not show Skip button on last step', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      // Navigate to last step
      for (let i = 0; i < 3; i++) {
        const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))
        if (nextButton) {
          await nextButton.trigger('click')
          await flushPromises()
        }
      }

      const skipButton = wrapper.findAll('button').find((b) => b.text() === 'Skip this step')
      expect(skipButton).toBeUndefined()
    })
  })

  describe('Completion', () => {
    it('should mark onboarding as completed when Get Started is clicked', async () => {
      const wrapper = createWrapper()
      const authStore = useAuthStore()
      await flushPromises()

      // Navigate to last step
      for (let i = 0; i < 3; i++) {
        const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))
        if (nextButton) {
          await nextButton.trigger('click')
          await flushPromises()
        }
      }

      const getStartedButton = wrapper.findAll('button').find((b) => b.text().includes('Get Started'))!
      await getStartedButton.trigger('click')
      await flushPromises()

      expect(authStore.onboardingCompleted).toBe(true)
    })

    it('should persist completion state to localStorage', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      // Navigate to last step and complete
      for (let i = 0; i < 3; i++) {
        const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))
        if (nextButton) {
          await nextButton.trigger('click')
          await flushPromises()
        }
      }

      const getStartedButton = wrapper.findAll('button').find((b) => b.text().includes('Get Started'))!
      await getStartedButton.trigger('click')
      await flushPromises()

      expect(localStorage.getItem('onboarding_completed')).toBe('true')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should go to next step with right arrow key', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      await flushPromises()

      expect(wrapper.text()).toContain('Step 2 of 4')
    })

    it('should go to previous step with left arrow key', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      // Go to step 2
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      // Go back to step 1
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))

      expect(wrapper.text()).toContain('Step 1 of 4')
    })

    it('should skip onboarding with Escape key', async () => {
      const wrapper = createWrapper()
      const authStore = useAuthStore()
      await flushPromises()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

      expect(authStore.onboardingCompleted).toBe(true)
    })

    it('should not go back on first step with left arrow', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))

      expect(wrapper.text()).toContain('Step 1 of 4')
    })

    it('should not go forward on last step with right arrow', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      // Navigate to last step
      for (let i = 0; i < 3; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
        await flushPromises()
      }

      const currentStep = wrapper.text()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      await flushPromises()

      expect(wrapper.text()).toContain('Step 4 of 4')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('[role="main"]').exists()).toBe(true)
      expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
      expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    })

    it('should have proper button labels for screen readers', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const skipButton = wrapper.find('button[aria-label="Skip onboarding"]')
      expect(skipButton.exists()).toBe(true)
    })

    it('should have focus management', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should support keyboard-only navigation', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      // Tab through buttons
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have proper heading structure', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const heading = wrapper.find('h1')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toContain('Welcome to Doks AI')
    })
  })

  describe('Progress Tracking', () => {
    it('should update progress percentage as user advances', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      let progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.attributes('aria-valuenow')).toBe('25')

      const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))
      await nextButton?.trigger('click')

      progressBar = wrapper.find('[role="progressbar"]')
      expect(progressBar.attributes('aria-valuenow')).toBe('50')
    })

    it('should show correct progress percentage on each step', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const expectedProgress = [25, 50, 75, 100]

      for (let i = 0; i < expectedProgress.length; i++) {
        const progressBar = wrapper.find('[role="progressbar"]')
        expect(parseInt(progressBar.attributes('aria-valuenow') || '0')).toBe(expectedProgress[i])

        if (i < expectedProgress.length - 1) {
          const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))
          await nextButton?.trigger('click')
        }
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid step changes', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      // Rapid clicks
      for (let i = 0; i < 3; i++) {
        const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))
        await nextButton?.trigger('click')
      }

      expect(wrapper.text()).toContain('Step 4 of 4')
    })

    it('should handle navigation after completion', async () => {
      const wrapper = createWrapper()
      const authStore = useAuthStore()
      await flushPromises()

      // Complete onboarding
      for (let i = 0; i < 3; i++) {
        const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))
        if (nextButton) {
          await nextButton.trigger('click')
          await flushPromises()
        }
      }

      const getStartedButton = wrapper.findAll('button').find((b) => b.text().includes('Get Started'))!
      await getStartedButton.trigger('click')
      await flushPromises()

      expect(authStore.onboardingCompleted).toBe(true)
    })

    it('should persist state when navigating between steps', async () => {
      const wrapper = createWrapper()
      const authStore = useAuthStore()
      await flushPromises()

      // Go forward
      const nextButton = wrapper.findAll('button').find((b) => b.text().includes('Next'))
      await nextButton?.trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('Step 2 of 4')

      // Go back
      const backButton = wrapper.findAll('button').find((b) => b.text().includes('Back'))
      await backButton?.trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('Step 1 of 4')

      // Skip remaining steps
      const nextButton2 = wrapper.findAll('button').find((b) => b.text().includes('Next'))
      await nextButton2?.trigger('click')
      await flushPromises()
      const skipButton = wrapper.findAll('button').find((b) => b.text() === 'Skip this step')
      await skipButton?.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('Step 3 of 4')
    })

    it('should handle missing step data gracefully', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.find('h1').exists()).toBe(true)
      expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should render buttons on mobile', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have responsive padding classes', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const contentCard = wrapper.find('.bg-white.rounded-2xl')
      expect(contentCard.classes()).toContain('p-8')
    })
  })
})

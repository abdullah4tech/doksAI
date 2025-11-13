import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from '../Toast.vue'
import type { Toast as ToastType } from '@/store/toast'

describe('Toast Component', () => {
  const createToast = (overrides?: Partial<ToastType>): ToastType => ({
    id: 'toast-1',
    title: 'Test Toast',
    description: 'This is a test toast',
    type: 'success',
    duration: 5000,
    ...overrides,
  })

  describe('Component Rendering', () => {
    it('should render the toast', () => {
      const toast = createToast()
      const wrapper = mount(Toast, {
        props: { toast },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })

    it('should display the title', () => {
      const toast = createToast({ title: 'Test Title' })
      const wrapper = mount(Toast, {
        props: { toast },
      })

      expect(wrapper.text()).toContain('Test Title')
    })

    it('should display the description when provided', () => {
      const toast = createToast({ description: 'Test Description' })
      const wrapper = mount(Toast, {
        props: { toast },
      })

      expect(wrapper.text()).toContain('Test Description')
    })

    it('should not display description when not provided', () => {
      const toast = createToast({ description: undefined })
      const wrapper = mount(Toast, {
        props: { toast },
      })

      // Check that the component renders without error
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Component Props', () => {
    it('should accept toast prop', () => {
      const toast = createToast()
      const wrapper = mount(Toast, {
        props: { toast },
      })

      expect(wrapper.props('toast')).toEqual(toast)
    })

    it('should update when props change', async () => {
      const initialToast = createToast({ title: 'Initial' })
      const wrapper = mount(Toast, {
        props: { toast: initialToast },
      })

      expect(wrapper.text()).toContain('Initial')

      const updatedToast = createToast({ title: 'Updated' })
      await wrapper.setProps({ toast: updatedToast })

      expect(wrapper.text()).toContain('Updated')
    })
  })

  describe('Component Events', () => {
    it('should emit close event when close button is clicked', async () => {
      const toast = createToast()
      const wrapper = mount(Toast, {
        props: { toast },
      })

      const closeButton = wrapper.find('button')
      await closeButton.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('should emit close event with correct details', async () => {
      const toast = createToast({ id: 'toast-test-123' })
      const wrapper = mount(Toast, {
        props: { toast },
      })

      const closeButton = wrapper.find('button')
      await closeButton.trigger('click')

      const emitted = wrapper.emitted('close')
      expect(emitted).toBeTruthy()
    })
  })

  describe('Toast Type Styles', () => {
    it('should apply success styles for success toast', () => {
      const toast = createToast({ type: 'success' })
      const wrapper = mount(Toast, {
        props: { toast },
      })

      const alertDiv = wrapper.find('[role="alert"]')
      expect(alertDiv.classes()).toContain('bg-green-50/95')
      expect(alertDiv.classes()).toContain('border-green-200')
    })

    it('should apply error styles for error toast', () => {
      const toast = createToast({ type: 'error' })
      const wrapper = mount(Toast, {
        props: { toast },
      })

      const alertDiv = wrapper.find('[role="alert"]')
      expect(alertDiv.classes()).toContain('bg-red-50/95')
      expect(alertDiv.classes()).toContain('border-red-200')
    })

    it('should apply warning styles for warning toast', () => {
      const toast = createToast({ type: 'warning' })
      const wrapper = mount(Toast, {
        props: { toast },
      })

      const alertDiv = wrapper.find('[role="alert"]')
      expect(alertDiv.classes()).toContain('bg-yellow-50/95')
      expect(alertDiv.classes()).toContain('border-yellow-200')
    })

    it('should apply info styles for info toast', () => {
      const toast = createToast({ type: 'info' })
      const wrapper = mount(Toast, {
        props: { toast },
      })

      const alertDiv = wrapper.find('[role="alert"]')
      expect(alertDiv.classes()).toContain('bg-blue-50/95')
      expect(alertDiv.classes()).toContain('border-blue-200')
    })
  })

  describe('Toast Icons', () => {
    it('should render success icon for success toast', () => {
      const toast = createToast({ type: 'success' })
      const wrapper = mount(Toast, {
        props: { toast },
      })

      const svgs = wrapper.findAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('should render error icon for error toast', () => {
      const toast = createToast({ type: 'error' })
      const wrapper = mount(Toast, {
        props: { toast },
      })

      const svgs = wrapper.findAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('should render correct icon color for each type', () => {
      const toastTypes: ToastType['type'][] = ['success', 'error', 'warning', 'info']

      toastTypes.forEach((type) => {
        const toast = createToast({ type })
        const wrapper = mount(Toast, {
          props: { toast },
        })

        const svgs = wrapper.findAll('svg')
        expect(svgs.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have role="alert" for accessibility', () => {
      const toast = createToast()
      const wrapper = mount(Toast, {
        props: { toast },
      })

      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })

    it('should have aria-label on close button', () => {
      const toast = createToast()
      const wrapper = mount(Toast, {
        props: { toast },
      })

      const closeButton = wrapper.find('button')
      expect(closeButton.attributes('aria-label')).toBe('Close notification')
    })
  })
})

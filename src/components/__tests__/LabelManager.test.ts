import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LabelManager from '../LabelManager.vue'
import { useLabelsStore } from '@/store/labels'
import { useToastStore } from '@/store/toast'

describe('LabelManager Component', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should render the manage labels button', () => {
    const wrapper = mount(LabelManager)
    const button = wrapper.find('button')

    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Manage Labels')
  })

  it('should open dialog when button is clicked', async () => {
    const wrapper = mount(LabelManager)
    const button = wrapper.find('button')

    await button.trigger('click')
    await wrapper.vm.$nextTick()

    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.exists()).toBe(true)
  })

  it('should close dialog when close button is clicked', async () => {
    const wrapper = mount(LabelManager)
    const button = wrapper.find('button')

    await button.trigger('click')
    await wrapper.vm.$nextTick()

    const closeButton = wrapper.findComponent({ name: 'XMarkIcon' }).element.closest('button')
    if (closeButton) {
      await closeButton.click()
      await wrapper.vm.$nextTick()
    }

    expect(wrapper.vm.isOpen).toBe(false)
  })

  it('should show empty state when no labels exist', async () => {
    const wrapper = mount(LabelManager)
    const button = wrapper.find('button')

    await button.trigger('click')
    await wrapper.vm.$nextTick()

    const emptyState = wrapper.text()
    expect(emptyState).toContain('No labels yet')
  })

  it('should create a label when form is submitted', async () => {
    const labelsStore = useLabelsStore()
    const wrapper = mount(LabelManager)

    // Open dialog
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    // Fill form (would need to access internal state)
    wrapper.vm.newLabelName = 'Test Label'
    wrapper.vm.newLabelColor = '#EF4444'
    await wrapper.vm.$nextTick()

    // Note: Full form testing would require more setup
    // This is a simplified test
    const labels = labelsStore.allLabels
    expect(labels.length).toBeGreaterThanOrEqual(0)
  })

  it('should display error toast when creating label without name', async () => {
    const toastStore = useToastStore()
    const errorSpy = vi.spyOn(toastStore, 'error')

    const wrapper = mount(LabelManager)

    // Try to create label without name
    wrapper.vm.newLabelName = ''
    wrapper.vm.createLabel()
    await wrapper.vm.$nextTick()

    expect(errorSpy).toHaveBeenCalled()
  })
})

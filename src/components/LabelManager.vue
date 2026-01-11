<script setup lang="ts">
import { ref } from 'vue'
import { useLabelsStore, DEFAULT_COLORS } from '@/store/labels'
import ColorPicker from './ColorPicker.vue'
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useToastStore } from '@/store/toast'

const labelsStore = useLabelsStore()
const toastStore = useToastStore()

const isOpen = ref(false)
const isCreatingNew = ref(false)
const editingLabelId = ref<string | null>(null)

const newLabelName = ref('')
const newLabelColor = ref(DEFAULT_COLORS[4]) // Default to blue

const editLabelName = ref('')
const editLabelColor = ref('')

const openDialog = (): void => {
  isOpen.value = true
  isCreatingNew.value = true
  newLabelName.value = ''
  newLabelColor.value = DEFAULT_COLORS[4]
}

const closeDialog = (): void => {
  isOpen.value = false
  isCreatingNew.value = false
  editingLabelId.value = null
  newLabelName.value = ''
  editLabelName.value = ''
  editLabelColor.value = ''
}

const startEdit = (labelId: string): void => {
  const label = labelsStore.getLabelById(labelId)
  if (label) {
    editingLabelId.value = labelId
    isCreatingNew.value = false
    editLabelName.value = label.name
    editLabelColor.value = label.color
    isOpen.value = true
  }
}

const createLabel = (): void => {
  if (!newLabelName.value.trim()) {
    toastStore.error('Error', 'Please enter a label name')
    return
  }

  try {
    labelsStore.createLabel(newLabelName.value, newLabelColor.value)
    toastStore.success('Success', 'Label created successfully')
    closeDialog()
  } catch (error) {
    toastStore.error('Error', error instanceof Error ? error.message : 'Failed to create label')
  }
}

const updateLabel = (): void => {
  if (!editingLabelId.value) return
  if (!editLabelName.value.trim()) {
    toastStore.error('Error', 'Please enter a label name')
    return
  }

  try {
    labelsStore.updateLabel(editingLabelId.value, editLabelName.value, editLabelColor.value)
    toastStore.success('Success', 'Label updated successfully')
    closeDialog()
  } catch (error) {
    toastStore.error('Error', error instanceof Error ? error.message : 'Failed to update label')
  }
}

const deleteLabel = (labelId: string): void => {
  if (
    confirm(
      'Are you sure you want to delete this label? It will be removed from all conversations.',
    )
  ) {
    try {
      labelsStore.deleteLabel(labelId)
      toastStore.success('Success', 'Label deleted successfully')
    } catch (error) {
      toastStore.error('Error', error instanceof Error ? error.message : 'Failed to delete label')
    }
  }
}
</script>

<template>
  <div>
    <!-- Open Button -->
    <button
      @click="openDialog"
      class="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors"
    >
      <PlusIcon class="w-4 h-4" />
      <span>Manage Labels</span>
    </button>

    <!-- Dialog Overlay -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <!-- Dialog Content -->
        <div class="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div
            class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white"
          >
            <h2 class="text-lg font-semibold text-gray-900">
              {{ isCreatingNew ? 'Create Label' : editingLabelId ? 'Edit Label' : 'Manage Labels' }}
            </h2>
            <button @click="closeDialog" class="p-1 hover:bg-gray-100 rounded transition-colors">
              <XMarkIcon class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Create/Edit Form -->
            <div v-if="isCreatingNew || editingLabelId" class="space-y-4 mb-6">
              <!-- Name Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Label Name</label>
                <input
                  v-model="isCreatingNew ? newLabelName : editLabelName"
                  type="text"
                  maxlength="20"
                  placeholder="e.g., Important, Reference"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p class="text-xs text-gray-500 mt-1">
                  {{ (isCreatingNew ? newLabelName : editLabelName).length }}/20
                </p>
              </div>

              <!-- Color Picker -->
              <ColorPicker v-model="isCreatingNew ? newLabelColor : editLabelColor" />

              <!-- Action Buttons -->
              <div class="flex gap-3 justify-end pt-4">
                <button
                  @click="closeDialog"
                  class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="isCreatingNew ? createLabel() : updateLabel()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {{ isCreatingNew ? 'Create' : 'Update' }}
                </button>
              </div>
            </div>

            <!-- Labels List -->
            <div v-if="!isCreatingNew && !editingLabelId">
              <div v-if="labelsStore.allLabels.length === 0" class="text-center py-8">
                <p class="text-gray-500">No labels yet. Create one to get started.</p>
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="label in labelsStore.allLabels"
                  :key="label.id"
                  class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group transition-colors"
                >
                  <!-- Color Badge -->
                  <div
                    class="w-4 h-4 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: label.color }"
                  />

                  <!-- Label Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ label.name }}</p>
                    <p class="text-xs text-gray-500">{{ label.color }}</p>
                  </div>

                  <!-- Actions -->
                  <div
                    class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      @click="startEdit(label.id)"
                      class="p-1.5 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteLabel(label.id)"
                      class="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Create New Button -->
              <button
                @click="openDialog"
                class="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:text-blue-600 text-gray-600 transition-colors"
              >
                <PlusIcon class="w-4 h-4" />
                <span>Create New Label</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

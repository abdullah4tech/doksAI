<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLabelsStore } from '@/store/labels'
import { useChatStore } from '@/store'
import { TagIcon, XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  sessionId: string
}>()

const labelsStore = useLabelsStore()
const chatStore = useChatStore()

const isOpen = ref(false)

const session = computed(() => {
  return chatStore.sessions[props.sessionId]
})

const selectedLabels = computed({
  get: () => session.value?.labels || [],
  set: (labels) => {
    const sess = chatStore.sessions[props.sessionId]
    if (sess) {
      sess.labels = labels
      chatStore.sessions[props.sessionId] = { ...sess }
    }
  },
})

const unselectedLabels = computed(() => {
  return labelsStore.allLabels.filter((label) => !selectedLabels.value.includes(label.id))
})

const toggleLabel = (labelId: string): void => {
  const labels = [...selectedLabels.value]
  const index = labels.indexOf(labelId)

  if (index > -1) {
    labels.splice(index, 1)
  } else {
    // Check limit (10 labels per session)
    if (labels.length >= 10) {
      return
    }
    labels.push(labelId)
  }

  selectedLabels.value = labels
}

const hasLabel = (labelId: string): boolean => {
  return selectedLabels.value.includes(labelId)
}

const openDialog = (): void => {
  isOpen.value = true
}

const closeDialog = (): void => {
  isOpen.value = false
}

const getDisplayLabels = (maxVisible: number = 5): string[] => {
  return selectedLabels.value.slice(0, maxVisible)
}

const getRemainingCount = (maxVisible: number = 5): number => {
  return Math.max(0, selectedLabels.value.length - maxVisible)
}
</script>

<template>
  <div>
    <!-- Label Badges Display -->
    <div v-if="selectedLabels.length > 0" class="flex flex-wrap gap-2 mb-2">
      <div
        v-for="labelId in getDisplayLabels()"
        :key="labelId"
        class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
        :style="{ backgroundColor: labelsStore.getLabelById(labelId)?.color }"
      >
        <span class="truncate max-w-[100px]">{{ labelsStore.getLabelById(labelId)?.name }}</span>
      </div>
      <button
        v-if="getRemainingCount() > 0"
        @click="openDialog"
        class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
      >
        +{{ getRemainingCount() }}
      </button>
    </div>

    <!-- Open Button -->
    <button
      @click="openDialog"
      :class="[
        'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
        selectedLabels.length > 0
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'text-gray-600 hover:bg-gray-100',
      ]"
    >
      <TagIcon class="w-4 h-4" />
      <span>{{ selectedLabels.length > 0 ? 'Labels' : 'Add labels' }}</span>
    </button>

    <!-- Dialog Overlay -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <!-- Dialog Content -->
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">Assign Labels</h3>
            <button @click="closeDialog" class="p-1 hover:bg-gray-100 rounded transition-colors">
              <XMarkIcon class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-4 max-h-[400px] overflow-y-auto">
            <div v-if="labelsStore.allLabels.length === 0" class="text-center py-8">
              <p class="text-sm text-gray-500">No labels available. Create labels first.</p>
            </div>

            <div v-else class="space-y-2">
              <label
                v-for="label in labelsStore.allLabels"
                :key="label.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <!-- Checkbox -->
                <input
                  type="checkbox"
                  :checked="hasLabel(label.id)"
                  @change="toggleLabel(label.id)"
                  :disabled="!hasLabel(label.id) && selectedLabels.length >= 10"
                  class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />

                <!-- Color Badge -->
                <div
                  class="w-3 h-3 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: label.color }"
                />

                <!-- Label Name -->
                <span class="text-sm font-medium text-gray-900 flex-1">{{ label.name }}</span>

                <!-- Check Icon -->
                <CheckIcon v-if="hasLabel(label.id)" class="w-4 h-4 text-green-600 flex-shrink-0" />
              </label>

              <div
                v-if="selectedLabels.length >= 10"
                class="text-xs text-gray-500 text-center mt-3 pt-3 border-t border-gray-200"
              >
                Maximum 10 labels per conversation
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-gray-200 flex gap-3 justify-end">
            <button
              @click="closeDialog"
              class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Done
            </button>
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

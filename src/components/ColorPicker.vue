<script setup lang="ts">
import { computed } from 'vue'
import { DEFAULT_COLORS } from '@/store/labels'
import { CheckIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [color: string]
}>()

const selectedColor = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

const colorNames: Record<string, string> = {
  '#EF4444': 'Red',
  '#F97316': 'Orange',
  '#EAB308': 'Yellow',
  '#22C55E': 'Green',
  '#3B82F6': 'Blue',
  '#A855F7': 'Purple',
  '#EC4899': 'Pink',
  '#6B7280': 'Gray',
  '#06B6D4': 'Cyan',
  '#8B5CF6': 'Indigo',
}

const selectColor = (color: string): void => {
  selectedColor.value = color
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="text-sm font-medium text-gray-700">Color</label>
    <div class="flex flex-wrap gap-3">
      <button
        v-for="color in DEFAULT_COLORS"
        :key="color"
        @click="selectColor(color)"
        class="w-10 h-10 rounded-lg transition-all hover:scale-110 relative group"
        :style="{ backgroundColor: color }"
        :title="colorNames[color]"
      >
        <CheckIcon
          v-if="selectedColor === color"
          class="w-5 h-5 text-white absolute inset-0 m-auto"
        />

        <!-- Tooltip -->
        <div
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          {{ colorNames[color] }}
        </div>
      </button>
    </div>
  </div>
</template>

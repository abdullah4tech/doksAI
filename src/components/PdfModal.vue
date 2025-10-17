<script setup lang="ts">
import { ref, defineEmits, computed } from 'vue'
import { useDocumentStore } from '@/store/documents'

const emit = defineEmits<{
  close: []
}>()

const documentStore = useDocumentStore()
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

// Only show documents that are currently uploading
const uploadingDocuments = computed(() =>
  documentStore.allDocuments.filter((doc) => doc.status === 'uploading'),
)

const removeDocument = (id: string) => {
  documentStore.removeDocument(id)
}

const closeModal = () => {
  emit('close')
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  handleFiles(files)
}

const handleFileSelect = () => {
  fileInput.value?.click()
}

const handleFileInputChange = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  handleFiles(files)
}

const handleFiles = (files: File[]) => {
  const pdfFiles = files.filter((file) => file.type === 'application/pdf')

  pdfFiles.forEach((file) => {
    documentStore.addDocument(file)
  })
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="closeModal"
  >
    <div class="bg-white rounded-2xl w-full max-w-md shadow-xl" @click.stop>
      <!-- Main Drop Area -->
      <div class="p-8">
        <div
          :class="[
            'border-2 border-dashed rounded-xl p-16 text-center transition-colors cursor-pointer',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          ]"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="handleFileSelect"
        >
          <!-- Upload Icon (matching Grok's icon) -->
          <div class="mb-4">
            <svg
              class="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <!-- Text Content (exactly matching Grok) -->
          <div class="space-y-1">
            <h3 class="text-base font-medium text-gray-900">Drop your files here</h3>
            <p class="text-sm text-gray-500">
              Drop your files here to add them to your conversation
            </p>
          </div>

          <input
            ref="fileInput"
            type="file"
            multiple
            accept=".pdf"
            class="hidden"
            @change="handleFileInputChange"
          />
        </div>

        <!-- Upload Status (only show while uploading) -->
        <div v-if="uploadingDocuments.length > 0" class="mt-6 space-y-3">
          <div
            v-for="doc in uploadingDocuments"
            :key="doc.id"
            class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
          >
            <!-- Loading spinner -->
            <div
              class="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"
            ></div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ doc.name }}</p>
              <p class="text-xs text-blue-600">Uploading to server...</p>
            </div>

            <button @click="removeDocument(doc.id)" class="text-gray-400 hover:text-red-500 p-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, computed } from 'vue'
import FileIcon from '../assets/FileIcon.vue'
import { useDocumentStore } from '@/store/documents'

const emit = defineEmits<{
  close: []
}>()

const documentStore = useDocumentStore()
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

const documents = computed(() => documentStore.allDocuments)

const formatFileSize = (size: string) => {
  // If size is already formatted as a string, return as is
  if (typeof size === 'string') return size

  // Convert bytes to human readable format
  const bytes = parseInt(size)
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

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
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
      @click.stop
    >
      <div class="p-4 sm:p-6 border-b border-gray-200 bg-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 sm:gap-3">
            <FileIcon class="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Manage Documents</h2>
          </div>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            ×
          </button>
        </div>
      </div>

      <div class="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
        <div
          :class="[
            'border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          ]"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <FileIcon class="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
          <h3 class="text-base sm:text-lg font-medium mb-2">Drop PDF files here</h3>
          <p class="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">or</p>
          <button
            @click="handleFileSelect"
            class="bg-blue-500 text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg hover:bg-blue-600 transition"
          >
            Browse Files
          </button>
          <input
            ref="fileInput"
            type="file"
            multiple
            accept=".pdf"
            class="hidden"
            @change="handleFileInputChange"
          />
        </div>

        <div v-if="documents.length > 0" class="mt-4 sm:mt-6">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Uploaded Documents</h4>
          <div class="space-y-2">
            <div
              v-for="doc in documents"
              :key="doc.id"
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg space-y-2 sm:space-y-0"
            >
              <div class="flex items-center space-x-3 min-w-0 flex-1">
                <FileIcon class="h-5 w-5 text-red-500 flex-shrink-0" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate">{{ doc.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(doc.size) }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between sm:justify-end space-x-2">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap',
                    doc.status === 'ready'
                      ? 'bg-green-100 text-green-800'
                      : doc.status === 'uploading'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ doc.status }}
                </span>
                <button
                  @click="removeDocument(doc.id)"
                  class="text-red-500 hover:text-red-700 transition p-1"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="mt-4 sm:mt-6 text-center text-gray-500">
          <p class="text-sm sm:text-base">No documents uploaded yet</p>
        </div>
      </div>

      <div
        class="p-4 sm:p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3"
      >
        <button
          @click="closeModal"
          class="px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 transition order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          class="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition order-1 sm:order-2"
          :disabled="documents.length === 0"
          :class="{ 'opacity-50 cursor-not-allowed': documents.length === 0 }"
          @click="closeModal"
        >
          Done ({{ documents.length }})
        </button>
      </div>
    </div>
  </div>
</template>

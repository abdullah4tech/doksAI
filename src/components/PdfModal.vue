<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import FileIcon from '../assets/FileIcon.vue'

interface PDF {
  id: string
  name: string
  size: string
  uploadDate: Date
  status: 'uploading' | 'ready' | 'error'
}

const emit = defineEmits<{
  close: []
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()
const pdfs = ref<PDF[]>([])

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
    const newPdf: PDF = {
      id: Math.random().toString(36).substring(2),
      name: file.name,
      size: formatFileSize(file.size),
      uploadDate: new Date(),
      status: 'uploading',
    }

    pdfs.value.push(newPdf)

    setTimeout(() => {
      const pdf = pdfs.value.find((p) => p.id === newPdf.id)
      if (pdf) {
        pdf.status = 'ready'
      }
    }, 2000)
  })
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const removePdf = (id: string) => {
  pdfs.value = pdfs.value.filter((pdf) => pdf.id !== id)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'uploading':
      return 'text-yellow-600'
    case 'ready':
      return 'text-green-600'
    case 'error':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'uploading':
      return 'Processing...'
    case 'ready':
      return 'Ready'
    case 'error':
      return 'Error'
    default:
      return 'Unknown'
  }
}
</script>

<template>
  <div
    class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div class="rounded-xl w-[800px] max-h-[80vh] overflow-hidden" @click.stop>
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <FileIcon class="h-6 w-6" />
            <h2 class="text-xl font-semibold">Manage Documents</h2>
          </div>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
      </div>

      <div class="p-6">
        <div
          :class="[
            'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          ]"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <FileIcon class="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 class="text-lg font-medium mb-2">Drop PDF files here</h3>
          <p class="text-gray-600 mb-4">or</p>
          <button
            @click="handleFileSelect"
            class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
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

        <div v-if="pdfs.length > 0" class="mt-6">
          <h3 class="text-lg font-medium mb-4">Uploaded Documents ({{ pdfs.length }})</h3>
          <div class="max-h-60 overflow-y-auto">
            <div
              v-for="pdf in pdfs"
              :key="pdf.id"
              class="flex items-center justify-between p-3 border rounded-lg mb-2 hover:bg-gray-50"
            >
              <div class="flex items-center gap-3">
                <FileIcon class="h-5 w-5 text-red-500" />
                <div>
                  <p class="font-medium">{{ pdf.name }}</p>
                  <p class="text-sm text-gray-600">
                    {{ pdf.size }} • {{ pdf.uploadDate.toLocaleDateString() }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span :class="['text-sm font-medium', getStatusColor(pdf.status)]">
                  {{ getStatusText(pdf.status) }}
                </span>
                <button
                  @click="removePdf(pdf.id)"
                  class="text-gray-400 hover:text-red-500 transition"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="mt-6 text-center text-gray-500">
          <p>No documents uploaded yet</p>
        </div>
      </div>

      <div class="p-6 border-t bg-gray-50 flex justify-end gap-3">
        <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
          Cancel
        </button>
        <button
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          :disabled="pdfs.length === 0"
          :class="{ 'opacity-50 cursor-not-allowed': pdfs.length === 0 }"
        >
          Done ({{ pdfs.length }})
        </button>
      </div>
    </div>
  </div>
</template>

import { ref } from 'vue'

export function useFileUpload(onFiles: (files: File[]) => void) {
  const inputRef = ref<HTMLInputElement>()
  const isDragging = ref(false)

  const selectFiles = () => {
    inputRef.value?.click()
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = true
  }

  const handleDragLeave = () => {
    isDragging.value = false
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = false
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      onFiles(Array.from(files))
    }
  }

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (files && files.length > 0) {
      onFiles(Array.from(files))
    }
    target.value = ''
  }

  return {
    inputRef,
    isDragging,
    selectFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  }
}
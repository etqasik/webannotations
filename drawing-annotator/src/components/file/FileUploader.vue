<template>
  <div class="file-uploader">
    <div 
      class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
      :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isDragOver }"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        multiple
        accept=".png,.jpg,.jpeg,.bmp,.tiff,.tif,.pdf"
        @change="handleFileSelect"
      />
      
      <div class="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-gray-600 dark:text-gray-300 mb-1">
          Перетащите файлы сюда или нажмите для выбора
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          PNG, JPG, BMP, TIFF, PDF (макс. 50MB)
        </p>
      </div>
    </div>
    
    <!-- Preview of uploaded files -->
    <div v-if="filePreviews.length > 0" class="mt-4">
      <h3 class="font-medium mb-2">Выбранные файлы:</h3>
      <div class="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
        <div 
          v-for="preview in filePreviews" 
          :key="preview.id"
          class="relative group"
        >
          <img 
            :src="preview.url" 
            :alt="preview.name"
            class="w-full h-16 object-cover rounded border"
          />
          <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="text-white text-xs truncate px-1">{{ preview.name }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Progress bar for processing -->
    <div v-if="isProcessing" class="mt-4">
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ progressText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useFileStore } from '@/stores/fileStore';

const fileStore = useFileStore();
const fileInputRef = ref(null);
const isDragOver = ref(false);
const isProcessing = ref(false);
const progress = ref(0);
const progressText = ref('');
const filePreviews = ref([]);

const handleDragOver = (event) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = async (event) => {
  event.preventDefault();
  isDragOver.value = false;
  
  const files = Array.from(event.dataTransfer.files);
  await processFiles(files);
};

const triggerFileInput = () => {
  fileInputRef.value.click();
};

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files);
  await processFiles(files);
};

const processFiles = async (files) => {
  if (files.length === 0) return;
  
  // Clear previews
  filePreviews.value = [];
  
  isProcessing.value = true;
  progress.value = 0;
  progressText.value = 'Обработка файлов...';
  
  try {
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      progress.value = ((i + 1) / files.length) * 100;
      progressText.value = `Обработка ${i + 1} из ${files.length}: ${file.name}`;
      
      // Add preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        filePreviews.value.push({
          id: Date.now() + i,
          name: file.name,
          url: url
        });
      }
      // For PDF files, we'll show a generic PDF icon preview
      else if (file.type === 'application/pdf') {
        filePreviews.value.push({
          id: Date.now() + i,
          name: file.name,
          url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzU1NSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNCAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWNy40YTItMiAwIDAgMC0uNi0xLjRsLTQuNi00LjZhMiAyIDAgMCAwLTEuNC0uNnoiPjwvcGF0aD48cGF0aCBkPSJNMTQgMnY0YzAgMS4xLjkgMiAyIDJoNG0tNiAxNEgxMGEyIDIgMCAwIDEtMi0yVjgiPjwvcGF0aD48L3N2Zz4='
        });
      }
    }
    
    // Add files to store
    await fileStore.addFiles(files);
    
    // Reset progress
    setTimeout(() => {
      isProcessing.value = false;
      progress.value = 0;
      progressText.value = '';
    }, 500);
  } catch (error) {
    console.error('Error processing files:', error);
    isProcessing.value = false;
    progress.value = 0;
    progressText.value = 'Ошибка при обработке файлов';
  }
};
</script>
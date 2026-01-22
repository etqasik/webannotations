<template>
  <div class="file-navigator">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-medium">Файлы</h3>
      <div class="flex space-x-1">
        <button 
          @click="goToPreviousFile"
          :disabled="!hasPreviousFile"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Предыдущий файл"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          @click="goToNextFile"
          :disabled="!hasNextFile"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Следующий файл"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="flex items-center space-x-2 mb-3">
      <span class="text-sm text-gray-600 dark:text-gray-400">
        {{ currentIndex + 1 }} из {{ totalFiles }}
      </span>
      <span class="text-sm truncate max-w-[150px] text-gray-700 dark:text-gray-300">
        {{ currentFileName }}
      </span>
    </div>
    
    <!-- File list -->
    <div class="space-y-1 max-h-40 overflow-y-auto">
      <div
        v-for="(file, index) in files"
        :key="file.id"
        @click="selectFile(index)"
        :class="[
          'p-2 rounded cursor-pointer truncate text-sm',
          index === currentIndex 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        {{ file.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFileStore } from '@/stores/fileStore';

const fileStore = useFileStore();

const files = computed(() => fileStore.files);
const currentIndex = computed(() => fileStore.currentIndex);
const currentFileName = computed(() => fileStore.currentFile?.name || '');
const totalFiles = computed(() => fileStore.files.length);
const hasPreviousFile = computed(() => currentIndex.value > 0);
const hasNextFile = computed(() => currentIndex.value < totalFiles.value - 1);

const selectFile = (index) => {
  fileStore.setCurrentFileIndex(index);
};

const goToPreviousFile = () => {
  if (hasPreviousFile.value) {
    fileStore.setCurrentFileIndex(currentIndex.value - 1);
  }
};

const goToNextFile = () => {
  if (hasNextFile.value) {
    fileStore.setCurrentFileIndex(currentIndex.value + 1);
  }
};
</script>
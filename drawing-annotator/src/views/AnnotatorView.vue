<template>
  <div class="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Drawing Annotator</h1>
      <div class="flex items-center space-x-4">
        <button 
          @click="toggleTheme"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Переключить тему"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <FileUploader />
        </div>
        
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <FileNavigator />
        </div>
        
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <ClassSelector />
        </div>
        
        <div class="p-4 flex-1">
          <SettingsPanel />
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-auto relative">
          <CanvasView />
        </div>
        
        <!-- Status Bar -->
        <footer class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm">
          <div class="flex justify-between items-center">
            <div>Файл: {{ currentFileName || 'Нет файла' }}</div>
            <div>Масштаб: {{ scalePercentage }}%</div>
            <div>Классов: {{ annotationCount }}</div>
          </div>
        </footer>
      </main>
    </div>
    
    <!-- Logs Panel (collapsible) -->
    <div v-if="showLogs" class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 max-h-32 overflow-y-auto text-xs">
      <div class="flex justify-between items-center mb-1">
        <h3 class="font-medium">Логи</h3>
        <button @click="toggleLogs" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div v-for="(log, index) in logs" :key="index" class="mb-1">{{ log }}</div>
    </div>
    
    <button 
      @click="toggleLogs"
      class="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <!-- Toast notifications -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAnnotationStore } from '@/stores/annotationStore'
import { useFileStore } from '@/stores/fileStore'
import CanvasView from '@/components/canvas/CanvasView.vue'
import FileUploader from '@/components/file/FileUploader.vue'
import FileNavigator from '@/components/file/FileNavigator.vue'
import ClassSelector from '@/components/settings/ClassSelector.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import Toast from '@/components/ui/Toast.vue'

const settingsStore = useSettingsStore()
const annotationStore = useAnnotationStore()
const fileStore = useFileStore()

const showLogs = ref(true)

const currentFileName = computed(() => fileStore.currentFile?.name || '')
const scalePercentage = computed(() => Math.round(fileStore.scale * 100))
const annotationCount = computed(() => annotationStore.annotations.length)
const logs = computed(() => settingsStore.logs)

const toggleTheme = () => {
  settingsStore.toggleDarkMode()
}

const toggleLogs = () => {
  showLogs.value = !showLogs.value
}
</script>
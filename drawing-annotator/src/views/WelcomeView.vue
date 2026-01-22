<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4">
    <div class="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 space-y-6">
      <h1 class="text-3xl font-bold text-center text-gray-800 dark:text-white">Добро пожаловать в Drawing Annotator</h1>
      
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
            <span class="text-white text-sm">1</span>
          </div>
          <div>
            <h3 class="font-medium text-gray-800 dark:text-white">Загрузите изображения или PDF</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm mt-1">Поддерживаются форматы PNG, JPG, BMP, TIFF и PDF</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
            <span class="text-white text-sm">2</span>
          </div>
          <div>
            <h3 class="font-medium text-gray-800 dark:text-white">Аннотируйте чертежи</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm mt-1">Рисуйте bounding boxes и назначайте классы</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
            <span class="text-white text-sm">3</span>
          </div>
          <div>
            <h3 class="font-medium text-gray-800 dark:text-white">Экспортируйте данные</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm mt-1">Сохраняйте в формате YOLO или ZIP архиве</p>
          </div>
        </div>
      </div>
      
      <div class="pt-4">
        <button 
          @click="startAnnotation"
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Начать аннотацию
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

const startAnnotation = () => {
  settingsStore.setShowWelcomeScreen(false)
}
</script>
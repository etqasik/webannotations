<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import WelcomeView from '@/views/WelcomeView.vue'
import AnnotatorView from '@/views/AnnotatorView.vue'

const settingsStore = useSettingsStore()

// Определение текущей темы для body
const themeClass = computed(() => {
  return settingsStore.darkMode ? 'dark' : ''
})

// Применение темы к body
document.body.className = settingsStore.darkMode ? 'dark bg-gray-900' : 'bg-white'
</script>

<template>
  <div :class="themeClass" class="min-h-screen w-full transition-colors duration-200">
    <!-- Используем WelcomeView если это первый запуск, иначе AnnotatorView -->
    <WelcomeView v-if="settingsStore.showWelcomeScreen" />
    <AnnotatorView v-else />
  </div>
</template>

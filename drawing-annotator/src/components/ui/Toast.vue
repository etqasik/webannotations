<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'p-4 rounded-lg shadow-lg max-w-xs w-full flex items-start',
          toast.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
          toast.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
          toast.type === 'warning' ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' :
          'bg-blue-100 border border-blue-300 text-blue-800'
        ]"
      >
        <div class="flex-1">
          <div class="font-medium" v-if="toast.title">{{ toast.title }}</div>
          <div>{{ toast.message }}</div>
        </div>
        <button 
          @click="removeToast(toast.id)"
          class="ml-2 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';

const settingsStore = useSettingsStore();

const toasts = computed(() => settingsStore.toasts);

const removeToast = (id) => {
  settingsStore.removeToast(id);
};
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
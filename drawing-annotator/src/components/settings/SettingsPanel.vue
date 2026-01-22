<template>
  <div class="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
    <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Settings</h3>
    
    <div class="space-y-6">
      <!-- Theme Toggle -->
      <div class="flex items-center justify-between">
        <span class="text-gray-700 dark:text-gray-300">Dark Mode</span>
        <button
          @click="toggleTheme"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
          ]"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
        </button>
      </div>
      
      <!-- Show Logs Toggle -->
      <div class="flex items-center justify-between">
        <span class="text-gray-700 dark:text-gray-300">Show Logs Panel</span>
        <button
          @click="toggleShowLogs"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            showLogs ? 'bg-blue-500' : 'bg-gray-300'
          ]"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              showLogs ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
        </button>
      </div>
      
      <!-- Canvas Settings -->
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">Canvas Settings</h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Zoom Level</label>
            <input
              v-model.number="canvasScale"
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>10%</span>
              <span>{{ Math.round(canvasScale * 100) }}%</span>
              <span>500%</span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Reset Position</label>
            <button
              @click="resetCanvasPosition"
              class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Reset View
            </button>
          </div>
        </div>
      </div>
      
      <!-- Class Colors Configuration -->
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">Class Colors</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
          <div
            v-for="cls in classes"
            :key="cls.id"
            class="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
          >
            <div 
              class="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600" 
              :style="{ backgroundColor: cls.color }"
            ></div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ cls.name }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                ID: {{ cls.id }}
              </div>
            </div>
            <input
              type="color"
              :value="cls.color"
              @input="updateClassColor(cls.id, $event.target.value)"
              class="w-8 h-8 rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAnnotationStore } from '@/stores/annotationStore';

// Store
const settingsStore = useSettingsStore();
const annotationStore = useAnnotationStore();

// Computed
const theme = computed(() => settingsStore.theme);
const showLogs = computed(() => settingsStore.showLogs);
const canvasScale = computed({
  get: () => settingsStore.canvasScale,
  set: (value) => settingsStore.setCanvasScale(value)
});
const classes = computed(() => annotationStore.classes);

// Methods
const toggleTheme = () => {
  settingsStore.toggleTheme();
};

const toggleShowLogs = () => {
  settingsStore.setShowLogs(!settingsStore.showLogs);
};

const resetCanvasPosition = () => {
  settingsStore.setCanvasScale(1);
  settingsStore.setCanvasPosition({ x: 0, y: 0 });
};

const updateClassColor = (classId, color) => {
  annotationStore.setClassColor(classId, color);
};
</script>
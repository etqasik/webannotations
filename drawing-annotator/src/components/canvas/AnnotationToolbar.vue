<template>
  <div class="flex flex-wrap gap-2 p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <!-- Class Selection -->
    <div class="flex items-center gap-2 mr-4">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Class:</label>
      <select
        v-model="selectedClassId"
        class="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option
          v-for="cls in classes"
          :key="cls.id"
          :value="cls.id"
          :style="{ color: cls.color }"
        >
          {{ cls.name }}
        </option>
      </select>
    </div>

    <!-- Drawing Mode Toggle -->
    <button
      @click="toggleDrawingMode"
      :class="[
        'px-3 py-1 text-sm rounded-md flex items-center gap-1',
        isDrawingMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      ]"
      title="Toggle Drawing Mode (D)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      Draw
    </button>

    <!-- Zoom Controls -->
    <div class="flex items-center gap-1 ml-2">
      <button
        @click="zoomOut"
        class="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        title="Zoom Out (-)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <span class="text-sm text-gray-700 dark:text-gray-300 min-w-[50px] text-center">{{ Math.round(canvasScale * 100) }}%</span>
      <button
        @click="zoomIn"
        class="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        title="Zoom In (+)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>

    <!-- Navigation Controls -->
    <div class="flex items-center gap-1 ml-2">
      <button
        @click="goPrevFile"
        :disabled="!hasPrevFile"
        :class="[
          'p-1.5 rounded-md',
          hasPrevFile 
            ? 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' 
            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
        ]"
        title="Previous File (←)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        @click="goNextFile"
        :disabled="!hasNextFile"
        :class="[
          'p-1.5 rounded-md',
          hasNextFile 
            ? 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' 
            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
        ]"
        title="Next File (→)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-1 ml-auto">
      <button
        @click="deleteLastAnnotation"
        class="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
        title="Delete Last Annotation (D)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Last
      </button>

      <button
        @click="clearAllAnnotations"
        class="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center gap-1"
        title="Clear All Annotations"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Clear All
      </button>

      <button
        @click="saveAnnotations"
        class="px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600 flex items-center gap-1"
        title="Save Annotations (S)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Save
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAnnotationStore } from '@/stores/annotationStore';
import { useFileStore } from '@/stores/fileStore';
import { useSettingsStore } from '@/stores/settingsStore';

// Stores
const annotationStore = useAnnotationStore();
const fileStore = useFileStore();
const settingsStore = useSettingsStore();

// Computed properties
const selectedClassId = computed({
  get: () => annotationStore.selectedClassId,
  set: (value) => annotationStore.setSelectedClass(value)
});

const classes = computed(() => annotationStore.classes);
const canvasScale = computed(() => settingsStore.canvasScale);

const hasPrevFile = computed(() => fileStore.currentIndex > 0);
const hasNextFile = computed(() => fileStore.currentIndex < fileStore.files.length - 1);

// Methods
const isDrawingMode = computed(() => false); // This would be managed elsewhere

const toggleDrawingMode = () => {
  // This would toggle drawing mode, implement as needed
  console.log('Toggle drawing mode');
};

const zoomIn = () => {
  settingsStore.setCanvasScale(settingsStore.canvasScale * 1.1);
};

const zoomOut = () => {
  settingsStore.setCanvasScale(settingsStore.canvasScale * 0.9);
};

const goPrevFile = () => {
  if (hasPrevFile.value) {
    fileStore.prevFile();
  }
};

const goNextFile = () => {
  if (hasNextFile.value) {
    fileStore.nextFile();
  }
};

const deleteLastAnnotation = () => {
  if (annotationStore.annotations.length > 0) {
    const lastAnnotation = annotationStore.annotations[annotationStore.annotations.length - 1];
    annotationStore.removeAnnotation(lastAnnotation.id);
  }
};

const clearAllAnnotations = () => {
  if (confirm('Are you sure you want to clear all annotations for this file?')) {
    annotationStore.clearAnnotations();
  }
};

const saveAnnotations = () => {
  annotationStore.saveToLocalStorage();
  alert('Annotations saved successfully!');
};
</script>
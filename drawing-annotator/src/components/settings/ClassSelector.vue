<template>
  <div class="class-selector">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-medium">Классы</h3>
      <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
        {{ selectedClassCount }} / {{ totalClasses }}
      </span>
    </div>
    
    <div class="space-y-1 max-h-60 overflow-y-auto">
      <div
        v-for="cls in classes"
        :key="cls.id"
        @click="selectClass(cls.id)"
        :class="[
          'p-2 rounded cursor-pointer flex items-center space-x-2 text-sm',
          cls.id === selectedClassId 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        <div 
          class="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
          :style="{ backgroundColor: cls.color }"
        ></div>
        <span class="truncate">{{ cls.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAnnotationStore } from '@/stores/annotationStore';

const annotationStore = useAnnotationStore();

const classes = computed(() => annotationStore.classes);
const selectedClassId = computed(() => annotationStore.selectedClassId);
const selectedClassCount = computed(() => annotationStore.classes.length);
const totalClasses = computed(() => 23); // Total predefined classes

const selectClass = (classId) => {
  annotationStore.setSelectedClassId(classId);
};
</script>
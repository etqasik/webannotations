<template>
  <div class="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
    <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Select Class</h3>
    
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <button
        v-for="cls in classes"
        :key="cls.id"
        @click="selectClass(cls.id)"
        :class="[
          'flex flex-col items-center justify-center p-3 rounded-lg border transition-all',
          selectedClassId === cls.id
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500/30'
            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        ]"
      >
        <div 
          class="w-6 h-6 rounded-full mb-2" 
          :style="{ backgroundColor: cls.color }"
        ></div>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">
          {{ cls.name }}
        </span>
      </button>
    </div>
    
    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Select</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="n in 9"
          :key="n"
          @click="selectClass(n - 1)"
          class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {{ n }}
        </button>
        <button
          @click="selectClass(9)"
          class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          0
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAnnotationStore } from '@/stores/annotationStore';

// Props
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'select']);

// Store
const annotationStore = useAnnotationStore();

// Computed
const selectedClassId = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const classes = computed(() => annotationStore.classes);

// Methods
const selectClass = (classId) => {
  selectedClassId.value = classId;
  emit('select', classId);
};
</script>
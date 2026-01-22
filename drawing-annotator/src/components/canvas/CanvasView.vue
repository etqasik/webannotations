<template>
  <div 
    class="canvas-container w-full h-full relative overflow-hidden"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Canvas for drawing -->
    <canvas
      ref="canvasRef"
      class="w-full h-full"
      :style="{ cursor: isPanning ? 'grabbing' : isDrawing ? 'crosshair' : 'default' }"
    />
    
    <!-- Overlay for annotations -->
    <div 
      v-for="annotation in visibleAnnotations" 
      :key="annotation.id"
      class="annotation-box"
      :style="{
        left: `${annotation.x * scale + offset.x}px`,
        top: `${annotation.y * scale + offset.y}px`,
        width: `${annotation.width * scale}px`,
        height: `${annotation.height * scale}px`,
        borderColor: getClassColor(annotation.classId),
        backgroundColor: `${getClassColor(annotation.classId)}20` // 20% opacity
      }"
      @click="selectAnnotation(annotation.id)"
      @contextmenu.prevent="openContextMenu($event, annotation)"
    >
      <div 
        class="annotation-label"
        :style="{ backgroundColor: getClassColor(annotation.classId) }"
      >
        {{ getClassLabel(annotation.classId) }}
      </div>
    </div>
    
    <!-- Drawing preview when creating new annotation -->
    <div
      v-if="currentAnnotation"
      class="annotation-box border-solid"
      :style="{
        left: `${Math.min(currentAnnotation.startX, currentAnnotation.endX) * scale + offset.x}px`,
        top: `${Math.min(currentAnnotation.startY, currentAnnotation.endY) * scale + offset.y}px`,
        width: `${Math.abs(currentAnnotation.endX - currentAnnotation.startX) * scale}px`,
        height: `${Math.abs(currentAnnotation.endY - currentAnnotation.startY) * scale}px`,
        borderColor: getClassColor(selectedClassId)
      }"
    />
    
    <!-- Scale indicator -->
    <div class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
      {{ Math.round(scale * 100) }}%
    </div>
    
    <!-- Loading overlay -->
    <div 
      v-if="isLoading" 
      class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAnnotationStore } from '@/stores/annotationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCanvas } from '@/composables/useCanvas';
import { useAnnotations } from '@/composables/useAnnotations';

const props = defineProps({
  image: {
    type: Object,
    required: false,
    default: null
  },
  filename: {
    type: String,
    required: false,
    default: ''
  }
});

const emit = defineEmits(['annotationCreated', 'annotationSelected']);

// Stores
const annotationStore = useAnnotationStore();
const settingsStore = useSettingsStore();

// Composables
const { handleWheel } = useCanvas(ref(null)); // We'll handle events manually
const { 
  currentAnnotation, 
  isDrawing, 
  convertToImageCoords,
  addAnnotation,
  selectAnnotation: selectAnnotationInternal,
  selectedAnnotation
} = useAnnotations();

// Refs
const canvasRef = ref(null);
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });
const scale = ref(1);
const offset = ref({ x: 0, y: 0 });
const lastX = ref(0);
const lastY = ref(0);
const isLoading = ref(false);

// Computed
const selectedClassId = computed(() => annotationStore.selectedClassId);
const allAnnotations = computed(() => annotationStore.annotations);
const visibleAnnotations = computed(() => 
  allAnnotations.value.filter(ann => ann.filename === props.filename)
);

// Methods
const getClassColor = (classId) => {
  const cls = annotationStore.getClassById(classId);
  return cls ? cls.color : '#3b82f6';
};

const getClassLabel = (classId) => {
  const cls = annotationStore.getClassById(classId);
  return cls ? cls.name : 'Unknown';
};

const handleMouseDown = (event) => {
  if (event.button === 1 || event.code === 'Space') { // Middle mouse or space for panning
    isPanning.value = true;
    panStart.value = {
      x: event.clientX - offset.value.x,
      y: event.clientY - offset.value.y
    };
    document.body.style.cursor = 'grabbing';
    event.preventDefault();
  } else if (event.button === 0) { // Left mouse for drawing
    if (props.image) {
      isDrawing.value = true;
      const rect = canvasRef.value.getBoundingClientRect();
      const coords = convertToImageCoords(
        event.clientX - rect.left,
        event.clientY - rect.top
      );
      
      currentAnnotation.value = {
        startX: coords.x,
        startY: coords.y,
        endX: coords.x,
        endY: coords.y
      };
      
      lastX.value = event.clientX;
      lastY.value = event.clientY;
    }
  }
};

const handleMouseMove = (event) => {
  if (isPanning.value) {
    offset.value = {
      x: event.clientX - panStart.value.x,
      y: event.clientY - panStart.value.y
    };
  } else if (isDrawing.value && currentAnnotation.value) {
    const rect = canvasRef.value.getBoundingClientRect();
    const coords = convertToImageCoords(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
    
    currentAnnotation.value.endX = coords.x;
    currentAnnotation.value.endY = coords.y;
  }
  
  lastX.value = event.clientX;
  lastY.value = event.clientY;
};

const handleMouseUp = () => {
  if (isPanning.value) {
    isPanning.value = false;
    document.body.style.cursor = 'default';
  } else if (isDrawing.value && currentAnnotation.value) {
    // Finalize the annotation
    const width = Math.abs(currentAnnotation.value.endX - currentAnnotation.value.startX);
    const height = Math.abs(currentAnnotation.value.endY - currentAnnotation.value.startY);
    
    if (width > 5 && height > 5) { // Minimum size threshold
      const x = Math.min(currentAnnotation.value.startX, currentAnnotation.value.endX);
      const y = Math.min(currentAnnotation.value.startY, currentAnnotation.value.endY);
      
      const newAnnotation = addAnnotation(x, y, width, height, props.filename);
      emit('annotationCreated', newAnnotation);
    }
    
    currentAnnotation.value = null;
    isDrawing.value = false;
  }
};

const handleTouchStart = (event) => {
  if (event.touches.length === 1) {
    // Single touch: treat as mouse down
    const touch = event.touches[0];
    handleMouseDown({
      button: 0,
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {}
    });
  } else if (event.touches.length === 2) {
    // Two touches: prepare for pinch gesture
    isPanning.value = true;
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    panStart.value = {
      x: ((touch1.clientX + touch2.clientX) / 2) - offset.value.x,
      y: ((touch1.clientY + touch2.clientY) / 2) - offset.value.y
    };
  }
};

const handleTouchMove = (event) => {
  if (event.touches.length === 1 && isDrawing.value) {
    // Single touch move: drawing
    const touch = event.touches[0];
    handleMouseMove({
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  } else if (event.touches.length === 2 && isPanning.value) {
    // Two touch move: panning
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    
    offset.value = {
      x: centerX - panStart.value.x,
      y: centerY - panStart.value.y
    };
  }
};

const handleTouchEnd = () => {
  if (isPanning.value || isDrawing.value) {
    isPanning.value = false;
    isDrawing.value = false;
    currentAnnotation.value = null;
    document.body.style.cursor = 'default';
  }
};

const openContextMenu = (event, annotation) => {
  // Prevent default context menu and potentially show custom context menu
  event.preventDefault();
  selectAnnotation(annotation.id);
};

const selectAnnotation = (id) => {
  selectAnnotationInternal(id);
  emit('annotationSelected', id);
};

// Watch for image changes to reset canvas
watch(() => props.image, () => {
  if (props.image) {
    // Reset canvas position and scale when image changes
    scale.value = 1;
    offset.value = { x: 0, y: 0 };
  }
}, { immediate: true });

// Keyboard shortcuts
const handleKeyDown = (event) => {
  switch(event.code) {
    case 'Equal':
    case 'NumpadAdd':
      event.preventDefault();
      scale.value = Math.min(5, scale.value * 1.1);
      break;
    case 'Minus':
    case 'NumpadSubtract':
      event.preventDefault();
      scale.value = Math.max(0.1, scale.value * 0.9);
      break;
    case 'Digit0':
      event.preventDefault();
      // Reset zoom and position
      scale.value = 1;
      offset.value = { x: 0, y: 0 };
      break;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.annotation-box {
  transition: border-color 0.2s ease;
}
</style>
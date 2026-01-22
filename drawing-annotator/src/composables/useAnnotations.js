import { ref, computed } from 'vue';
import { useAnnotationStore } from '@/stores/annotationStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function useAnnotations() {
  const annotationStore = useAnnotationStore();
  const settingsStore = useSettingsStore();

  const currentAnnotation = ref(null);
  const isDrawing = ref(false);
  const dragOffset = ref({ x: 0, y: 0 });

  // Convert annotation coordinates to/from screen coordinates based on canvas scale and position
  const convertToScreenCoords = (annotation) => {
    return {
      x: annotation.x * settingsStore.canvasScale + settingsStore.canvasPosition.x,
      y: annotation.y * settingsStore.canvasScale + settingsStore.canvasPosition.y,
      width: annotation.width * settingsStore.canvasScale,
      height: annotation.height * settingsStore.canvasScale
    };
  };

  const convertToImageCoords = (screenX, screenY) => {
    return {
      x: (screenX - settingsStore.canvasPosition.x) / settingsStore.canvasScale,
      y: (screenY - settingsStore.canvasPosition.y) / settingsStore.canvasScale
    };
  };

  const addAnnotation = (x, y, width, height, filename) => {
    const annotation = {
      x,
      y,
      width,
      height,
      filename
    };
    
    const newAnnotation = annotationStore.addAnnotation(annotation);
    settingsStore.addToUndoStack({ type: 'add_annotation', annotation: newAnnotation });
    return newAnnotation;
  };

  const removeAnnotation = (id) => {
    const annotation = annotationStore.annotations.find(a => a.id === id);
    if (annotation) {
      settingsStore.addToUndoStack({ type: 'remove_annotation', annotation });
      annotationStore.removeAnnotation(id);
    }
  };

  const updateAnnotation = (id, updates) => {
    const oldAnnotation = { ...annotationStore.annotations.find(a => a.id === id) };
    annotationStore.updateAnnotation(id, updates);
    settingsStore.addToUndoStack({ type: 'update_annotation', id, oldValues: oldAnnotation, newValues: { ...oldAnnotation, ...updates } });
  };

  const getAnnotationsForCurrentFile = (filename) => {
    return annotationStore.getAnnotationsByFile(filename);
  };

  const clearAllAnnotations = () => {
    settingsStore.addToUndoStack({ type: 'clear_annotations', annotations: [...annotationStore.annotations] });
    annotationStore.clearAnnotations();
  };

  const selectedAnnotation = computed(() => {
    return annotationStore.getSelectedAnnotation();
  });

  const selectAnnotation = (id) => {
    annotationStore.selectAnnotation(id);
  };

  return {
    currentAnnotation,
    isDrawing,
    dragOffset,
    convertToScreenCoords,
    convertToImageCoords,
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    getAnnotationsForCurrentFile,
    clearAllAnnotations,
    selectedAnnotation,
    selectAnnotation
  };
}
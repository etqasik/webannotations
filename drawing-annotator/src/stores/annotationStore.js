import { defineStore } from 'pinia';
import { ref } from 'vue';

// Define 23 predefined classes with their default colors
const predefinedClasses = [
  { id: 0, name: 'Class 1', color: '#ef4444' }, // red-500
  { id: 1, name: 'Class 2', color: '#f97316' }, // orange-500
  { id: 2, name: 'Class 3', color: '#eab308' }, // yellow-500
  { id: 3, name: 'Class 4', color: '#84cc16' }, // lime-500
  { id: 4, name: 'Class 5', color: '#22c55e' }, // green-500
  { id: 5, name: 'Class 6', color: '#10b981' }, // emerald-500
  { id: 6, name: 'Class 7', color: '#06b6d4' }, // cyan-500
  { id: 7, name: 'Class 8', color: '#0ea5e9' }, // sky-500
  { id: 8, name: 'Class 9', color: '#3b82f6' }, // blue-500
  { id: 9, name: 'Class 10', color: '#6366f1' }, // indigo-500
  { id: 10, name: 'Class 11', color: '#8b5cf6' }, // violet-500
  { id: 11, name: 'Class 12', color: '#a855f7' }, // purple-500
  { id: 12, name: 'Class 13', color: '#c026d3' }, // fuchsia-500
  { id: 13, name: 'Class 14', color: '#e11d48' }, // pink-600
  { id: 14, name: 'Class 15', color: '#be123c' }, // rose-700
  { id: 15, name: 'Class 16', color: '#ca8a04' }, // amber-600
  { id: 16, name: 'Class 17', color: '#a3a3a3' }, // neutral-500
  { id: 17, name: 'Class 18', color: '#575757' }, // neutral-600
  { id: 18, name: 'Class 19', color: '#3f3f46' }, // neutral-800
  { id: 19, name: 'Class 20', color: '#1e293b' }, // slate-800
  { id: 20, name: 'Class 21', color: '#0f172a' }, // slate-900
  { id: 21, name: 'Class 22', color: '#164e63' }, // cyan-800
  { id: 22, name: 'Class 23', color: '#1e3a8a' }, // blue-900
];

export const useAnnotationStore = defineStore('annotations', () => {
  // Reactive references
  const annotations = ref([]);
  const selectedClassId = ref(0);
  const currentAnnotation = ref(null);
  const isDrawing = ref(false);
  const classes = ref(JSON.parse(JSON.stringify(predefinedClasses))); // Deep copy to avoid mutations
  const selectedAnnotationId = ref(null);

  // Methods
  const addAnnotation = (annotation) => {
    const newAnnotation = {
      ...annotation,
      id: Date.now() + Math.random(), // Unique ID
      classId: selectedClassId.value,
      createdAt: new Date()
    };
    annotations.value.push(newAnnotation);
    return newAnnotation;
  };

  const removeAnnotation = (id) => {
    const index = annotations.value.findIndex(ann => ann.id === id);
    if (index !== -1) {
      annotations.value.splice(index, 1);
      if (selectedAnnotationId.value === id) {
        selectedAnnotationId.value = null;
      }
    }
  };

  const clearAnnotations = () => {
    annotations.value = [];
    selectedAnnotationId.value = null;
  };

  const updateAnnotation = (id, updates) => {
    const annotation = annotations.value.find(ann => ann.id === id);
    if (annotation) {
      Object.assign(annotation, updates);
    }
  };

  const setClassColor = (classId, color) => {
    const classObj = classes.value.find(c => c.id === classId);
    if (classObj) {
      classObj.color = color;
    }
  };

  const setSelectedClass = (classId) => {
    selectedClassId.value = classId;
  };

  const selectAnnotation = (id) => {
    selectedAnnotationId.value = id;
  };

  const getSelectedAnnotation = () => {
    return annotations.value.find(ann => ann.id === selectedAnnotationId.value);
  };

  const getClassById = (id) => {
    return classes.value.find(cls => cls.id === id);
  };

  const getAnnotationsByFile = (filename) => {
    return annotations.value.filter(ann => ann.filename === filename);
  };

  const saveToLocalStorage = () => {
    const data = {
      annotations: annotations.value,
      classes: classes.value,
      selectedClassId: selectedClassId.value
    };
    localStorage.setItem('annotationData', JSON.stringify(data));
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('annotationData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.annotations) annotations.value = data.annotations;
        if (data.classes) classes.value = data.classes;
        if (data.selectedClassId !== undefined) selectedClassId.value = data.selectedClassId;
      } catch (e) {
        console.error('Error loading annotation data from localStorage:', e);
      }
    }
  };

  // Auto-save every 30 seconds
  setInterval(() => {
    saveToLocalStorage();
  }, 30000);

  return {
    annotations,
    selectedClassId,
    currentAnnotation,
    isDrawing,
    classes,
    selectedAnnotationId,
    addAnnotation,
    removeAnnotation,
    clearAnnotations,
    updateAnnotation,
    setClassColor,
    setSelectedClass,
    selectAnnotation,
    getSelectedAnnotation,
    getClassById,
    getAnnotationsByFile,
    saveToLocalStorage,
    loadFromLocalStorage
  };
});
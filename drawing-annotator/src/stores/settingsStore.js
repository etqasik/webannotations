import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('light'); // 'light' or 'dark'
  const showLogs = ref(true);
  const canvasScale = ref(1);
  const canvasPosition = ref({ x: 0, y: 0 });
  const isPanning = ref(false);
  const panStart = ref({ x: 0, y: 0 });
  const showWelcome = ref(true);
  const undoStack = ref([]);
  const redoStack = ref([]);

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', theme.value === 'dark');
    localStorage.setItem('theme', theme.value);
  };

  const setShowLogs = (show) => {
    showLogs.value = show;
  };

  const setCanvasScale = (scale) => {
    canvasScale.value = Math.max(0.1, Math.min(5, scale)); // Limit between 0.1 and 5
  };

  const setCanvasPosition = (position) => {
    canvasPosition.value = position;
  };

  const setIsPanning = (panning) => {
    isPanning.value = panning;
  };

  const setPanStart = (pos) => {
    panStart.value = pos;
  };

  const setShowWelcome = (show) => {
    showWelcome.value = show;
    localStorage.setItem('showWelcome', JSON.stringify(!show)); // Store opposite since we want to hide after first visit
  };

  const addToUndoStack = (action) => {
    undoStack.value.push(action);
    if (undoStack.value.length > 50) { // Limit stack size
      undoStack.value.shift();
    }
    redoStack.value = []; // Clear redo stack when new action is added
  };

  const undo = () => {
    if (undoStack.value.length > 0) {
      const action = undoStack.value.pop();
      redoStack.value.push(action);
      return action;
    }
    return null;
  };

  const redo = () => {
    if (redoStack.value.length > 0) {
      const action = redoStack.value.pop();
      undoStack.value.push(action);
      return action;
    }
    return null;
  };

  const loadSettings = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme.value = savedTheme;
      document.documentElement.classList.toggle('dark', theme.value === 'dark');
    }

    const firstVisit = localStorage.getItem('showWelcome');
    if (firstVisit) {
      showWelcome.value = !JSON.parse(firstVisit);
    }
  };

  return {
    theme,
    showLogs,
    canvasScale,
    canvasPosition,
    isPanning,
    panStart,
    showWelcome,
    undoStack,
    redoStack,
    toggleTheme,
    setShowLogs,
    setCanvasScale,
    setCanvasPosition,
    setIsPanning,
    setPanStart,
    setShowWelcome,
    addToUndoStack,
    undo,
    redo,
    loadSettings
  };
});
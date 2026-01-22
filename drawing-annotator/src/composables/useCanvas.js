import { ref, onMounted, onUnmounted } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';

export function useCanvas(canvasRef) {
  const settingsStore = useSettingsStore();
  const isDragging = ref(false);
  const dragStart = ref({ x: 0, y: 0 });
  const currentScale = ref(1);
  const currentPosition = ref({ x: 0, y: 0 });

  // Mouse events for canvas interaction
  const handleMouseDown = (event) => {
    if (event.button === 1 || event.code === 'Space') { // Middle mouse button or spacebar for panning
      settingsStore.setIsPanning(true);
      settingsStore.setPanStart({
        x: event.clientX - settingsStore.canvasPosition.x,
        y: event.clientY - settingsStore.canvasPosition.y
      });
      event.preventDefault();
    } else {
      isDragging.value = true;
      dragStart.value = { x: event.offsetX, y: event.offsetY };
    }
  };

  const handleMouseMove = (event) => {
    if (settingsStore.isPanning) {
      settingsStore.setCanvasPosition({
        x: event.clientX - settingsStore.panStart.x,
        y: event.clientY - settingsStore.panStart.y
      });
    } else if (isDragging.value) {
      // Handle box drawing
      // This would be implemented in the canvas component
    }
  };

  const handleMouseUp = () => {
    isDragging.value = false;
    if (settingsStore.isPanning) {
      settingsStore.setIsPanning(false);
    }
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, settingsStore.canvasScale * scaleFactor));
    
    // Get mouse position relative to canvas
    const rect = canvasRef.value?.getBoundingClientRect();
    if (rect) {
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Adjust canvas position to zoom towards mouse position
      settingsStore.setCanvasPosition({
        x: mouseX - (mouseX - settingsStore.canvasPosition.x) * (newScale / settingsStore.canvasScale),
        y: mouseY - (mouseY - settingsStore.canvasPosition.y) * (newScale / settingsStore.canvasScale)
      });
    }
    
    settingsStore.setCanvasScale(newScale);
  };

  // Touch events for mobile support
  const handleTouchStart = (event) => {
    if (event.touches.length === 1) {
      isDragging.value = true;
      const touch = event.touches[0];
      dragStart.value = { x: touch.clientX, y: touch.clientY };
    } else if (event.touches.length === 2) {
      // Two-finger gesture for panning
      settingsStore.setIsPanning(true);
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      settingsStore.setPanStart({
        x: (touch1.clientX + touch2.clientX) / 2 - settingsStore.canvasPosition.x,
        y: (touch1.clientY + touch2.clientY) / 2 - settingsStore.canvasPosition.y
      });
    }
  };

  const handleTouchMove = (event) => {
    if (settingsStore.isPanning && event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      settingsStore.setCanvasPosition({
        x: centerX - settingsStore.panStart.x,
        y: centerY - settingsStore.panStart.y
      });
    } else if (isDragging.value && event.touches.length === 1) {
      // Handle touch dragging
    }
  };

  const handleTouchEnd = () => {
    isDragging.value = false;
    if (settingsStore.isPanning) {
      settingsStore.setIsPanning(false);
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (event) => {
    switch(event.code) {
      case 'Space':
        // Space for panning - handled in mousedown
        break;
      case 'KeyC':
        // Select class
        event.preventDefault();
        break;
      case 'KeyD':
        // Delete last annotation
        event.preventDefault();
        break;
      case 'KeyS':
        // Save annotations
        event.preventDefault();
        break;
      case 'Equal':
      case 'NumpadAdd':
        // Zoom in
        event.preventDefault();
        settingsStore.setCanvasScale(settingsStore.canvasScale * 1.1);
        break;
      case 'Minus':
      case 'NumpadSubtract':
        // Zoom out
        event.preventDefault();
        settingsStore.setCanvasScale(settingsStore.canvasScale * 0.9);
        break;
      case 'KeyZ':
        if (event.ctrlKey || event.metaKey) {
          // Undo
          event.preventDefault();
        }
        break;
      case 'KeyY':
        if (event.ctrlKey || event.metaKey) {
          // Redo
          event.preventDefault();
        }
        break;
    }
  };

  const attachEventListeners = () => {
    window.addEventListener('keydown', handleKeyDown);
  };

  const detachEventListeners = () => {
    window.removeEventListener('keydown', handleKeyDown);
  };

  onMounted(() => {
    attachEventListeners();
  });

  onUnmounted(() => {
    detachEventListeners();
  });

  return {
    isDragging,
    dragStart,
    currentScale,
    currentPosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown
  };
}
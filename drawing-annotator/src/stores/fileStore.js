import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFileStore = defineStore('files', () => {
  const files = ref([]);
  const currentIndex = ref(-1);
  const isLoading = ref(false);
  const uploadProgress = ref(0);
  
  const supportedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/tiff', 'application/pdf'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  const addFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(file => {
      return supportedFormats.includes(file.type) && file.size <= maxSize;
    });
    
    files.value.push(...validFiles);
    
    // Set current index to the first uploaded file if this is the first upload
    if (currentIndex.value === -1 && files.value.length > 0) {
      currentIndex.value = 0;
    }
    
    return validFiles;
  };

  const setCurrentIndex = (index) => {
    if (index >= 0 && index < files.value.length) {
      currentIndex.value = index;
    }
  };

  const nextFile = () => {
    if (currentIndex.value < files.value.length - 1) {
      currentIndex.value++;
      return true;
    }
    return false;
  };

  const prevFile = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--;
      return true;
    }
    return false;
  };

  const removeFile = (index) => {
    if (index >= 0 && index < files.value.length) {
      files.value.splice(index, 1);
      
      // Adjust current index if needed
      if (currentIndex.value >= files.value.length && files.value.length > 0) {
        currentIndex.value = files.value.length - 1;
      } else if (files.value.length === 0) {
        currentIndex.value = -1;
      }
    }
  };

  const clearFiles = () => {
    files.value = [];
    currentIndex.value = -1;
  };

  const getCurrentFile = () => {
    if (currentIndex.value >= 0 && currentIndex.value < files.value.length) {
      return files.value[currentIndex.value];
    }
    return null;
  };

  const getFileUrl = (file) => {
    return URL.createObjectURL(file);
  };

  const resetProgress = () => {
    uploadProgress.value = 0;
  };

  return {
    files,
    currentIndex,
    isLoading,
    uploadProgress,
    supportedFormats,
    maxSize,
    addFiles,
    setCurrentIndex,
    nextFile,
    prevFile,
    removeFile,
    clearFiles,
    getCurrentFile,
    getFileUrl,
    resetProgress
  };
});
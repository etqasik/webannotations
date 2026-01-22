import { ref } from 'vue';
import { useFileStore } from '@/stores/fileStore';

export function useFiles() {
  const fileStore = useFileStore();
  const loading = ref(false);

  const loadFile = async (file) => {
    loading.value = true;
    try {
      if (file.type === 'application/pdf') {
        // For PDF files, we'll use pdfjs-dist to render pages
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set the worker source
        const workerUrl = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url).toString();
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        
        const typedarray = await readFileAsArrayBuffer(file);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const page = await pdf.getPage(1); // For now, just load the first page
        
        // Create a canvas to render the PDF page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to blob and create object URL
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        const url = URL.createObjectURL(blob);
        
        return { url, file };
      } else {
        // For image files, just return the object URL
        return { url: URL.createObjectURL(file), file };
      }
    } catch (error) {
      console.error('Error loading file:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const addFiles = (files) => {
    return fileStore.addFiles(files);
  };

  const nextFile = () => {
    return fileStore.nextFile();
  };

  const prevFile = () => {
    return fileStore.prevFile();
  };

  const getCurrentFile = () => {
    return fileStore.getCurrentFile();
  };

  const getFileUrl = (file) => {
    return fileStore.getFileUrl(file);
  };

  return {
    loading,
    loadFile,
    addFiles,
    nextFile,
    prevFile,
    getCurrentFile,
    getFileUrl
  };
}
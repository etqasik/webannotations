/**
 * Utility functions for handling PDF files
 */

let pdfjsLib = null;

/**
 * Initialize PDF.js library
 */
export async function initPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    
    // Set up the worker
    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url).toString();
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  }
  
  return pdfjsLib;
}

/**
 * Convert PDF file to image
 * @param {File} file - The PDF file to convert
 * @param {number} pageNumber - Page number to convert (default: 1)
 * @param {number} scale - Scale factor for rendering (default: 1.5)
 * @returns {Promise<string>} - Data URL of the rendered image
 */
export async function pdfToFile(file, pageNumber = 1, scale = 1.5) {
  try {
    const lib = await initPdfJs();
    
    // Read the PDF file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Load the PDF document
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    
    // Get the specified page
    const page = await pdf.getPage(pageNumber);
    
    // Prepare canvas for rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const viewport = page.getViewport({ scale });
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render the page
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // Return the data URL of the rendered image
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error converting PDF to image:', error);
    throw error;
  }
}

/**
 * Get the number of pages in a PDF file
 * @param {File} file - The PDF file
 * @returns {Promise<number>} - Number of pages
 */
export async function getPdfPageCount(file) {
  try {
    const lib = await initPdfJs();
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    throw error;
  }
}

/**
 * Helper function to read a file as ArrayBuffer
 * @param {File} file - The file to read
 * @returns {Promise<ArrayBuffer>}
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file as ArrayBuffer'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract all pages from a PDF as images
 * @param {File} file - The PDF file
 * @param {number} scale - Scale factor for rendering (default: 1.5)
 * @returns {Promise<Array<string>>} - Array of data URLs for each page
 */
export async function pdfToImages(file, scale = 1.5) {
  try {
    const lib = await initPdfJs();
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    const images = [];
    
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      images.push(canvas.toDataURL('image/png'));
    }
    
    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw error;
  }
}
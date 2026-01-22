/**
 * Utility functions for exporting annotations
 */

/**
 * Export annotations in YOLO format
 * @param {Array} annotations - Array of annotation objects
 * @param {number} imageWidth - Width of the image
 * @param {number} imageHeight - Height of the image
 * @returns {string} - YOLO formatted string
 */
export function exportToYOLO(annotations, imageWidth, imageHeight) {
  return annotations.map(annotation => {
    // Calculate center coordinates and normalize
    const centerX = (annotation.x + annotation.width / 2) / imageWidth;
    const centerY = (annotation.y + annotation.height / 2) / imageHeight;
    const width = annotation.width / imageWidth;
    const height = annotation.height / imageHeight;
    
    // Format: class_id center_x center_y width height
    return `${annotation.classId} ${centerX.toFixed(6)} ${centerY.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}`;
  }).join('\n');
}

/**
 * Export annotations in JSON format
 * @param {Array} annotations - Array of annotation objects
 * @param {Object} metadata - Additional metadata to include
 * @returns {string} - JSON formatted string
 */
export function exportToJSON(annotations, metadata = {}) {
  const exportData = {
    version: '1.0',
    created: new Date().toISOString(),
    ...metadata,
    annotations: annotations.map(ann => ({
      id: ann.id,
      classId: ann.classId,
      x: ann.x,
      y: ann.y,
      width: ann.width,
      height: ann.height,
      label: ann.label
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export annotations in CSV format
 * @param {Array} annotations - Array of annotation objects
 * @returns {string} - CSV formatted string
 */
export function exportToCSV(annotations) {
  const headers = ['id', 'class_id', 'label', 'x', 'y', 'width', 'height', 'created_at'];
  let csvContent = headers.join(',') + '\n';
  
  csvContent += annotations.map(annotation => {
    return [
      annotation.id,
      annotation.classId,
      `"${annotation.label || ''}"`,
      annotation.x,
      annotation.y,
      annotation.width,
      annotation.height,
      annotation.createdAt ? new Date(annotation.createdAt).toISOString() : ''
    ].join(',');
  }).join('\n');
  
  return csvContent;
}

/**
 * Download a file
 * @param {string} content - Content to download
 * @param {string} filename - Name of the file
 * @param {string} mimeType - MIME type of the file
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create a ZIP archive of annotation files
 * @param {Array} filesData - Array of objects with {filename, content}
 * @param {string} zipFilename - Name of the ZIP file
 */
export async function createZipArchive(filesData, zipFilename) {
  try {
    // Dynamically import JSZip if available, otherwise create individual files
    const hasJSZip = typeof JSZip !== 'undefined';
    
    if (hasJSZip) {
      const zip = new JSZip();
      
      filesData.forEach(file => {
        zip.file(file.filename, file.content);
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      downloadFile(blob, zipFilename, 'application/zip');
    } else {
      // Fallback: create individual files for each annotation
      filesData.forEach(file => {
        downloadFile(file.content, file.filename, 'text/plain');
      });
    }
  } catch (error) {
    console.error('Error creating ZIP archive:', error);
    
    // Fallback to individual downloads
    filesData.forEach(file => {
      downloadFile(file.content, file.filename, 'text/plain');
    });
  }
}

/**
 * Export all annotations for current project
 * @param {Array} annotations - Array of annotation objects
 * @param {string} projectName - Name of the project
 * @param {Object} imageData - Image metadata (width, height, etc.)
 */
export async function exportProject(annotations, projectName, imageData) {
  // Group annotations by file
  const groupedAnnotations = {};
  annotations.forEach(ann => {
    const filename = ann.filename || 'unknown';
    if (!groupedAnnotations[filename]) {
      groupedAnnotations[filename] = [];
    }
    groupedAnnotations[filename].push(ann);
  });
  
  const filesToExport = [];
  
  // Create YOLO format files for each image
  for (const [filename, anns] of Object.entries(groupedAnnotations)) {
    const extension = filename.split('.').pop();
    const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
    const txtFilename = `${baseName}.txt`;
    
    // Get image dimensions if available
    const imgWidth = imageData.width || 1;
    const imgHeight = imageData.height || 1;
    
    const yoloContent = exportToYOLO(anns, imgWidth, imgHeight);
    filesToExport.push({
      filename: txtFilename,
      content: yoloContent
    });
  }
  
  // Also export a JSON summary
  const jsonContent = exportToJSON(annotations, {
    projectName,
    totalAnnotations: annotations.length,
    imageData
  });
  
  filesToExport.push({
    filename: `${projectName}_summary.json`,
    content: jsonContent
  });
  
  // Create ZIP archive
  await createZipArchive(filesToExport, `${projectName}_annotations.zip`);
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size with units
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate annotations
 * @param {Array} annotations - Array of annotation objects
 * @returns {Object} - Validation results
 */
export function validateAnnotations(annotations) {
  const errors = [];
  const warnings = [];
  
  annotations.forEach((ann, index) => {
    // Check for required fields
    if (typeof ann.x !== 'number' || isNaN(ann.x)) {
      errors.push(`Annotation ${index}: Invalid x coordinate`);
    }
    
    if (typeof ann.y !== 'number' || isNaN(ann.y)) {
      errors.push(`Annotation ${index}: Invalid y coordinate`);
    }
    
    if (typeof ann.width !== 'number' || isNaN(ann.width) || ann.width <= 0) {
      errors.push(`Annotation ${index}: Invalid width`);
    }
    
    if (typeof ann.height !== 'number' || isNaN(ann.height) || ann.height <= 0) {
      errors.push(`Annotation ${index}: Invalid height`);
    }
    
    if (typeof ann.classId !== 'number' || isNaN(ann.classId)) {
      errors.push(`Annotation ${index}: Invalid classId`);
    }
    
    // Check for negative coordinates
    if (ann.x < 0 || ann.y < 0) {
      warnings.push(`Annotation ${index}: Negative coordinates detected`);
    }
    
    // Check for zero-sized annotations
    if (ann.width === 0 || ann.height === 0) {
      warnings.push(`Annotation ${index}: Zero-sized annotation`);
    }
  });
  
  return { errors, warnings };
}
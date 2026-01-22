/**
 * Utility functions for canvas operations
 */

/**
 * Calculate the aspect ratio of an image
 * @param {HTMLImageElement|Object} image - Image element or object with width and height
 * @returns {number} - Aspect ratio (width / height)
 */
export function getImageAspectRatio(image) {
  if (!image) return 1;
  return image.width / image.height;
}

/**
 * Calculate the scaled dimensions to fit within container while maintaining aspect ratio
 * @param {number} originalWidth - Original width of the image
 * @param {number} originalHeight - Original height of the image
 * @param {number} maxWidth - Maximum allowed width
 * @param {number} maxHeight - Maximum allowed height
 * @returns {Object} - Object with scaled width and height
 */
export function getScaledDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
  const originalRatio = originalWidth / originalHeight;
  const containerRatio = maxWidth / maxHeight;
  
  let width, height;
  
  if (originalRatio > containerRatio) {
    // Width is the limiting factor
    width = maxWidth;
    height = maxWidth / originalRatio;
  } else {
    // Height is the limiting factor
    height = maxHeight;
    width = maxHeight * originalRatio;
  }
  
  return { width, height };
}

/**
 * Convert client coordinates to canvas coordinates considering scale and offset
 * @param {number} clientX - Client X coordinate
 * @param {number} clientY - Client Y coordinate
 * @param {Object} canvasRect - Canvas bounding rectangle
 * @param {number} scale - Current scale factor
 * @param {Object} offset - Current offset {x, y}
 * @returns {Object} - Canvas coordinates {x, y}
 */
export function clientToCanvasCoords(clientX, clientY, canvasRect, scale, offset) {
  return {
    x: (clientX - canvasRect.left - offset.x) / scale,
    y: (clientY - canvasRect.top - offset.y) / scale
  };
}

/**
 * Convert canvas coordinates to client coordinates considering scale and offset
 * @param {number} canvasX - Canvas X coordinate
 * @param {number} canvasY - Canvas Y coordinate
 * @param {Object} canvasRect - Canvas bounding rectangle
 * @param {number} scale - Current scale factor
 * @param {Object} offset - Current offset {x, y}
 * @returns {Object} - Client coordinates {x, y}
 */
export function canvasToClientCoords(canvasX, canvasY, canvasRect, scale, offset) {
  return {
    x: canvasX * scale + offset.x + canvasRect.left,
    y: canvasY * scale + offset.y + canvasRect.top
  };
}

/**
 * Draw an annotation box on canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
 * @param {Object} annotation - Annotation object with x, y, width, height, and classId
 * @param {Array} classes - Array of class objects with color information
 * @param {number} scale - Current scale factor
 * @param {Object} offset - Current offset {x, y}
 */
export function drawAnnotation(ctx, annotation, classes, scale, offset) {
  const classInfo = classes.find(cls => cls.id === annotation.classId);
  const color = classInfo ? classInfo.color : '#3b82f6'; // Default to blue
  
  // Apply scale and offset
  const x = annotation.x * scale + offset.x;
  const y = annotation.y * scale + offset.y;
  const width = annotation.width * scale;
  const height = annotation.height * scale;
  
  // Draw the rectangle
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]); // Dashed line
  ctx.strokeRect(x, y, width, height);
  
  // Draw the label background
  ctx.fillStyle = color;
  ctx.fillRect(x, y - 20, annotation.label ? annotation.label.length * 8 : 60, 20);
  
  // Draw the label text
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px Arial';
  ctx.textBaseline = 'top';
  ctx.fillText(
    annotation.label || `${classInfo ? classInfo.name : 'Unknown'}`,
    x + 4,
    y - 18
  );
}

/**
 * Check if a point is inside an annotation box
 * @param {number} x - X coordinate of the point
 * @param {number} y - Y coordinate of the point
 * @param {Object} annotation - Annotation object
 * @param {number} scale - Current scale factor
 * @param {Object} offset - Current offset {x, y}
 * @returns {boolean} - True if point is inside the annotation box
 */
export function isPointInAnnotation(x, y, annotation, scale, offset) {
  const annX = annotation.x * scale + offset.x;
  const annY = annotation.y * scale + offset.y;
  const annWidth = annotation.width * scale;
  const annHeight = annotation.height * scale;
  
  return (
    x >= annX &&
    x <= annX + annWidth &&
    y >= annY &&
    y <= annY + annHeight
  );
}

/**
 * Calculate the bounding box that contains all annotations
 * @param {Array} annotations - Array of annotation objects
 * @returns {Object|null} - Bounding box {minX, minY, maxX, maxY} or null if no annotations
 */
export function calculateBoundingBox(annotations) {
  if (!annotations || annotations.length === 0) {
    return null;
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  for (const annotation of annotations) {
    minX = Math.min(minX, annotation.x);
    minY = Math.min(minY, annotation.y);
    maxX = Math.max(maxX, annotation.x + annotation.width);
    maxY = Math.max(maxY, annotation.y + annotation.height);
  }
  
  return { minX, minY, maxX, maxY };
}

/**
 * Fit all annotations in the current view
 * @param {Array} annotations - Array of annotation objects
 * @param {number} containerWidth - Width of the container
 * @param {number} containerHeight - Height of the container
 * @param {Function} setScale - Function to set the scale
 * @param {Function} setOffset - Function to set the offset
 */
export function fitAnnotationsInView(annotations, containerWidth, containerHeight, setScale, setOffset) {
  const bbox = calculateBoundingBox(annotations);
  if (!bbox) return;
  
  const bboxWidth = bbox.maxX - bbox.minX;
  const bboxHeight = bbox.maxY - bbox.minY;
  
  // Add some padding around the annotations
  const padding = 20;
  
  const scaleX = (containerWidth - padding * 2) / bboxWidth;
  const scaleY = (containerHeight - padding * 2) / bboxHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 1x
  
  // Center the bounding box in the view
  const offsetX = (containerWidth - bboxWidth * scale) / 2 - bbox.minX * scale;
  const offsetY = (containerHeight - bboxHeight * scale) / 2 - bbox.minY * scale;
  
  setScale(scale);
  setOffset({ x: offsetX, y: offsetY });
}

/**
 * Convert annotation coordinates from one scale/offset to another
 * @param {Object} annotation - Annotation object
 * @param {number} oldScale - Old scale factor
 * @param {Object} oldOffset - Old offset {x, y}
 * @param {number} newScale - New scale factor
 * @param {Object} newOffset - New offset {x, y}
 * @returns {Object} - New annotation object with updated coordinates
 */
export function convertAnnotationCoords(annotation, oldScale, oldOffset, newScale, newOffset) {
  // First convert to original coordinates
  const origX = (annotation.x - oldOffset.x) / oldScale;
  const origY = (annotation.y - oldOffset.y) / oldScale;
  const origWidth = annotation.width / oldScale;
  const origHeight = annotation.height / oldScale;
  
  // Then convert to new coordinates
  return {
    ...annotation,
    x: origX * newScale + newOffset.x,
    y: origY * newScale + newOffset.y,
    width: origWidth * newScale,
    height: origHeight * newScale
  };
}
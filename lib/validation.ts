// Shared validation constants and functions for file uploads

// Single source of truth for allowed file extensions
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'] as const;

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const ACCEPT_FILE_TYPES = Array.from(ALLOWED_IMAGE_TYPES).join(',');

export const ACCEPT_FILE_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS.join(',');

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  // Check file type by MIME type first
  if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      isValid: false,
      error: 'Unsupported image type. Please use JPG, PNG, GIF, WEBP, HEIC, or HEIF.'
    };
  }
  
  // Only check file extension as fallback when MIME type is missing/empty
  if (!file.type) {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return {
        isValid: false,
        error: 'Unsupported image type. Please use JPG, PNG, GIF, WEBP, HEIC, or HEIF.'
      };
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = Math.floor(MAX_FILE_SIZE / (1024 * 1024));
    return {
      isValid: false,
      error: `File size must be ${maxSizeMB}MB or less`
    };
  }

  return { isValid: true };
}

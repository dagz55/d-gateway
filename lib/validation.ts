// Shared validation constants and functions for file uploads

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const ACCEPT_FILE_TYPES = Array.from(ALLOWED_IMAGE_TYPES).join(',');

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      isValid: false,
      error: 'Unsupported image type. Please use JPG, PNG, GIF, or WEBP.'
    };
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

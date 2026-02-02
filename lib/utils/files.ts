/**
 * File handling utilities for FructoSahel
 * Handles file validation, type checking, and path generation
 */

// Allowed file types for uploads
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const ALLOWED_DOCUMENT_TYPES = ["application/pdf"] as const;

export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
] as const;

// File type categories
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
export type AllowedDocumentType = (typeof ALLOWED_DOCUMENT_TYPES)[number];
export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

// File size limits (in bytes)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB

// Upload categories for organizing files
export type UploadCategory = "receipts" | "crops" | "documents" | "general";

/**
 * File validation error types
 */
export interface FileValidationError {
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "NO_FILE" | "INVALID_NAME";
  message: string;
}

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: FileValidationError;
}

/**
 * Upload response from the API
 */
export interface UploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
  error?: string;
}

/**
 * Check if a MIME type is an allowed image type
 */
export function isAllowedImageType(
  mimeType: string,
): mimeType is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Check if a MIME type is an allowed document type
 */
export function isAllowedDocumentType(
  mimeType: string,
): mimeType is AllowedDocumentType {
  return (ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Check if a MIME type is any allowed file type
 */
export function isAllowedFileType(
  mimeType: string,
): mimeType is AllowedFileType {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Get human-readable file type from MIME type
 */
export function getFileTypeLabel(mimeType: string): string {
  const typeMap: Record<string, string> = {
    "image/jpeg": "JPEG Image",
    "image/jpg": "JPG Image",
    "image/png": "PNG Image",
    "image/gif": "GIF Image",
    "image/webp": "WebP Image",
    "application/pdf": "PDF Document",
  };
  return typeMap[mimeType] || "Unknown File";
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const extensionMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
  };
  return extensionMap[mimeType] || "";
}

/**
 * Validate a file for upload
 */
export function validateFile(
  file: File | null,
  options: {
    allowedTypes?: readonly string[];
    maxSize?: number;
  } = {},
): FileValidationResult {
  const { allowedTypes = ALLOWED_FILE_TYPES, maxSize = MAX_FILE_SIZE } =
    options;

  if (!file) {
    return {
      valid: false,
      error: {
        code: "NO_FILE",
        message: "No file provided",
      },
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map((type) => getExtensionFromMimeType(type))
      .filter(Boolean)
      .join(", ");
    return {
      valid: false,
      error: {
        code: "INVALID_TYPE",
        message: `Invalid file type. Allowed types: ${allowedExtensions}`,
      },
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: `File is too large. Maximum size is ${maxSizeMB}MB`,
      },
    };
  }

  // Check filename for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(file.name)) {
    return {
      valid: false,
      error: {
        code: "INVALID_NAME",
        message: "File name contains invalid characters",
      },
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop() || "";
  const baseName = originalName
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[^a-zA-Z0-9]/g, "-") // Replace non-alphanumeric chars
    .substring(0, 50); // Limit length

  return `${baseName}-${timestamp}-${random}.${extension}`;
}

/**
 * Get the upload path for a category
 */
export function getUploadPath(category: UploadCategory): string {
  return `/uploads/${category}`;
}

/**
 * Get the full URL for an uploaded file
 */
export function getUploadUrl(
  filename: string,
  category: UploadCategory = "general",
): string {
  return `${getUploadPath(category)}/${filename}`;
}

/**
 * Check if a URL is a valid upload URL
 */
export function isUploadUrl(url: string): boolean {
  return url.startsWith("/uploads/") || url.includes("/uploads/");
}

/**
 * Extract filename from upload URL
 */
export function getFilenameFromUrl(url: string): string | null {
  const match = url.match(/\/uploads\/(?:[\w-]+\/)?(.+)$/);
  return match ? match[1] : null;
}

/**
 * Get accepted file types string for input element
 */
export function getAcceptString(
  types: "images" | "documents" | "all" = "all",
): string {
  switch (types) {
    case "images":
      return ALLOWED_IMAGE_TYPES.join(",");
    case "documents":
      return ALLOWED_DOCUMENT_TYPES.join(",");
    case "all":
    default:
      return ALLOWED_FILE_TYPES.join(",");
  }
}

/**
 * Create a data URL from a file for preview
 */
export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Check if a file is an image
 */
export function isImageFile(file: File | { type: string }): boolean {
  return file.type.startsWith("image/");
}

/**
 * Check if a file is a PDF
 */
export function isPdfFile(file: File | { type: string }): boolean {
  return file.type === "application/pdf";
}

"use client";

import { useState, useCallback } from "react";
import {
  validateFile,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  type UploadCategory,
  type UploadResponse,
} from "@/lib/utils/files";

export interface UseFileUploadOptions {
  /** Upload category for organizing files */
  category?: UploadCategory;
  /** Allowed file types */
  allowedTypes?: readonly string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Callback on successful upload */
  onSuccess?: (response: UploadResponse) => void;
  /** Callback on upload error */
  onError?: (error: string) => void;
  /** Callback for upload progress */
  onProgress?: (progress: number) => void;
}

export interface UseFileUploadReturn {
  /** Upload a file */
  upload: (file: File) => Promise<UploadResponse | null>;
  /** Upload multiple files */
  uploadMultiple: (files: File[]) => Promise<UploadResponse[]>;
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Current upload progress (0-100) */
  progress: number;
  /** Error message if upload failed */
  error: string | null;
  /** Last successful upload response */
  lastUpload: UploadResponse | null;
  /** Reset the upload state */
  reset: () => void;
}

/**
 * Hook for programmatic file uploads
 *
 * @example
 * ```tsx
 * const { upload, isUploading, progress, error } = useFileUpload({
 *   category: "receipts",
 *   onSuccess: (response) => {
 *     console.log("Uploaded:", response.url);
 *   },
 * });
 *
 * const handleUpload = async (file: File) => {
 *   const response = await upload(file);
 *   if (response) {
 *     // Use response.url
 *   }
 * };
 * ```
 */
export function useFileUpload(
  options: UseFileUploadOptions = {},
): UseFileUploadReturn {
  const {
    category = "general",
    allowedTypes = ALLOWED_FILE_TYPES,
    maxSize = MAX_FILE_SIZE,
    onSuccess,
    onError,
    onProgress,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setLastUpload(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      // Validate file before uploading
      const validation = validateFile(file, { allowedTypes, maxSize });
      if (!validation.valid) {
        const errorMessage = validation.error?.message || "Invalid file";
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      try {
        // Use XMLHttpRequest for progress tracking
        const response = await new Promise<UploadResponse>(
          (resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const uploadProgress = Math.round(
                  (event.loaded / event.total) * 100,
                );
                setProgress(uploadProgress);
                onProgress?.(uploadProgress);
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const response = JSON.parse(
                    xhr.responseText,
                  ) as UploadResponse;
                  resolve(response);
                } catch {
                  reject(new Error("Invalid response from server"));
                }
              } else {
                try {
                  const errorResponse = JSON.parse(xhr.responseText);
                  reject(new Error(errorResponse.error || "Upload failed"));
                } catch {
                  reject(new Error(`Upload failed with status ${xhr.status}`));
                }
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error("Network error during upload"));
            });

            xhr.addEventListener("abort", () => {
              reject(new Error("Upload cancelled"));
            });

            xhr.open("POST", "/api/upload");
            xhr.send(formData);
          },
        );

        if (response.success) {
          setLastUpload(response);
          setProgress(100);
          onSuccess?.(response);
          return response;
        } else {
          throw new Error(response.error || "Upload failed");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [category, allowedTypes, maxSize, onSuccess, onError, onProgress],
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<UploadResponse[]> => {
      const results: UploadResponse[] = [];

      for (const file of files) {
        const response = await upload(file);
        if (response) {
          results.push(response);
        }
      }

      return results;
    },
    [upload],
  );

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
    error,
    lastUpload,
    reset,
  };
}

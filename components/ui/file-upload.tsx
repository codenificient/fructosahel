"use client";

import * as React from "react";
import { useCallback, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  validateFile,
  formatFileSize,
  createFilePreview,
  isImageFile,
  isPdfFile,
  getAcceptString,
  ALLOWED_FILE_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  type UploadCategory,
  type UploadResponse,
} from "@/lib/utils/files";

export interface FileUploadProps {
  /** Callback when file is successfully uploaded */
  onUpload?: (response: UploadResponse) => void;
  /** Callback when upload fails */
  onError?: (error: string) => void;
  /** Callback when file is removed */
  onRemove?: () => void;
  /** Upload category for organizing files */
  category?: UploadCategory;
  /** Restrict to specific file types */
  accept?: "images" | "documents" | "all";
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Initial file URL (for editing existing uploads) */
  initialUrl?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Label for the upload area */
  label?: string;
  /** Description text */
  description?: string;
  /** Show file size info */
  showSizeInfo?: boolean;
  /** Compact mode (smaller UI) */
  compact?: boolean;
}

export function FileUpload({
  onUpload,
  onError,
  onRemove,
  category = "general",
  accept = "all",
  maxSize = MAX_FILE_SIZE,
  initialUrl,
  disabled = false,
  className,
  label = "Upload a file",
  description,
  showSizeInfo = true,
  compact = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    initialUrl || null,
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Get allowed types based on accept prop
  const allowedTypes =
    accept === "images"
      ? ALLOWED_IMAGE_TYPES
      : accept === "documents"
        ? ["application/pdf"]
        : ALLOWED_FILE_TYPES;

  // Update preview when initialUrl changes
  useEffect(() => {
    if (initialUrl) {
      setPreview(initialUrl);
      setUploadedUrl(initialUrl);
    }
  }, [initialUrl]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setError(null);

      // Validate file
      const validation = validateFile(selectedFile, {
        allowedTypes,
        maxSize,
      });

      if (!validation.valid) {
        setError(validation.error?.message || "Invalid file");
        onError?.(validation.error?.message || "Invalid file");
        return;
      }

      setFile(selectedFile);

      // Create preview for images
      if (isImageFile(selectedFile)) {
        try {
          const previewUrl = await createFilePreview(selectedFile);
          setPreview(previewUrl);
        } catch {
          // Preview creation failed, continue without preview
        }
      } else if (isPdfFile(selectedFile)) {
        setPreview(null); // Will show PDF icon instead
      }

      // Upload the file
      await uploadFile(selectedFile);
    },
    [allowedTypes, maxSize, onError],
  );

  // Upload file to server
  const uploadFile = async (fileToUpload: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("category", category);

    try {
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<UploadResponse>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText) as UploadResponse;
              resolve(response);
            } catch {
              reject(new Error("Invalid response from server"));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.error || "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
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
      });

      const response = await uploadPromise;

      if (response.success && response.url) {
        setUploadedUrl(response.url);
        setUploadProgress(100);
        onUpload?.(response);
      } else {
        throw new Error(response.error || "Upload failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      onError?.(errorMessage);
      setFile(null);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        handleFileSelect(droppedFiles[0]);
      }
    },
    [disabled, handleFileSelect],
  );

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        handleFileSelect(selectedFiles[0]);
      }
      // Reset input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect],
  );

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  // Handle remove file
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setFile(null);
      setPreview(null);
      setUploadedUrl(null);
      setUploadProgress(0);
      setError(null);
      onRemove?.();
    },
    [onRemove],
  );

  // Render preview
  const renderPreview = () => {
    if (preview && isImageFile({ type: file?.type || "image/" })) {
      return (
        <div className="relative w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      );
    }

    if (file && isPdfFile(file)) {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <svg
            className="w-12 h-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-full">
            {file.name}
          </span>
        </div>
      );
    }

    return null;
  };

  const hasFile = file || uploadedUrl;
  const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);

  return (
    <div className={cn("w-full", className)}>
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all cursor-pointer",
          compact ? "p-4" : "p-6",
          isDragging && "border-primary bg-primary/5",
          hasFile &&
            !isUploading &&
            "border-green-500 bg-green-50 dark:bg-green-950/20",
          error && "border-red-500 bg-red-50 dark:bg-red-950/20",
          disabled && "opacity-50 cursor-not-allowed",
          !isDragging &&
            !hasFile &&
            !error &&
            "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptString(accept)}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {hasFile ? (
          <div
            className={cn(
              "flex items-center gap-4",
              compact ? "flex-row" : "flex-col",
            )}
          >
            {/* Preview */}
            <div
              className={cn(
                "overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800",
                compact ? "w-16 h-16 flex-shrink-0" : "w-32 h-32",
              )}
            >
              {renderPreview() || (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              {file && (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </>
              )}
              {isUploading && (
                <div className="mt-2 w-full">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="mt-1 text-xs text-gray-500">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
              {uploadedUrl && !isUploading && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Upload complete
                </p>
              )}
            </div>

            {/* Remove button */}
            {!isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="flex-shrink-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="ml-1">Remove</span>
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center",
              compact ? "gap-2" : "gap-4",
            )}
          >
            {/* Upload icon */}
            <div
              className={cn(
                "rounded-full bg-primary/10 flex items-center justify-center",
                compact ? "w-10 h-10" : "w-14 h-14",
              )}
            >
              <svg
                className={cn("text-primary", compact ? "w-5 h-5" : "w-7 h-7")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {/* Label and description */}
            <div className="text-center">
              <p
                className={cn(
                  "font-medium text-gray-900 dark:text-gray-100",
                  compact ? "text-sm" : "text-base",
                )}
              >
                {label}
              </p>
              <p
                className={cn(
                  "text-gray-500 dark:text-gray-400 mt-1",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                {description || (
                  <>
                    Drag and drop or{" "}
                    <span className="text-primary font-medium">browse</span>
                  </>
                )}
              </p>
              {showSizeInfo && !compact && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Max file size: {maxSizeMB}MB
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

FileUpload.displayName = "FileUpload";

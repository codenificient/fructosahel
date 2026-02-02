import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import {
  validateFile,
  generateUniqueFilename,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  type UploadCategory,
  type UploadResponse,
} from "@/lib/utils/files";

// Valid upload categories
const VALID_CATEGORIES: UploadCategory[] = [
  "receipts",
  "crops",
  "documents",
  "general",
];

/**
 * POST /api/upload - Upload a file
 *
 * Accepts multipart form data with:
 * - file: The file to upload (required)
 * - category: The upload category (optional, defaults to "general")
 *
 * Returns:
 * - success: boolean
 * - url: The public URL of the uploaded file
 * - filename: The generated filename
 * - originalName: The original filename
 * - size: File size in bytes
 * - mimeType: The file's MIME type
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<UploadResponse>> {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryParam = formData.get("category") as string | null;

    // Validate category
    const category: UploadCategory =
      categoryParam &&
      VALID_CATEGORIES.includes(categoryParam as UploadCategory)
        ? (categoryParam as UploadCategory)
        : "general";

    // Validate file
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 },
      );
    }

    // Validate file type and size
    const validation = validateFile(file, {
      allowedTypes: ALLOWED_FILE_TYPES,
      maxSize: MAX_FILE_SIZE,
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error?.message || "Invalid file",
        },
        { status: 400 },
      );
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", category);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    // Return success response with file info
    const url = `/uploads/${category}/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/upload - Get upload information
 *
 * Returns allowed file types and size limits
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    allowedTypes: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxSizeMB: MAX_FILE_SIZE / (1024 * 1024),
    categories: VALID_CATEGORIES,
  });
}

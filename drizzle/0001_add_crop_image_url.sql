-- Migration: Add image_url column to crops table
-- Phase 10.4: File Upload Functionality

-- Add image_url column to crops table for storing crop photos
ALTER TABLE crops ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN crops.image_url IS 'Optional URL to a photo of the crop for visual tracking';

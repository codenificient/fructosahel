-- Migration: Add logistics (Sahel Energies Inc.) and youth training tables
-- Date: 2026-02-21

-- Create logistics order type enum
CREATE TYPE "logistics_order_type" AS ENUM (
  'distribution',
  'storage',
  'processing_transport',
  'solar_installation',
  'equipment_delivery'
);

-- Create logistics status enum
CREATE TYPE "logistics_status" AS ENUM (
  'pending',
  'scheduled',
  'in_transit',
  'delivered',
  'stored',
  'cancelled'
);

-- Create training status enum
CREATE TYPE "training_status" AS ENUM (
  'planning',
  'enrolling',
  'in_progress',
  'completed',
  'cancelled'
);

-- Create enrollment status enum
CREATE TYPE "enrollment_status" AS ENUM (
  'applied',
  'enrolled',
  'in_progress',
  'completed',
  'dropped'
);

-- Create logistics_orders table (Sahel Energies Incorporated)
CREATE TABLE IF NOT EXISTS "logistics_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farm_id" uuid REFERENCES "farms"("id") ON DELETE CASCADE,
  "order_type" "logistics_order_type" NOT NULL,
  "status" "logistics_status" DEFAULT 'pending' NOT NULL,
  "origin" varchar(255) NOT NULL,
  "destination" varchar(255) NOT NULL,
  "cargo_description" text,
  "weight_kg" numeric(10, 2),
  "vehicle_info" varchar(255),
  "estimated_cost_usd" numeric(12, 2),
  "actual_cost_usd" numeric(12, 2),
  "scheduled_date" timestamp,
  "completed_date" timestamp,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create training_programs table
CREATE TABLE IF NOT EXISTS "training_programs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farm_id" uuid REFERENCES "farms"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "description" text,
  "status" "training_status" DEFAULT 'planning' NOT NULL,
  "location" varchar(255),
  "start_date" timestamp,
  "end_date" timestamp,
  "max_participants" integer,
  "curriculum_areas" jsonb,
  "duration_weeks" integer,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create training_enrollments table
CREATE TABLE IF NOT EXISTS "training_enrollments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "program_id" uuid NOT NULL REFERENCES "training_programs"("id") ON DELETE CASCADE,
  "participant_name" varchar(255) NOT NULL,
  "participant_age" integer,
  "participant_phone" varchar(50),
  "home_village" varchar(255),
  "status" "enrollment_status" DEFAULT 'applied' NOT NULL,
  "enrolled_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "logistics_orders_farm_id_idx" ON "logistics_orders" ("farm_id");
CREATE INDEX IF NOT EXISTS "logistics_orders_status_idx" ON "logistics_orders" ("status");
CREATE INDEX IF NOT EXISTS "logistics_orders_order_type_idx" ON "logistics_orders" ("order_type");
CREATE INDEX IF NOT EXISTS "training_programs_farm_id_idx" ON "training_programs" ("farm_id");
CREATE INDEX IF NOT EXISTS "training_programs_status_idx" ON "training_programs" ("status");
CREATE INDEX IF NOT EXISTS "training_enrollments_program_id_idx" ON "training_enrollments" ("program_id");
CREATE INDEX IF NOT EXISTS "training_enrollments_status_idx" ON "training_enrollments" ("status");

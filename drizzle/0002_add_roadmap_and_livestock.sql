-- Migration: Add roadmap phases, milestones, livestock, and farm zones
-- Also expands crop_type enum with 17 new crop types

-- Each ALTER TYPE ADD VALUE must be run outside a transaction block
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'potato';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'cowpea';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'bambara_groundnut';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'sorghum';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'pearl_millet';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'moringa';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'sweet_potato';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'onion';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'rice';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'tomato';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'pepper';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'okra';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'peanut';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'cassava';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'pigeon_pea';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'citrus';
ALTER TYPE crop_type ADD VALUE IF NOT EXISTS 'guava';

-- New enum types
CREATE TYPE phase_status AS ENUM ('not_started', 'in_progress', 'completed', 'on_hold');
CREATE TYPE milestone_status AS ENUM ('not_started', 'in_progress', 'completed', 'skipped');
CREATE TYPE milestone_category AS ENUM ('infrastructure', 'crops', 'livestock', 'equipment', 'processing', 'financial', 'other');
CREATE TYPE livestock_type AS ENUM ('chickens', 'guinea_fowl', 'ducks', 'sheep', 'pigs');
CREATE TYPE farm_zone_type AS ENUM ('zone_0_core', 'zone_1_intensive', 'zone_2_semi_intensive', 'zone_3_extensive', 'zone_4_catchment', 'buffer');

-- Roadmap phases table
CREATE TABLE IF NOT EXISTS roadmap_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phase_number INTEGER NOT NULL,
  status phase_status NOT NULL DEFAULT 'not_started',
  target_start_date TIMESTAMP,
  target_end_date TIMESTAMP,
  actual_start_date TIMESTAMP,
  actual_end_date TIMESTAMP,
  target_hectares DECIMAL(10, 2),
  target_revenue_usd DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES roadmap_phases(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category milestone_category NOT NULL DEFAULT 'other',
  status milestone_status NOT NULL DEFAULT 'not_started',
  target_date TIMESTAMP,
  completed_date TIMESTAMP,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Livestock table
CREATE TABLE IF NOT EXISTS livestock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  livestock_type livestock_type NOT NULL,
  breed VARCHAR(100),
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Farm zones table
CREATE TABLE IF NOT EXISTS farm_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  zone_type farm_zone_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  size_hectares DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_roadmap_phases_farm_id ON roadmap_phases(farm_id);
CREATE INDEX IF NOT EXISTS idx_milestones_phase_id ON milestones(phase_id);
CREATE INDEX IF NOT EXISTS idx_livestock_farm_id ON livestock(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_zones_farm_id ON farm_zones(farm_id);

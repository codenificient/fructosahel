# Database Schema Documentation

## Overview

FructoSahel uses PostgreSQL (Neon) with Drizzle ORM. The schema is designed to support multi-country farm operations, crop management, task tracking, and AI conversations.

## Entity Relationship

```
users ─────────────┬───────────────────────────────┐
                   │                               │
                   ▼                               ▼
               farms ◄─────────────────────► transactions
                   │                               │
                   ▼                               ▼
               fields                           sales
                   │
                   ▼
               crops ◄─────────────────────► tasks
                   │
                   ▼
           crop_activities

users ─────────────┬───────────────────────────────┐
                   │                               │
                   ▼                               ▼
       agent_conversations                   blog_posts
                   │
                   ▼
           agent_messages

              growing_guides (standalone)
```

## Tables

### users
Core user table for authentication and authorization.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email address |
| name | VARCHAR(255) | Full name |
| role | ENUM | admin, manager, worker, viewer |
| avatar_url | TEXT | Profile image URL |
| phone | VARCHAR(50) | Phone number |
| language | VARCHAR(10) | Preferred language (en/fr) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### farms
Farm/plantation locations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Farm name |
| location | VARCHAR(255) | City/region |
| country | ENUM | burkina_faso, mali, niger |
| size_hectares | DECIMAL(10,2) | Total farm size |
| latitude | DECIMAL(10,7) | GPS latitude |
| longitude | DECIMAL(10,7) | GPS longitude |
| description | TEXT | Additional details |
| manager_id | UUID | FK to users |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### fields
Individual plots within farms.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| farm_id | UUID | FK to farms |
| name | VARCHAR(255) | Field identifier |
| size_hectares | DECIMAL(10,2) | Field size |
| soil_type | VARCHAR(100) | Soil classification |
| irrigation_type | VARCHAR(100) | Irrigation system |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### crops
Crop plantings in fields.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| field_id | UUID | FK to fields |
| crop_type | ENUM | pineapple, cashew, avocado, mango, banana, papaya |
| variety | VARCHAR(100) | Specific variety |
| status | ENUM | planning, planted, growing, flowering, fruiting, harvesting, harvested, dormant |
| planting_date | TIMESTAMP | When planted |
| expected_harvest_date | TIMESTAMP | Expected harvest |
| actual_harvest_date | TIMESTAMP | Actual harvest |
| number_of_plants | INTEGER | Plant count |
| expected_yield_kg | DECIMAL(10,2) | Expected yield |
| actual_yield_kg | DECIMAL(10,2) | Actual yield |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### crop_activities
Activities performed on crops (watering, fertilizing, etc.).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| crop_id | UUID | FK to crops |
| activity_type | VARCHAR(100) | Type of activity |
| description | TEXT | Activity details |
| performed_at | TIMESTAMP | When performed |
| performed_by | UUID | FK to users |
| cost | DECIMAL(10,2) | Activity cost (XOF) |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation timestamp |

### tasks
Farm task assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Task title |
| description | TEXT | Task details |
| farm_id | UUID | FK to farms (optional) |
| crop_id | UUID | FK to crops (optional) |
| assigned_to | UUID | FK to users |
| created_by | UUID | FK to users |
| status | ENUM | pending, in_progress, completed, cancelled |
| priority | ENUM | low, medium, high, urgent |
| due_date | TIMESTAMP | Due date |
| completed_at | TIMESTAMP | Completion date |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### transactions
Financial transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| farm_id | UUID | FK to farms (optional) |
| type | ENUM | income, expense |
| category | VARCHAR(100) | Transaction category |
| description | TEXT | Details |
| amount | DECIMAL(12,2) | Amount in XOF |
| currency | VARCHAR(10) | Currency code (default: XOF) |
| transaction_date | TIMESTAMP | Transaction date |
| created_by | UUID | FK to users |
| attachment_url | TEXT | Receipt/invoice URL |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### sales
Produce sales records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| farm_id | UUID | FK to farms |
| crop_type | ENUM | Crop type sold |
| quantity_kg | DECIMAL(10,2) | Quantity sold |
| price_per_kg | DECIMAL(10,2) | Unit price |
| total_amount | DECIMAL(12,2) | Total sale amount |
| currency | VARCHAR(10) | Currency (default: XOF) |
| buyer_name | VARCHAR(255) | Buyer name |
| buyer_contact | VARCHAR(255) | Buyer contact info |
| sale_date | TIMESTAMP | Sale date |
| notes | TEXT | Additional notes |
| created_by | UUID | FK to users |
| created_at | TIMESTAMP | Creation timestamp |

### agent_conversations
AI agent chat sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| agent_type | ENUM | marketing, finance, agronomist |
| title | VARCHAR(255) | Conversation title |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### agent_messages
Individual messages in AI conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| conversation_id | UUID | FK to agent_conversations |
| role | VARCHAR(20) | user or assistant |
| content | TEXT | Message content |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMP | Creation timestamp |

### blog_posts
Knowledge base articles.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | VARCHAR(255) | URL slug (unique) |
| title_en | VARCHAR(255) | English title |
| title_fr | VARCHAR(255) | French title |
| content_en | TEXT | English content |
| content_fr | TEXT | French content |
| excerpt_en | TEXT | English summary |
| excerpt_fr | TEXT | French summary |
| crop_type | ENUM | Associated crop (optional) |
| cover_image_url | TEXT | Cover image URL |
| is_published | BOOLEAN | Publication status |
| author_id | UUID | FK to users |
| published_at | TIMESTAMP | Publication date |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### growing_guides
Detailed crop cultivation guides.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| crop_type | ENUM | Unique per crop type |
| title_en | VARCHAR(255) | English title |
| title_fr | VARCHAR(255) | French title |
| description_en | TEXT | English description |
| description_fr | TEXT | French description |
| growing_schedule | JSONB | Monthly tasks |
| water_needs | JSONB | Irrigation requirements |
| fertilizer_schedule | JSONB | Fertilization guide |
| pest_control | JSONB | Pest management |
| harvesting_tips | JSONB | Harvest guidance |
| sahel_specific_tips | JSONB | Regional adaptations |
| image_url | TEXT | Guide image |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Enums

### country
- `burkina_faso`
- `mali`
- `niger`

### crop_type
- `pineapple`
- `cashew`
- `avocado`
- `mango`
- `banana`
- `papaya`

### crop_status
- `planning`
- `planted`
- `growing`
- `flowering`
- `fruiting`
- `harvesting`
- `harvested`
- `dormant`

### task_status
- `pending`
- `in_progress`
- `completed`
- `cancelled`

### task_priority
- `low`
- `medium`
- `high`
- `urgent`

### transaction_type
- `income`
- `expense`

### agent_type
- `marketing`
- `finance`
- `agronomist`

### user_role
- `admin`
- `manager`
- `worker`
- `viewer`

## Indexes (Recommended)

```sql
CREATE INDEX idx_farms_country ON farms(country);
CREATE INDEX idx_fields_farm ON fields(farm_id);
CREATE INDEX idx_crops_field ON crops(field_id);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_transactions_farm ON transactions(farm_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_sales_farm ON sales(farm_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
```

## Migrations

Run migrations using Drizzle Kit:

```bash
# Generate migrations
bun drizzle-kit generate

# Push to database
bun drizzle-kit push

# Open Drizzle Studio
bun drizzle-kit studio
```

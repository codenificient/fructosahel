# FructoSahel API Documentation

**Version:** 1.0.0
**Base URL:** `https://your-domain.com/api` (Development: `http://localhost:3000/api`)

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [Request/Response Format](#requestresponse-format)
5. [Error Handling](#error-handling)
6. [API Reference](#api-reference)
   - [Farms API](#farms-api)
   - [Fields API](#fields-api)
   - [Crops API](#crops-api)
   - [Tasks API](#tasks-api)
   - [Transactions API](#transactions-api)
   - [Sales API](#sales-api)
   - [Users API](#users-api)
   - [AI Chat API](#ai-chat-api)

---

## Overview

The FructoSahel API provides a RESTful interface for managing agricultural operations in the Sahel region. It supports CRUD operations for farms, fields, crops, tasks, financial transactions, and sales, along with AI-powered advisory services.

### Key Features

- **RESTful Design**: Standard HTTP methods (GET, POST, PATCH, DELETE)
- **JSON Format**: All requests and responses use JSON
- **Zod Validation**: Server-side request validation with detailed error messages
- **Relational Data**: Related entities are included in responses where appropriate
- **Filtering**: Query parameters for filtering list endpoints
- **Computed Fields**: Automatic calculations (e.g., sales totals)

### Supported Countries

- `burkina_faso` - Burkina Faso
- `mali` - Mali
- `niger` - Niger

### Supported Crop Types

- `pineapple` - Pineapple (Ananas)
- `cashew` - Cashew (Anacarde)
- `avocado` - Avocado (Avocat)
- `mango` - Mango (Mangue)
- `banana` - Banana (Banane)
- `papaya` - Papaya (Papaye)

### Default Currency

- `XOF` - West African CFA Franc

---

## Quick Start

### 1. Create a Farm

```bash
curl -X POST http://localhost:3000/api/farms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ferme Sahel Nord",
    "location": "Ouagadougou, Region Centre",
    "country": "burkina_faso",
    "sizeHectares": 25.5,
    "description": "Mixed fruit farm focusing on mangoes and cashews"
  }'
```

### 2. Add a Field to the Farm

```bash
curl -X POST http://localhost:3000/api/fields \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "YOUR_FARM_ID",
    "name": "Parcelle A - Mangues",
    "sizeHectares": 10,
    "soilType": "Sandy loam",
    "irrigationType": "Drip irrigation"
  }'
```

### 3. Plant a Crop

```bash
curl -X POST http://localhost:3000/api/crops \
  -H "Content-Type: application/json" \
  -d '{
    "fieldId": "YOUR_FIELD_ID",
    "cropType": "mango",
    "variety": "Kent",
    "status": "planted",
    "plantingDate": "2024-06-15",
    "numberOfPlants": 200,
    "expectedYieldKg": 5000
  }'
```

### 4. Record a Sale

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "YOUR_FARM_ID",
    "cropType": "mango",
    "quantityKg": 500,
    "pricePerKg": 800,
    "buyerName": "Marche Central",
    "saleDate": "2024-12-01"
  }'
```

### 5. Get AI Advice

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "agronomist",
    "messages": [
      {"role": "user", "content": "What is the best time to plant mangoes in Burkina Faso?"}
    ]
  }'
```

---

## Authentication

> **Note:** The current API implementation does not enforce authentication. In production, implement authentication using one of these methods:

- **Session-based**: Using NextAuth.js or similar
- **API Keys**: For server-to-server communication
- **JWT Tokens**: For stateless authentication

Example with API key (when implemented):

```bash
curl -X GET http://localhost:3000/api/farms \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Request/Response Format

### Request Headers

```http
Content-Type: application/json
Accept: application/json
```

### Success Response

All successful responses return JSON with the requested data:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ferme Sahel Nord",
  "createdAt": "2024-01-15T10:30:00.000Z",
  ...
}
```

For list endpoints with computed totals:

```json
{
  "transactions": [...],
  "totals": {
    "income": 5000000,
    "expense": 1500000,
    "net": 3500000
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 500 | Internal Server Error |

---

## Error Handling

### Validation Error (400)

When request body fails Zod validation:

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    },
    {
      "field": "sizeHectares",
      "message": "Size must be positive"
    }
  ]
}
```

### Not Found Error (404)

```json
{
  "error": "Farm not found"
}
```

### Conflict Error (409)

```json
{
  "error": "A user with this email already exists"
}
```

### Server Error (500)

```json
{
  "error": "An unexpected error occurred"
}
```

---

## API Reference

---

## Farms API

Manage agricultural farms in the Sahel region.

### List All Farms

```http
GET /api/farms
```

Returns all farms with their manager and fields.

**Response:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ferme Sahel Nord",
    "location": "Ouagadougou, Region Centre",
    "country": "burkina_faso",
    "sizeHectares": "25.50",
    "latitude": "12.3456000",
    "longitude": "-1.5234000",
    "description": "Mixed fruit farm",
    "managerId": "user-uuid-here",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "manager": {
      "id": "user-uuid-here",
      "name": "Amadou Diallo",
      "email": "amadou@example.com",
      "role": "manager"
    },
    "fields": [
      {
        "id": "field-uuid",
        "name": "Parcelle A",
        "sizeHectares": "10.00"
      }
    ]
  }
]
```

**curl Example:**

```bash
curl -X GET http://localhost:3000/api/farms
```

---

### Get Single Farm

```http
GET /api/farms/{id}
```

Returns a farm with full details including fields, crops, tasks, transactions, and sales.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | uuid | Farm ID |

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ferme Sahel Nord",
  "location": "Ouagadougou, Region Centre",
  "country": "burkina_faso",
  "sizeHectares": "25.50",
  "manager": { ... },
  "fields": [
    {
      "id": "field-uuid",
      "name": "Parcelle A",
      "crops": [
        {
          "id": "crop-uuid",
          "cropType": "mango",
          "status": "growing"
        }
      ]
    }
  ],
  "tasks": [ ... ],
  "transactions": [ ... ],
  "sales": [ ... ]
}
```

**curl Example:**

```bash
curl -X GET http://localhost:3000/api/farms/550e8400-e29b-41d4-a716-446655440000
```

---

### Create Farm

```http
POST /api/farms
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Farm name (1-255 chars) |
| location | string | Yes | Location description (1-255 chars) |
| country | enum | Yes | One of: `burkina_faso`, `mali`, `niger` |
| sizeHectares | number | Yes | Farm size in hectares (positive) |
| latitude | number | No | Latitude (-90 to 90) |
| longitude | number | No | Longitude (-180 to 180) |
| description | string | No | Optional description |
| managerId | uuid | No | Manager user ID |

**Request Example:**

```json
{
  "name": "Ferme Sahel Nord",
  "location": "Ouagadougou, Region Centre",
  "country": "burkina_faso",
  "sizeHectares": 25.5,
  "latitude": 12.3456,
  "longitude": -1.5234,
  "description": "Mixed fruit farm focusing on mangoes and cashews"
}
```

**Response (201):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ferme Sahel Nord",
  "location": "Ouagadougou, Region Centre",
  "country": "burkina_faso",
  "sizeHectares": "25.50",
  "latitude": "12.3456000",
  "longitude": "-1.5234000",
  "description": "Mixed fruit farm focusing on mangoes and cashews",
  "managerId": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**curl Example:**

```bash
curl -X POST http://localhost:3000/api/farms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ferme Sahel Nord",
    "location": "Ouagadougou, Region Centre",
    "country": "burkina_faso",
    "sizeHectares": 25.5
  }'
```

---

### Update Farm

```http
PATCH /api/farms/{id}
```

All fields are optional.

**Request Body:**

```json
{
  "name": "Ferme Sahel Nord - Updated",
  "sizeHectares": 30
}
```

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ferme Sahel Nord - Updated",
  "sizeHectares": "30.00",
  "updatedAt": "2024-01-16T14:20:00.000Z",
  ...
}
```

**curl Example:**

```bash
curl -X PATCH http://localhost:3000/api/farms/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"name": "Ferme Sahel Nord - Updated", "sizeHectares": 30}'
```

---

### Delete Farm

```http
DELETE /api/farms/{id}
```

**Note:** This will cascade delete all related fields and their crops.

**Response (200):**

```json
{
  "message": "Farm deleted successfully"
}
```

**curl Example:**

```bash
curl -X DELETE http://localhost:3000/api/farms/550e8400-e29b-41d4-a716-446655440000
```

---

## Fields API

Manage fields (plots/parcels) within farms.

### List All Fields

```http
GET /api/fields
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| farmId | uuid | Filter by farm ID |

**Response:**

```json
[
  {
    "id": "field-uuid",
    "farmId": "farm-uuid",
    "name": "Parcelle A - Mangues",
    "sizeHectares": "10.00",
    "soilType": "Sandy loam",
    "irrigationType": "Drip irrigation",
    "notes": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "farm": {
      "id": "farm-uuid",
      "name": "Ferme Sahel Nord"
    },
    "crops": [ ... ]
  }
]
```

**curl Example:**

```bash
# Get all fields
curl -X GET http://localhost:3000/api/fields

# Get fields for a specific farm
curl -X GET "http://localhost:3000/api/fields?farmId=550e8400-e29b-41d4-a716-446655440000"
```

---

### Get Single Field

```http
GET /api/fields/{id}
```

Returns field with farm details and crops with their activities.

**Response:**

```json
{
  "id": "field-uuid",
  "farmId": "farm-uuid",
  "name": "Parcelle A - Mangues",
  "sizeHectares": "10.00",
  "soilType": "Sandy loam",
  "irrigationType": "Drip irrigation",
  "farm": { ... },
  "crops": [
    {
      "id": "crop-uuid",
      "cropType": "mango",
      "activities": [ ... ]
    }
  ]
}
```

---

### Create Field

```http
POST /api/fields
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| farmId | uuid | Yes | Parent farm ID |
| name | string | Yes | Field name (1-255 chars) |
| sizeHectares | number | Yes | Field size (positive) |
| soilType | string | No | Soil type (max 100 chars) |
| irrigationType | string | No | Irrigation type (max 100 chars) |
| notes | string | No | Additional notes |

**Request Example:**

```json
{
  "farmId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Parcelle A - Mangues",
  "sizeHectares": 10,
  "soilType": "Sandy loam",
  "irrigationType": "Drip irrigation"
}
```

**curl Example:**

```bash
curl -X POST http://localhost:3000/api/fields \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Parcelle A - Mangues",
    "sizeHectares": 10,
    "soilType": "Sandy loam"
  }'
```

---

### Update Field

```http
PATCH /api/fields/{id}
```

**Note:** `farmId` cannot be updated.

**Request Body:**

```json
{
  "name": "Parcelle A - Mangues Kent",
  "irrigationType": "Sprinkler"
}
```

---

### Delete Field

```http
DELETE /api/fields/{id}
```

**Note:** This will cascade delete all crops in the field.

---

## Crops API

Manage crop plantings within fields.

### List All Crops

```http
GET /api/crops
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| fieldId | uuid | Filter by field ID |
| cropType | enum | Filter by crop type |
| status | enum | Filter by status |

**Crop Types:** `pineapple`, `cashew`, `avocado`, `mango`, `banana`, `papaya`

**Status Values:** `planning`, `planted`, `growing`, `flowering`, `fruiting`, `harvesting`, `harvested`, `dormant`

**Response:**

```json
[
  {
    "id": "crop-uuid",
    "fieldId": "field-uuid",
    "cropType": "mango",
    "variety": "Kent",
    "status": "growing",
    "plantingDate": "2024-06-15T00:00:00.000Z",
    "expectedHarvestDate": "2024-12-01T00:00:00.000Z",
    "actualHarvestDate": null,
    "numberOfPlants": 200,
    "expectedYieldKg": "5000.00",
    "actualYieldKg": null,
    "notes": null,
    "field": {
      "id": "field-uuid",
      "name": "Parcelle A",
      "farm": {
        "id": "farm-uuid",
        "name": "Ferme Sahel Nord"
      }
    },
    "activities": [
      {
        "id": "activity-uuid",
        "activityType": "watering",
        "performedAt": "2024-07-01T08:00:00.000Z"
      }
    ]
  }
]
```

**curl Examples:**

```bash
# Get all crops
curl -X GET http://localhost:3000/api/crops

# Filter by crop type
curl -X GET "http://localhost:3000/api/crops?cropType=mango"

# Filter by status
curl -X GET "http://localhost:3000/api/crops?status=growing"

# Combined filters
curl -X GET "http://localhost:3000/api/crops?fieldId=uuid&cropType=mango&status=growing"
```

---

### Get Single Crop

```http
GET /api/crops/{id}
```

Returns crop with field, farm, all activities, and related tasks.

---

### Create Crop

```http
POST /api/crops
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fieldId | uuid | Yes | Parent field ID |
| cropType | enum | Yes | Type of crop |
| variety | string | No | Crop variety (max 100 chars) |
| status | enum | No | Current status (default: `planning`) |
| plantingDate | date | No | Date of planting |
| expectedHarvestDate | date | No | Expected harvest date |
| actualHarvestDate | date | No | Actual harvest date |
| numberOfPlants | integer | No | Number of plants (positive) |
| expectedYieldKg | number | No | Expected yield in kg |
| actualYieldKg | number | No | Actual yield in kg |
| notes | string | No | Additional notes |

**Request Example:**

```json
{
  "fieldId": "field-uuid",
  "cropType": "mango",
  "variety": "Kent",
  "status": "planted",
  "plantingDate": "2024-06-15",
  "expectedHarvestDate": "2024-12-01",
  "numberOfPlants": 200,
  "expectedYieldKg": 5000
}
```

**curl Example:**

```bash
curl -X POST http://localhost:3000/api/crops \
  -H "Content-Type: application/json" \
  -d '{
    "fieldId": "field-uuid",
    "cropType": "mango",
    "variety": "Kent",
    "status": "planted",
    "plantingDate": "2024-06-15",
    "numberOfPlants": 200
  }'
```

---

### Update Crop

```http
PATCH /api/crops/{id}
```

**Note:** `fieldId` cannot be updated.

**Request Example (Update Status):**

```json
{
  "status": "harvested",
  "actualHarvestDate": "2024-11-28",
  "actualYieldKg": 4500
}
```

---

### Delete Crop

```http
DELETE /api/crops/{id}
```

---

## Tasks API

Manage farm tasks and assignments.

### List All Tasks

```http
GET /api/tasks
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| farmId | uuid | Filter by farm ID |
| assignedTo | uuid | Filter by assigned user ID |
| status | enum | Filter by status |
| priority | enum | Filter by priority |

**Status Values:** `pending`, `in_progress`, `completed`, `cancelled`

**Priority Values:** `low`, `medium`, `high`, `urgent`

**Response:**

```json
[
  {
    "id": "task-uuid",
    "title": "Apply fertilizer to mango trees",
    "description": "Use NPK 15-15-15, 500g per tree",
    "farmId": "farm-uuid",
    "cropId": "crop-uuid",
    "assignedTo": "user-uuid",
    "createdBy": "user-uuid",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-07-01T00:00:00.000Z",
    "completedAt": null,
    "createdAt": "2024-06-25T10:00:00.000Z",
    "updatedAt": "2024-06-25T10:00:00.000Z",
    "farm": { ... },
    "crop": { ... },
    "assignee": { ... },
    "creator": { ... }
  }
]
```

**Note:** Results are ordered by status (pending first), then priority (urgent first), then due date.

**curl Examples:**

```bash
# Get all tasks
curl -X GET http://localhost:3000/api/tasks

# Get pending high-priority tasks
curl -X GET "http://localhost:3000/api/tasks?status=pending&priority=high"

# Get tasks for a specific user
curl -X GET "http://localhost:3000/api/tasks?assignedTo=user-uuid"
```

---

### Get Single Task

```http
GET /api/tasks/{id}
```

Returns task with farm, crop (including field), assignee, and creator details.

---

### Create Task

```http
POST /api/tasks
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Task title (1-255 chars) |
| description | string | No | Detailed description |
| farmId | uuid | No | Related farm ID |
| cropId | uuid | No | Related crop ID |
| assignedTo | uuid | No | Assigned user ID |
| createdBy | uuid | Yes | Creator user ID |
| status | enum | No | Status (default: `pending`) |
| priority | enum | No | Priority (default: `medium`) |
| dueDate | date | No | Due date |

**Request Example:**

```json
{
  "title": "Apply fertilizer to mango trees",
  "description": "Use NPK 15-15-15, 500g per tree",
  "farmId": "farm-uuid",
  "cropId": "crop-uuid",
  "assignedTo": "user-uuid",
  "createdBy": "creator-uuid",
  "priority": "high",
  "dueDate": "2024-07-01"
}
```

**curl Example:**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Apply fertilizer to mango trees",
    "createdBy": "creator-uuid",
    "priority": "high",
    "dueDate": "2024-07-01"
  }'
```

---

### Update Task

```http
PATCH /api/tasks/{id}
```

**Special Behavior:** Setting `status` to `completed` automatically sets `completedAt` to the current timestamp.

**Request Example (Complete Task):**

```json
{
  "status": "completed"
}
```

---

### Delete Task

```http
DELETE /api/tasks/{id}
```

---

## Transactions API

Manage financial transactions (income and expenses).

### List All Transactions

```http
GET /api/transactions
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| farmId | uuid | Filter by farm ID |
| type | enum | Filter by type: `income` or `expense` |
| startDate | date | Filter transactions on or after this date |
| endDate | date | Filter transactions on or before this date |

**Response:**

```json
{
  "transactions": [
    {
      "id": "txn-uuid",
      "farmId": "farm-uuid",
      "type": "expense",
      "category": "fertilizer",
      "description": "NPK 15-15-15 fertilizer purchase",
      "amount": "150000.00",
      "currency": "XOF",
      "transactionDate": "2024-06-20T00:00:00.000Z",
      "createdBy": "user-uuid",
      "attachmentUrl": null,
      "createdAt": "2024-06-20T10:00:00.000Z",
      "updatedAt": "2024-06-20T10:00:00.000Z",
      "farm": { ... },
      "creator": { ... }
    }
  ],
  "totals": {
    "income": 5000000,
    "expense": 1500000,
    "net": 3500000
  }
}
```

**curl Examples:**

```bash
# Get all transactions
curl -X GET http://localhost:3000/api/transactions

# Get expenses only
curl -X GET "http://localhost:3000/api/transactions?type=expense"

# Get transactions for a date range
curl -X GET "http://localhost:3000/api/transactions?startDate=2024-01-01&endDate=2024-12-31"

# Combine filters
curl -X GET "http://localhost:3000/api/transactions?farmId=uuid&type=income&startDate=2024-06-01"
```

---

### Get Single Transaction

```http
GET /api/transactions/{id}
```

---

### Create Transaction

```http
POST /api/transactions
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| farmId | uuid | No | Related farm ID |
| type | enum | Yes | `income` or `expense` |
| category | string | Yes | Category (1-100 chars) |
| description | string | No | Description |
| amount | number | Yes | Amount (positive) |
| currency | string | No | Currency code (default: `XOF`) |
| transactionDate | date | No | Date (default: now) |
| createdBy | uuid | No | Creator user ID |
| attachmentUrl | url | No | URL to receipt/document |

**Request Example:**

```json
{
  "farmId": "farm-uuid",
  "type": "expense",
  "category": "fertilizer",
  "description": "NPK 15-15-15 fertilizer purchase - 10 bags",
  "amount": 150000,
  "transactionDate": "2024-06-20",
  "createdBy": "user-uuid"
}
```

**curl Example:**

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "farm-uuid",
    "type": "expense",
    "category": "fertilizer",
    "amount": 150000
  }'
```

---

### Update Transaction

```http
PATCH /api/transactions/{id}
```

**Note:** `createdBy` cannot be updated.

---

### Delete Transaction

```http
DELETE /api/transactions/{id}
```

---

## Sales API

Manage crop sales with automatic total calculations.

### List All Sales

```http
GET /api/sales
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| farmId | uuid | Filter by farm ID |
| cropType | enum | Filter by crop type |
| startDate | date | Filter sales on or after this date |
| endDate | date | Filter sales on or before this date |

**Response:**

```json
{
  "sales": [
    {
      "id": "sale-uuid",
      "farmId": "farm-uuid",
      "cropType": "mango",
      "quantityKg": "500.00",
      "pricePerKg": "800.00",
      "totalAmount": "400000.00",
      "currency": "XOF",
      "buyerName": "Marche Central",
      "buyerContact": "+226 70 00 00 00",
      "saleDate": "2024-12-01T00:00:00.000Z",
      "notes": null,
      "createdBy": "user-uuid",
      "createdAt": "2024-12-01T10:00:00.000Z",
      "farm": { ... },
      "creator": { ... }
    }
  ],
  "totals": {
    "totalQuantityKg": 2500,
    "totalRevenue": 2000000,
    "averagePricePerKg": 800,
    "byCropType": {
      "mango": {
        "quantity": 1500,
        "revenue": 1200000
      },
      "cashew": {
        "quantity": 1000,
        "revenue": 800000
      }
    }
  }
}
```

**curl Examples:**

```bash
# Get all sales
curl -X GET http://localhost:3000/api/sales

# Get mango sales
curl -X GET "http://localhost:3000/api/sales?cropType=mango"

# Get sales for Q4 2024
curl -X GET "http://localhost:3000/api/sales?startDate=2024-10-01&endDate=2024-12-31"
```

---

### Get Single Sale

```http
GET /api/sales/{id}
```

---

### Create Sale

```http
POST /api/sales
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| farmId | uuid | Yes | Farm ID |
| cropType | enum | Yes | Type of crop sold |
| quantityKg | number | Yes | Quantity in kg (positive) |
| pricePerKg | number | Yes | Price per kg (positive) |
| totalAmount | number | No | Total (auto-calculated if omitted) |
| currency | string | No | Currency code (default: `XOF`) |
| buyerName | string | No | Buyer name (max 255 chars) |
| buyerContact | string | No | Buyer contact (max 255 chars) |
| saleDate | date | No | Sale date (default: now) |
| notes | string | No | Additional notes |
| createdBy | uuid | No | Creator user ID |

**Request Example:**

```json
{
  "farmId": "farm-uuid",
  "cropType": "mango",
  "quantityKg": 500,
  "pricePerKg": 800,
  "buyerName": "Marche Central",
  "buyerContact": "+226 70 00 00 00",
  "saleDate": "2024-12-01"
}
```

**Note:** `totalAmount` is automatically calculated as `quantityKg * pricePerKg` if not provided.

**curl Example:**

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "farm-uuid",
    "cropType": "mango",
    "quantityKg": 500,
    "pricePerKg": 800,
    "buyerName": "Marche Central"
  }'
```

---

### Update Sale

```http
PATCH /api/sales/{id}
```

**Note:** `farmId` and `createdBy` cannot be updated.

**Special Behavior:** If `quantityKg` or `pricePerKg` is updated, `totalAmount` is automatically recalculated unless explicitly provided.

**Request Example:**

```json
{
  "quantityKg": 600,
  "notes": "Buyer requested additional quantity"
}
```

---

### Delete Sale

```http
DELETE /api/sales/{id}
```

---

## Users API

Manage user accounts.

### List All Users

```http
GET /api/users
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| role | enum | Filter by role: `admin`, `manager`, `worker`, `viewer` |

**Response:**

```json
[
  {
    "id": "user-uuid",
    "email": "amadou@example.com",
    "name": "Amadou Diallo",
    "role": "manager",
    "avatarUrl": "https://example.com/avatar.jpg",
    "phone": "+226 70 00 00 00",
    "language": "fr",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "managedFarms": [ ... ],
    "tasks": [ ... ]
  }
]
```

**curl Examples:**

```bash
# Get all users
curl -X GET http://localhost:3000/api/users

# Get managers only
curl -X GET "http://localhost:3000/api/users?role=manager"
```

---

### Get Single User

```http
GET /api/users/{id}
```

Returns user with managed farms (including fields), tasks, and recent AI conversations.

---

### Create User

```http
POST /api/users
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email address (unique) |
| name | string | Yes | Full name (1-255 chars) |
| role | enum | No | Role (default: `viewer`) |
| avatarUrl | url | No | Avatar image URL |
| phone | string | No | Phone number (max 50 chars) |
| language | enum | No | Language: `en` or `fr` (default: `en`) |

**Role Values:** `admin`, `manager`, `worker`, `viewer`

**Request Example:**

```json
{
  "email": "amadou@example.com",
  "name": "Amadou Diallo",
  "role": "manager",
  "phone": "+226 70 00 00 00",
  "language": "fr"
}
```

**Error Response (409 - Duplicate Email):**

```json
{
  "error": "A user with this email already exists"
}
```

**curl Example:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "amadou@example.com",
    "name": "Amadou Diallo",
    "role": "manager",
    "language": "fr"
  }'
```

---

### Update User

```http
PATCH /api/users/{id}
```

**Note:** `email` cannot be updated.

**Request Example:**

```json
{
  "name": "Amadou Diallo Jr.",
  "role": "admin"
}
```

---

### Delete User

```http
DELETE /api/users/{id}
```

**Note:** Deletion may fail if user has related records (managed farms, created tasks, etc.) due to foreign key constraints.

---

## AI Chat API

AI-powered advisory services with three specialized agents.

### Agent Types

| Type | Description |
|------|-------------|
| `agronomist` | Crop cultivation, pest control, fertilization, irrigation |
| `marketing` | Market prices, buyer connections, export opportunities |
| `finance` | Budgeting, investment analysis, financial planning |

---

### Send Chat Message

```http
POST /api/ai/chat
```

Non-streaming endpoint that returns the complete response.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| agentType | enum | Yes | `agronomist`, `marketing`, or `finance` |
| messages | array | Yes | Array of message objects |

**Message Object:**

| Field | Type | Description |
|-------|------|-------------|
| role | enum | `user` or `assistant` |
| content | string | Message content |

**Request Example:**

```json
{
  "agentType": "agronomist",
  "messages": [
    {
      "role": "user",
      "content": "What is the best time to plant mangoes in Burkina Faso?"
    }
  ]
}
```

**Response:**

```json
{
  "content": "**Mango Cultivation in the Sahel**\n\nMangoes are well-suited to the Sahel climate. Here are key recommendations:\n\n**Planting Time:**\n- Plant at the start of the rainy season (June-July)\n- This gives trees time to establish before the dry season\n\n**Recommended Varieties:**\n- Kent, Keitt, and Brooks for export\n- Local Amelie for domestic markets\n\n..."
}
```

**curl Example:**

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "agronomist",
    "messages": [
      {"role": "user", "content": "What is the best time to plant mangoes in Burkina Faso?"}
    ]
  }'
```

**Multi-turn Conversation:**

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "agronomist",
    "messages": [
      {"role": "user", "content": "What is the best time to plant mangoes?"},
      {"role": "assistant", "content": "Plant at the start of the rainy season (June-July)..."},
      {"role": "user", "content": "What about irrigation needs?"}
    ]
  }'
```

---

### Stream Chat Message

```http
POST /api/ai/chat/stream
```

Streaming endpoint that returns response chunks in real-time.

**Request Body:** Same as `/api/ai/chat`

**Response:**

- Content-Type: `text/plain; charset=utf-8`
- Transfer-Encoding: `chunked`
- Body: Plain text stream of the response

**JavaScript Example:**

```javascript
async function streamChat(agentType, messages) {
  const response = await fetch('/api/ai/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentType, messages })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    result += chunk;
    console.log('Received:', chunk);
  }

  return result;
}

// Usage
streamChat('marketing', [
  { role: 'user', content: 'What are current mango prices?' }
]);
```

**curl Example:**

```bash
curl -X POST http://localhost:3000/api/ai/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "finance",
    "messages": [
      {"role": "user", "content": "What is the cost to start a mango farm?"}
    ]
  }'
```

---

### Error Responses

**Missing Required Fields (400):**

```json
{
  "error": "Missing required fields"
}
```

**Invalid Agent Type (400):**

```json
{
  "error": "Invalid agent type"
}
```

**Server Error (500):**

```json
{
  "error": "Failed to process chat request"
}
```

---

## Common Patterns

### Pagination

Currently, all list endpoints return all records. Pagination can be implemented by adding query parameters:

```http
GET /api/farms?page=1&limit=20
```

### Sorting

Results are sorted by default:
- Farms, Fields, Crops: By `createdAt` descending (newest first)
- Tasks: By status, priority, then due date
- Transactions, Sales: By date descending
- Users: By name ascending

### Date Formatting

All dates use ISO 8601 format:
- Input: `2024-06-15` or `2024-06-15T10:30:00.000Z`
- Output: `2024-06-15T10:30:00.000Z`

### Decimal Values

Monetary and measurement values are returned as strings to preserve precision:
```json
{
  "sizeHectares": "25.50",
  "amount": "150000.00"
}
```

---

## Rate Limiting

> **Note:** Rate limiting is not currently implemented. In production, consider implementing:

- 100 requests per minute for standard endpoints
- 10 requests per minute for AI chat endpoints
- Include rate limit headers in responses:
  ```http
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1640995200
  ```

---

## Changelog

### Version 1.0.0 (Phase 8.10)

- Initial API documentation
- Full CRUD for all entities
- AI Chat with streaming support
- Automatic sales calculations
- Transaction totals with date filtering

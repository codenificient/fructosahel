# Analytics Usage Guide

This guide explains how to use the analytics telemetry system in the FructoSahel Next.js app.

## Overview

The analytics system uses `@codenificient/analytics-sdk` to track user interactions and events throughout the application. All tracking is:
- **Non-blocking**: Tracking failures won't affect user experience
- **Fail-silent**: Errors are logged but don't disrupt the app
- **Privacy-conscious**: Only enabled when explicitly configured
- **Locale-aware**: Automatically tracks the current locale from next-intl routing

## Configuration

The system is configured via environment variables in `.env.local`:

```env
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_API_KEY=proj_fructosahel_key
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://analytics-dashboard-phi-six.vercel.app/api
```

## Automatic Tracking

### Page Views
Page views are automatically tracked by the `AnalyticsProvider` component which is already integrated in the layout. No additional code is needed.

## Manual Tracking

Import the analytics instance:

```typescript
import { getAnalytics } from '@/lib/analytics';
```

### Track Authentication Events

```typescript
const analytics = getAnalytics();

// User signup
analytics.authAction('signup', {
  method: 'email',
  success: true
});

// User login
analytics.authAction('login', {
  method: 'google',
  success: true
});

// Failed login
analytics.authAction('login', {
  method: 'email',
  success: false,
  errorMessage: 'Invalid credentials'
});

// Logout
analytics.authAction('logout');
```

### Track Farm Management Events

```typescript
const analytics = getAnalytics();

// Farm created
analytics.farmAction('farm_created', {
  farmId: 'farm_123',
  farmSize: 5.5, // in hectares
  location: 'Ouagadougou, Burkina Faso',
  cropTypes: ['pineapple', 'mango']
});

// Farm updated
analytics.farmAction('farm_updated', {
  farmId: 'farm_123',
  farmSize: 6.0
});

// Farm viewed
analytics.farmAction('farm_viewed', {
  farmId: 'farm_123'
});

// Farm deleted
analytics.farmAction('farm_deleted', {
  farmId: 'farm_123'
});
```

### Track Crop Management Events

```typescript
const analytics = getAnalytics();

// Crop added
analytics.cropAction('crop_added', {
  cropId: 'crop_456',
  cropType: 'pineapple',
  plantingDate: '2024-11-01',
  expectedHarvestDate: '2025-09-01'
});

// Crop health checked
analytics.cropAction('crop_health_checked', {
  cropId: 'crop_456',
  healthStatus: 'good'
});

// Crop harvested
analytics.cropAction('crop_harvested', {
  cropId: 'crop_456',
  cropType: 'pineapple',
  quantity: 1500 // in kg
});
```

### Track Custom Events

```typescript
const analytics = getAnalytics();

// Generic custom event
analytics.custom('feature_used', {
  category: 'engagement',
  label: 'weather_forecast_viewed',
  value: 1
});

// Add any custom properties
analytics.custom('ai_recommendation', {
  category: 'ai',
  label: 'pest_control_advice',
  success: true,
  confidence: 0.95,
  language: 'fr'
});
```

### Set User ID

When a user logs in, set their user ID for consistent tracking:

```typescript
const analytics = getAnalytics();

// On login
analytics.setUserId('user_123');

// On logout
analytics.setUserId(null);
```

### Flush Events

To ensure events are sent before page unload (already handled by AnalyticsProvider):

```typescript
const analytics = getAnalytics();

analytics.flush();
```

## Example: Tracking in a Component

```typescript
'use client';

import { useState } from 'react';
import { getAnalytics } from '@/lib/analytics';

export function FarmForm() {
  const [farmName, setFarmName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const analytics = getAnalytics();

    try {
      // Create farm in database
      const farm = await createFarm({ name: farmName });

      // Track successful creation
      analytics.farmAction('farm_created', {
        farmId: farm.id,
        farmSize: farm.size,
        location: farm.location
      });

      // Success handling...
    } catch (error) {
      // Error handling...
      // Analytics tracking still happens in background
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Example: Tracking in Server Actions

```typescript
'use server';

import { getAnalytics } from '@/lib/analytics';

export async function updateCrop(cropId: string, data: CropData) {
  const analytics = getAnalytics();

  try {
    // Update in database
    const crop = await db.crop.update({ where: { id: cropId }, data });

    // Track update (will work on server side too)
    analytics.cropAction('crop_updated', {
      cropId: crop.id,
      cropType: crop.type,
      healthStatus: crop.healthStatus
    });

    return { success: true, crop };
  } catch (error) {
    return { success: false, error };
  }
}
```

## Event Types

All supported event types are defined in `/types/analytics.ts`:

- **PageViewEvent**: Automatic page navigation tracking
- **AuthEvent**: User authentication actions (signup, login, logout, etc.)
- **FarmEvent**: Farm management actions (create, update, delete, view)
- **CropEvent**: Crop management actions (add, update, harvest, health check)
- **AIEvent**: AI agent interactions (queries, responses, suggestions)
- **CustomEvent**: Any custom tracking needs

## Privacy & Performance

- Analytics only runs when `NEXT_PUBLIC_ANALYTICS_ENABLED=true`
- All events include a session ID for grouping
- User ID is optional and must be explicitly set
- Events are sent via `keepalive` to work even during navigation
- Failed tracking doesn't block the UI or throw errors
- Events are queued and sent asynchronously

## Debugging

Set `NODE_ENV=development` to see debug logs in the console:

```javascript
[Analytics] Initialized with config: { enabled: true, endpoint: '...', sessionId: '...' }
[Analytics] Tracking event: { ... }
```

## Architecture

```
User Action
    ↓
Component calls getAnalytics().trackEvent()
    ↓
Event queued with enriched metadata (locale, sessionId, userId)
    ↓
Sent to /api/analytics/track (Next.js API route)
    ↓
Proxied to analytics endpoint with API key
    ↓
Stored in analytics dashboard
```

This architecture keeps the API key secure on the server and ensures tracking is non-blocking.

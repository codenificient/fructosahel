# Analytics Quick Reference

## Import
```typescript
import { getAnalytics } from '@/lib/analytics';
const analytics = getAnalytics();
```

## Page Views (Automatic)
Automatically tracked by `AnalyticsProvider` - no code needed.

## Authentication
```typescript
// Signup
analytics.authAction('signup', { method: 'email', success: true });

// Login
analytics.authAction('login', { method: 'email', success: true });

// Logout
analytics.authAction('logout');

// Set user ID
analytics.setUserId('user_123');
```

## Farm Management
```typescript
// Create
analytics.farmAction('farm_created', {
  farmId: 'farm_123',
  farmSize: 5.5,
  location: 'Ouagadougou',
  cropTypes: ['pineapple', 'mango']
});

// Update
analytics.farmAction('farm_updated', { farmId: 'farm_123' });

// Delete
analytics.farmAction('farm_deleted', { farmId: 'farm_123' });

// View
analytics.farmAction('farm_viewed', { farmId: 'farm_123' });
```

## Crop Management
```typescript
// Add crop
analytics.cropAction('crop_added', {
  cropId: 'crop_456',
  cropType: 'pineapple',
  plantingDate: '2024-11-01'
});

// Update crop
analytics.cropAction('crop_updated', { cropId: 'crop_456' });

// Check health
analytics.cropAction('crop_health_checked', {
  cropId: 'crop_456',
  healthStatus: 'good'
});

// Harvest
analytics.cropAction('crop_harvested', {
  cropId: 'crop_456',
  cropType: 'pineapple',
  quantity: 1500
});
```

## Custom Events
```typescript
analytics.custom('event_name', {
  category: 'category_name',
  label: 'label',
  value: 123,
  // any custom properties
});
```

## Crop Types
- `pineapple`
- `cashew`
- `mango`
- `avocado`
- `banana`
- `papaya`

## Health Status
- `excellent`
- `good`
- `fair`
- `poor`
- `critical`

## Auth Methods
- `email`
- `google`
- `facebook`
- `other`

## Environment Variables
```env
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_API_KEY=proj_fructosahel_key
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://analytics-dashboard-phi-six.vercel.app/api
```

## Debugging
Enable debug mode by setting `NODE_ENV=development`. Look for `[Analytics]` logs in the console.

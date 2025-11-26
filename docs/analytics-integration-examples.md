# Analytics Integration Examples

Real-world examples of integrating analytics into FructoSahel components.

## Example 1: Authentication Flow

### Sign Up Component

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAnalytics } from '@/lib/analytics';

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const analytics = getAnalytics();

    try {
      // Call your auth API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { userId } = await response.json();

        // Track successful signup
        analytics.authAction('signup', {
          method: 'email',
          success: true,
        });

        // Set user ID for subsequent tracking
        analytics.setUserId(userId);

        router.push('/dashboard');
      } else {
        const { error } = await response.json();

        // Track failed signup
        analytics.authAction('signup', {
          method: 'email',
          success: false,
          errorMessage: error,
        });
      }
    } catch (error) {
      // Track error
      analytics.authAction('signup', {
        method: 'email',
        success: false,
        errorMessage: 'Network error',
      });
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      {/* Form fields */}
    </form>
  );
}
```

## Example 2: Farm Creation

### Create Farm Component

```typescript
'use client';

import { useState } from 'react';
import { getAnalytics } from '@/lib/analytics';
import { useTranslations } from 'next-intl';

export function CreateFarmDialog() {
  const t = useTranslations('farm');
  const [farmData, setFarmData] = useState({
    name: '',
    size: 0,
    location: '',
    cropTypes: [] as string[],
  });

  const handleCreateFarm = async () => {
    const analytics = getAnalytics();

    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        body: JSON.stringify(farmData),
      });

      if (response.ok) {
        const farm = await response.json();

        // Track farm creation
        analytics.farmAction('farm_created', {
          farmId: farm.id,
          farmSize: farm.size,
          location: farm.location,
          cropTypes: farm.cropTypes,
        });

        // Close dialog and refresh
      }
    } catch (error) {
      // Error handling - analytics will still track in background
      console.error('Failed to create farm:', error);
    }
  };

  return (
    <div>
      {/* Farm creation form */}
    </div>
  );
}
```

## Example 3: Crop Health Monitoring

### Crop Health Card Component

```typescript
'use client';

import { useState } from 'react';
import { getAnalytics } from '@/lib/analytics';

interface CropHealthCardProps {
  crop: {
    id: string;
    type: 'pineapple' | 'mango' | 'cashew' | 'avocado' | 'banana' | 'papaya';
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  };
}

export function CropHealthCard({ crop }: CropHealthCardProps) {
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    const analytics = getAnalytics();

    try {
      const response = await fetch(`/api/crops/${crop.id}/check-health`, {
        method: 'POST',
      });

      if (response.ok) {
        const { healthStatus } = await response.json();

        // Track health check
        analytics.cropAction('crop_health_checked', {
          cropId: crop.id,
          cropType: crop.type,
          healthStatus: healthStatus,
        });

        // Update UI with new health status
      }
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <h3>{crop.type}</h3>
      <p>Health: {crop.healthStatus}</p>
      <button onClick={checkHealth} disabled={isChecking}>
        {isChecking ? 'Checking...' : 'Check Health'}
      </button>
    </div>
  );
}
```

## Example 4: AI Chat Integration

### AI Assistant Component

```typescript
'use client';

import { useState } from 'react';
import { getAnalytics } from '@/lib/analytics';

export function AIAssistant() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const askAI = async () => {
    const analytics = getAnalytics();
    const startTime = Date.now();

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });

      if (res.ok) {
        const data = await res.json();
        const responseTime = Date.now() - startTime;

        setResponse(data.answer);

        // Track successful AI query
        analytics.custom('ai_query_submitted', {
          category: 'ai',
          queryType: data.type,
          responseTime,
          success: true,
        });
      } else {
        // Track failed query
        analytics.custom('ai_query_submitted', {
          category: 'ai',
          success: false,
          responseTime: Date.now() - startTime,
        });
      }
    } catch (error) {
      console.error('AI query failed:', error);
    }
  };

  return (
    <div>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a farming question..."
      />
      <button onClick={askAI}>Ask AI</button>
      {response && <p>{response}</p>}
    </div>
  );
}
```

## Example 5: Harvest Recording

### Harvest Form Component

```typescript
'use client';

import { useState } from 'react';
import { getAnalytics } from '@/lib/analytics';
import { format } from 'date-fns';

interface HarvestFormProps {
  cropId: string;
  cropType: 'pineapple' | 'mango' | 'cashew' | 'avocado' | 'banana' | 'papaya';
}

export function HarvestForm({ cropId, cropType }: HarvestFormProps) {
  const [quantity, setQuantity] = useState(0);
  const [date, setDate] = useState(new Date());

  const recordHarvest = async () => {
    const analytics = getAnalytics();

    try {
      const response = await fetch(`/api/crops/${cropId}/harvest`, {
        method: 'POST',
        body: JSON.stringify({
          quantity,
          date: format(date, 'yyyy-MM-dd'),
        }),
      });

      if (response.ok) {
        // Track harvest
        analytics.cropAction('crop_harvested', {
          cropId,
          cropType,
          quantity,
        });

        // Also track as custom event for detailed analytics
        analytics.custom('harvest_recorded', {
          category: 'farming',
          label: cropType,
          value: quantity,
          harvestDate: format(date, 'yyyy-MM-dd'),
        });

        // Show success message
      }
    } catch (error) {
      console.error('Failed to record harvest:', error);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); recordHarvest(); }}>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        placeholder="Quantity (kg)"
      />
      <input
        type="date"
        value={format(date, 'yyyy-MM-dd')}
        onChange={(e) => setDate(new Date(e.target.value))}
      />
      <button type="submit">Record Harvest</button>
    </form>
  );
}
```

## Example 6: Navigation Tracking

### Dashboard Navigation

```typescript
'use client';

import Link from 'next/link';
import { getAnalytics } from '@/lib/analytics';

export function DashboardNav() {
  const trackNavigation = (destination: string) => {
    const analytics = getAnalytics();

    analytics.custom('navigation', {
      category: 'engagement',
      label: destination,
      source: 'dashboard_nav',
    });
  };

  return (
    <nav>
      <Link href="/farms" onClick={() => trackNavigation('farms')}>
        My Farms
      </Link>
      <Link href="/crops" onClick={() => trackNavigation('crops')}>
        Crops
      </Link>
      <Link href="/ai-assistant" onClick={() => trackNavigation('ai_assistant')}>
        AI Assistant
      </Link>
      <Link href="/analytics" onClick={() => trackNavigation('analytics')}>
        Analytics
      </Link>
    </nav>
  );
}
```

## Example 7: Feature Flag Tracking

### Feature Usage Tracking

```typescript
'use client';

import { useEffect } from 'react';
import { getAnalytics } from '@/lib/analytics';

export function WeatherWidget() {
  useEffect(() => {
    // Track when feature is viewed
    const analytics = getAnalytics();

    analytics.custom('feature_viewed', {
      category: 'features',
      label: 'weather_widget',
      value: 1,
    });
  }, []);

  const refreshWeather = () => {
    const analytics = getAnalytics();

    // Track feature interaction
    analytics.custom('feature_interaction', {
      category: 'features',
      label: 'weather_refresh',
      action: 'click',
    });

    // Refresh weather data...
  };

  return (
    <div>
      {/* Weather widget UI */}
      <button onClick={refreshWeather}>Refresh</button>
    </div>
  );
}
```

## Example 8: Error Tracking

### Error Boundary with Analytics

```typescript
'use client';

import React from 'react';
import { getAnalytics } from '@/lib/analytics';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const analytics = getAnalytics();

    // Track error
    analytics.custom('app_error', {
      category: 'errors',
      label: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Best Practices

1. **Track user intent, not just clicks**: Track meaningful actions that show user engagement
2. **Add context**: Include relevant metadata (cropType, farmSize, etc.) to make analytics actionable
3. **Don't over-track**: Focus on key user journeys and business metrics
4. **Respect privacy**: Never track sensitive information like passwords or personal data
5. **Use consistent naming**: Use snake_case for event names and keep them descriptive
6. **Group related events**: Use the category field to organize events logically
7. **Track errors gracefully**: Log errors without disrupting user experience
8. **Test in development**: Use debug mode to verify tracking before deploying

## Common Patterns

### Track Form Submissions
```typescript
analytics.custom('form_submitted', {
  category: 'forms',
  label: formName,
  success: true,
});
```

### Track Button Clicks
```typescript
analytics.custom('button_clicked', {
  category: 'engagement',
  label: buttonName,
  location: componentName,
});
```

### Track Feature Discovery
```typescript
analytics.custom('feature_discovered', {
  category: 'engagement',
  label: featureName,
  firstTime: isFirstTime,
});
```

### Track Performance Metrics
```typescript
analytics.custom('performance_metric', {
  category: 'performance',
  label: 'page_load',
  value: loadTime,
});
```

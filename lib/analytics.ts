import type {
  AnalyticsConfig,
  AnalyticsEvent,
  PageViewEvent,
  AuthEvent,
  FarmEvent,
  CropEvent,
  CustomEvent,
} from '@/types/analytics';

/**
 * Analytics Wrapper Class
 * Provides methods for tracking various events in the FructoSahel app
 * All tracking is non-blocking and fails silently
 */
class Analytics {
  private config: AnalyticsConfig;
  private sessionId: string;
  private queue: AnalyticsEvent[] = [];
  private isProcessing = false;

  constructor() {
    // Initialize configuration from environment variables
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY || '',
      endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '',
      enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
      debug: process.env.NODE_ENV === 'development',
    };

    // Generate a session ID
    this.sessionId = this.generateSessionId();

    if (this.config.debug) {
      console.log('[Analytics] Initialized with config:', {
        enabled: this.config.enabled,
        endpoint: this.config.endpoint,
        sessionId: this.sessionId,
      });
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      // Check for existing session ID in sessionStorage
      const existing = sessionStorage.getItem('analytics_session_id');
      if (existing) return existing;

      // Generate new session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
      return sessionId;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get current user ID (if available)
   */
  private getUserId(): string | undefined {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('analytics_user_id') || undefined;
    }
    return undefined;
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string | null): void {
    if (typeof window !== 'undefined') {
      if (userId) {
        localStorage.setItem('analytics_user_id', userId);
      } else {
        localStorage.removeItem('analytics_user_id');
      }
    }
  }

  /**
   * Get current locale from URL
   */
  private getLocale(): string | undefined {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const locale = pathParts[1];
      return ['en', 'fr'].includes(locale) ? locale : undefined;
    }
    return undefined;
  }

  /**
   * Internal method to track events
   */
  private async track(event: AnalyticsEvent): Promise<void> {
    // Don't track if analytics is disabled
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('[Analytics] Tracking disabled, event not sent:', event);
      }
      return;
    }

    // Enrich event with base properties
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.getUserId(),
      locale: event.locale || this.getLocale(),
    };

    if (this.config.debug) {
      console.log('[Analytics] Tracking event:', enrichedEvent);
    }

    // Add to queue and process
    this.queue.push(enrichedEvent);
    this.processQueue();
  }

  /**
   * Process the event queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (!event) continue;

      try {
        // Send to our API route which proxies to the analytics endpoint
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
          // Use keepalive to ensure tracking completes even if user navigates away
          keepalive: true,
        });

        if (!response.ok && this.config.debug) {
          console.warn('[Analytics] Failed to track event:', await response.text());
        }
      } catch (error) {
        // Fail silently - don't disrupt user experience
        if (this.config.debug) {
          console.error('[Analytics] Error tracking event:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Track a page view
   */
  pageView(path: string, title?: string): void {
    const event: PageViewEvent = {
      path,
      title: title || (typeof document !== 'undefined' ? document.title : undefined),
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    };

    this.track(event);
  }

  /**
   * Track an authentication action
   */
  authAction(
    action: AuthEvent['action'],
    options?: {
      method?: AuthEvent['method'];
      success?: boolean;
      errorMessage?: string;
    }
  ): void {
    const event: AuthEvent = {
      action,
      method: options?.method || 'email',
      success: options?.success ?? true,
      errorMessage: options?.errorMessage,
    };

    this.track(event);
  }

  /**
   * Track a farm management action
   */
  farmAction(
    action: FarmEvent['action'],
    options?: {
      farmId?: string;
      farmSize?: number;
      location?: string;
      cropTypes?: string[];
    }
  ): void {
    const event: FarmEvent = {
      action,
      ...options,
    };

    this.track(event);
  }

  /**
   * Track a crop management action
   */
  cropAction(
    action: CropEvent['action'],
    options?: {
      cropId?: string;
      cropType?: CropEvent['cropType'];
      plantingDate?: string;
      expectedHarvestDate?: string;
      healthStatus?: CropEvent['healthStatus'];
      quantity?: number;
    }
  ): void {
    const event: CropEvent = {
      action,
      ...options,
    };

    this.track(event);
  }

  /**
   * Track a custom event
   */
  custom(
    eventName: string,
    properties?: {
      category?: string;
      label?: string;
      value?: number;
      [key: string]: unknown;
    }
  ): void {
    const event: CustomEvent = {
      eventName,
      ...properties,
    };

    this.track(event);
  }

  /**
   * Flush the event queue immediately
   * Useful before page unload
   */
  flush(): void {
    this.processQueue();
  }
}

// Export a singleton instance
let analyticsInstance: Analytics | null = null;

export function getAnalytics(): Analytics {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics();
  }
  return analyticsInstance;
}

// Export the class for testing
export { Analytics };

// Default export is the singleton instance getter
export default getAnalytics;

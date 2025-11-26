/**
 * Analytics Event Types for FructoSahel
 * Defines all trackable events and their properties
 */

// Base event properties that all events should include
export interface BaseEventProperties {
  locale?: string;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

// Page view event
export interface PageViewEvent extends BaseEventProperties {
  path: string;
  title?: string;
  referrer?: string;
}

// Authentication events
export type AuthEventType =
  | 'signup'
  | 'login'
  | 'logout'
  | 'password_reset'
  | 'email_verification';

export interface AuthEvent extends BaseEventProperties {
  action: AuthEventType;
  method?: 'email' | 'google' | 'facebook' | 'other';
  success: boolean;
  errorMessage?: string;
}

// Farm management events
export type FarmEventType =
  | 'farm_created'
  | 'farm_updated'
  | 'farm_deleted'
  | 'farm_viewed';

export interface FarmEvent extends BaseEventProperties {
  action: FarmEventType;
  farmId?: string;
  farmSize?: number;
  location?: string;
  cropTypes?: string[];
}

// Crop management events
export type CropEventType =
  | 'crop_added'
  | 'crop_updated'
  | 'crop_removed'
  | 'crop_harvested'
  | 'crop_health_checked';

export interface CropEvent extends BaseEventProperties {
  action: CropEventType;
  cropId?: string;
  cropType?: 'pineapple' | 'cashew' | 'mango' | 'avocado' | 'banana' | 'papaya';
  plantingDate?: string;
  expectedHarvestDate?: string;
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  quantity?: number;
}

// AI Agent events
export type AIEventType =
  | 'ai_query_submitted'
  | 'ai_response_received'
  | 'ai_suggestion_accepted'
  | 'ai_suggestion_rejected';

export interface AIEvent extends BaseEventProperties {
  action: AIEventType;
  queryType?: string;
  responseTime?: number;
  success: boolean;
}

// Custom event (for any ad-hoc tracking)
export interface CustomEvent extends BaseEventProperties {
  eventName: string;
  category?: string;
  label?: string;
  value?: number;
}

// Union type of all events
export type AnalyticsEvent =
  | PageViewEvent
  | AuthEvent
  | FarmEvent
  | CropEvent
  | AIEvent
  | CustomEvent;

// Analytics configuration
export interface AnalyticsConfig {
  apiKey: string;
  endpoint: string;
  enabled: boolean;
  debug?: boolean;
  userId?: string;
  sessionId?: string;
}

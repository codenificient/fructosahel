-- Migration: Add push notification tables
-- Phase 10.8: Push Notifications for FructoSahel

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    task_reminders BOOLEAN DEFAULT TRUE NOT NULL,
    urgent_alerts BOOLEAN DEFAULT TRUE NOT NULL,
    daily_digest BOOLEAN DEFAULT FALSE NOT NULL,
    new_task_assigned BOOLEAN DEFAULT TRUE NOT NULL,
    task_overdue BOOLEAN DEFAULT TRUE NOT NULL,
    reminder_hours_before INTEGER DEFAULT 24 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Add comments for documentation
COMMENT ON TABLE push_subscriptions IS 'Stores Web Push notification subscription data for each user device';
COMMENT ON TABLE notification_preferences IS 'User preferences for different notification types';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'The push service endpoint URL';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Public key for push encryption (VAPID)';
COMMENT ON COLUMN push_subscriptions.auth IS 'Auth secret for push encryption';
COMMENT ON COLUMN notification_preferences.reminder_hours_before IS 'How many hours before a task due date to send a reminder (1-168)';

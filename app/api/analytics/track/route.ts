import { NextRequest, NextResponse } from 'next/server';
import type { AnalyticsEvent } from '@/types/analytics';

/**
 * API Route: POST /api/analytics/track
 * Proxies analytics events to the analytics endpoint
 * This keeps the API key secure on the server side
 */
export async function POST(request: NextRequest) {
  try {
    // Check if analytics is enabled
    const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
    if (!enabled) {
      return NextResponse.json(
        { success: false, message: 'Analytics is disabled' },
        { status: 200 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_ANALYTICS_API_KEY;
    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

    if (!apiKey || !endpoint) {
      console.error('Analytics configuration missing');
      return NextResponse.json(
        { success: false, message: 'Analytics not configured' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const event: AnalyticsEvent = body;

    // Add server-side metadata
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    };

    // Forward to analytics endpoint
    const response = await fetch(`${endpoint}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(enrichedEvent),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Analytics endpoint error:', errorText);
      // Return success anyway to not block the user
      return NextResponse.json(
        { success: false, message: 'Analytics tracking failed' },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Always return 200 to not block the user experience
    return NextResponse.json(
      { success: false, message: 'Internal error' },
      { status: 200 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

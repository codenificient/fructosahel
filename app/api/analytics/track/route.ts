import type {
  AnalyticsResponse,
  EventData,
} from "@codenificient/analytics-sdk";
import { NextRequest, NextResponse } from "next/server";

const ANALYTICS_ENDPOINT =
  process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT ||
  "https://analytics-dashboard-phi-six.vercel.app/api";
const API_KEY =
  process.env.NEXT_PUBLIC_ANALYTICS_API_KEY || "proj_fructosahel_key";

interface AnalyticsRequestPayload {
  events?: EventData[];
  namespace?: string;
  eventType?: string;
  properties?: Record<string, unknown>;
  page?: string;
  element?: string;
  slug?: string;
  action?: string;
  // Legacy event properties
  path?: string;
  title?: string;
  referrer?: string;
  farmId?: string;
  cropId?: string;
}

interface AnalyticsApiPayload {
  apiKey: string;
  events: EventData[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsRequestPayload = await request.json();
    const {
      events,
      namespace,
      eventType,
      properties,
      page,
      element,
      slug,
      action: eventAction,
    } = body;
    const pagePath = body.path; // Use body.path directly to avoid variable shadowing

    // Validate required fields
    if (
      !events &&
      !namespace &&
      !eventType &&
      !page &&
      !element &&
      !slug &&
      !pagePath
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Prepare the analytics payload
    const analyticsPayload: AnalyticsApiPayload = {
      apiKey: API_KEY,
      events: [],
    };

    // Handle different types of analytics events
    if (events) {
      // Batch events
      analyticsPayload.events = events;
    } else if (namespace && eventType) {
      // Single event with namespace/eventType format
      const eventData: EventData = {
        namespace,
        eventType,
        properties: properties || {},
      };
      analyticsPayload.events = [eventData];
    } else if (pagePath) {
      // Legacy page view format (from existing analytics.ts)
      const eventData: EventData = {
        namespace: "pageview",
        eventType: "view",
        properties: {
          page: pagePath,
          title: body.title,
          referrer: body.referrer,
          ...properties,
        },
      };
      analyticsPayload.events = [eventData];
    } else if (page) {
      // Page view
      const eventData: EventData = {
        namespace: "pageview",
        eventType: "view",
        properties: {
          page,
          ...properties,
        },
      };
      analyticsPayload.events = [eventData];
    } else if (element) {
      // Click event
      const eventData: EventData = {
        namespace: "interaction",
        eventType: "click",
        properties: {
          element,
          ...properties,
        },
      };
      analyticsPayload.events = [eventData];
    } else if (body.farmId) {
      // Farm event
      const eventData: EventData = {
        namespace: "farm",
        eventType: eventAction || "action",
        properties: {
          farmId: body.farmId,
          ...properties,
        },
      };
      analyticsPayload.events = [eventData];
    } else if (body.cropId) {
      // Crop event
      const eventData: EventData = {
        namespace: "crop",
        eventType: eventAction || "action",
        properties: {
          cropId: body.cropId,
          ...properties,
        },
      };
      analyticsPayload.events = [eventData];
    }

    // Add headers to make request look legitimate
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "User-Agent": "FructoSahel/1.0 (+https://fructosahel.vercel.app)",
      Accept: "application/json",
      "X-Forwarded-For":
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "127.0.0.1",
      "X-Forwarded-Proto": request.headers.get("x-forwarded-proto") || "https",
      "X-Forwarded-Host": request.headers.get("host") || "localhost:3000",
    };

    // Determine endpoint path
    let endpointPath = "/events";
    if (body.action === "getAnalytics") {
      endpointPath = "/analytics";
    }

    // Forward to analytics service
    const response = await fetch(`${ANALYTICS_ENDPOINT}${endpointPath}`, {
      method: "POST",
      headers,
      body: JSON.stringify(analyticsPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Analytics API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      return NextResponse.json(
        {
          error: "Analytics request failed",
          details: errorText,
          status: response.status,
        },
        { status: response.status },
      );
    }

    const data: AnalyticsResponse = await response.json();

    // Log success in development
    if (process.env.NODE_ENV === "development") {
      console.log("✅ [Analytics API] Request successful:", {
        events: analyticsPayload.events?.length || 1,
        endpoint: `${ANALYTICS_ENDPOINT}${endpointPath}`,
        success: data.success,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Optional: GET endpoint for fetching analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("apiKey") || API_KEY;

    const queryParams = new URLSearchParams();
    queryParams.append("apiKey", apiKey);

    searchParams.forEach((value, key) => {
      if (key !== "apiKey") {
        queryParams.append(key, value);
      }
    });

    const headers: HeadersInit = {
      "User-Agent": "FructoSahel/1.0 (+https://fructosahel.vercel.app)",
      Accept: "application/json",
      "X-Forwarded-For":
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "127.0.0.1",
      "X-Forwarded-Proto": request.headers.get("x-forwarded-proto") || "https",
      "X-Forwarded-Host": request.headers.get("host") || "localhost:3000",
    };

    const response = await fetch(
      `${ANALYTICS_ENDPOINT}/analytics?${queryParams.toString()}`,
      { method: "GET", headers },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Analytics GET error:", {
        status: response.status,
        error: errorText,
      });

      return NextResponse.json(
        {
          error: "Analytics request failed",
          details: errorText,
          status: response.status,
        },
        { status: response.status },
      );
    }

    const data: unknown = await response.json();

    if (process.env.NODE_ENV === "development") {
      console.log("✅ [Analytics API] GET request successful");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics GET API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}

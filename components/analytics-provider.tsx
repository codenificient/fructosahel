'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getAnalytics } from '@/lib/analytics';

/**
 * Analytics Provider Component
 * Automatically tracks page views on route changes
 * Works with next-intl locale routing
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on mount and when pathname changes
    const analytics = getAnalytics();

    // Get the page title
    const title = typeof document !== 'undefined' ? document.title : undefined;

    // Track the page view
    analytics.pageView(pathname, title);
  }, [pathname]);

  useEffect(() => {
    // Flush analytics queue before page unload
    const analytics = getAnalytics();

    const handleBeforeUnload = () => {
      analytics.flush();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // This is a passive provider - it doesn't render anything except children
  return <>{children}</>;
}

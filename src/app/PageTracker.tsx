import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/shared/lib/analytics';

/** Names used for each address in Google Analytics (fixed words, never taken from what the user typed). */
const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/app': 'Workspace',
  '/themes': 'Themes',
  '/analytics': 'Analytics',
  '/tracking': 'Tracking',
  '/about': 'About',
};

/** Sends a page view to Google Analytics each time the address changes. Renders nothing. */
export function PageTracker(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    trackPageView(pathname, PAGE_NAMES[pathname] ?? 'Other');
  }, [pathname]);

  return null;
}

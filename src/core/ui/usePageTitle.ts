import { useEffect } from 'react';

const APP_NAME = 'FocusFlow';

/** Sets the browser tab title for the current page ("Tasks · FocusFlow"); the home page passes no title. */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}

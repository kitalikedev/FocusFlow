import { useEffect } from 'react';

const APP_NAME = 'FocusFlow';

/**
 * Sets the browser tab title for the current page ("Tasks · FocusFlow"); no title gives just "FocusFlow".
 * Pass `enabled = false` from a view that stays mounted while hidden so it does not overwrite the visible page.
 */
export function usePageTitle(title?: string, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title, enabled]);
}

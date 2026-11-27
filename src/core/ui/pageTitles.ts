export const APP_NAME = 'FocusFlow';

/** Page names by first path segment, as the pages pass them to `PageShell`; the home page has none. */
const PAGE_NAMES: Record<string, string | undefined> = {
  themes: 'Themes',
  analytics: 'Focus Analytics',
  tracking: 'Tracking',
  about: 'About FocusFlow',
  app: 'Workspace',
};

/** Tab title for a page name ("Tracking" gives "Tracking · FocusFlow"); no name gives just "FocusFlow". */
export function formatPageTitle(pageName?: string): string {
  if (!pageName) return APP_NAME;
  return pageName.includes(APP_NAME) ? pageName : `${pageName} · ${APP_NAME}`;
}

/**
 * Tab title for a URL path, so the server can send the right `<title>` when the page is opened directly or reloaded.
 * `segments` are the path parts after the domain (`/themes` is `['themes']`); unknown paths get the plain app name.
 */
export function titleForPath(segments: readonly string[] | undefined): string {
  const first = segments?.[0] ?? '';
  return formatPageTitle(PAGE_NAMES[first]);
}

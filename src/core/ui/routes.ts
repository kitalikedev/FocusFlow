/** Address of the focus workspace (timer, sounds, docks); every other address is a page of the website. */
export const APP_PATH = '/app';

/** Whether the browser is currently showing the focus workspace. */
export function isOnAppPage(pathname: string = window.location.pathname): boolean {
  return pathname.replace(/\/+$/, '') === APP_PATH;
}

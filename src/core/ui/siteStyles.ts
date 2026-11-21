/** Shared Tailwind classes of the website pages. Colors come from the `site-*` tokens (light and dark). */

export const SITE_FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent';

const BUTTON_BASE = `inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-[18px] text-[15px] font-semibold transition-colors duration-150 ${SITE_FOCUS}`;

/** Main action: text-colored block that turns to the accent on hover. */
export const SITE_BUTTON_PRIMARY = `${BUTTON_BASE} bg-site-text text-site-bg hover:bg-site-accent hover:text-site-on-accent`;

/** Secondary action: outlined. */
export const SITE_BUTTON_LINE = `${BUTTON_BASE} border border-site-line text-site-text hover:border-site-text`;

/** Width and side padding of every website section. */
export const SITE_CONTAINER = 'mx-auto w-full max-w-[1160px]';

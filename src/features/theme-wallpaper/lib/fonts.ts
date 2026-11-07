/** Six self-hosted clock fonts (FR-25, AC-25.4): one WOFF2 file each, loaded only when first used. */

export interface FontOption {
  id: string;
  label: string;
  family: string;
  file: string;
  /** Value stored in the `fontClock` token. */
  stack: string;
}

function option(id: string, label: string, fallback: string): FontOption {
  return { id, label, family: label, file: `/fonts/${id}.woff2`, stack: `'${label}', ${fallback}` };
}

export const FONT_OPTIONS: FontOption[] = [
  option('inter', 'Inter', "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"),
  option('space-mono', 'Space Mono', 'ui-monospace, monospace'),
  option('jetbrains-mono', 'JetBrains Mono', 'ui-monospace, monospace'),
  option('outfit', 'Outfit', 'system-ui, sans-serif'),
  option('playfair-display', 'Playfair Display', 'Georgia, serif'),
  option('silkscreen', 'Silkscreen', 'ui-monospace, monospace'),
];

/** Finds the font option a `fontClock` stack starts with (quotes optional). */
export function fontFromStack(stack: string): FontOption | undefined {
  const first = stack.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '').toLowerCase();
  return FONT_OPTIONS.find((font) => font.family.toLowerCase() === first);
}

const loaded = new Map<string, Promise<void>>();

/** Registers and downloads one font file through the FontFace API; never contacts a font CDN. */
export function loadFont(font: FontOption): Promise<void> {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined' || !document.fonts) {
    return Promise.resolve();
  }
  let pending = loaded.get(font.id);
  if (!pending) {
    const face = new FontFace(font.family, `url(${font.file}) format('woff2')`, {
      weight: '300 700',
      display: 'swap',
    });
    pending = face
      .load()
      .then((ready) => {
        document.fonts.add(ready);
      })
      .catch(() => {
        loaded.delete(font.id);
      });
    loaded.set(font.id, pending);
  }
  return pending;
}

export function ensureFontForStack(stack: string): Promise<void> {
  const font = fontFromStack(stack);
  return font ? loadFont(font) : Promise.resolve();
}

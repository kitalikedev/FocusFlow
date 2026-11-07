/** YouTube helpers (FR-17): URL parsing, title lookup through noembed and lazy IFrame API loading. */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be']);
const TITLE_TIMEOUT_MS = 5000;

/** Returns the 11-character video id of a YouTube link, or null when the link is not a YouTube video. */
export function parseYouTubeId(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

  let id: string | null = null;
  if (url.hostname === 'youtu.be') {
    id = url.pathname.slice(1).split('/')[0];
  } else if (url.pathname === '/watch') {
    id = url.searchParams.get('v');
  } else {
    const match = /^\/(?:embed|shorts|live)\/([^/?#]+)/.exec(url.pathname);
    id = match ? match[1] : null;
  }
  return id && VIDEO_ID.test(id) ? id : null;
}

export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** AC-17.1: real title from noembed; falls back to a neutral label when the lookup fails or times out. */
export async function fetchVideoTitle(videoId: string, fetcher: typeof fetch = fetch): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TITLE_TIMEOUT_MS);
  try {
    const response = await fetcher(`https://noembed.com/embed?url=${encodeURIComponent(watchUrl(videoId))}`, {
      signal: controller.signal,
    });
    if (!response.ok) return 'YouTube video';
    const data = (await response.json()) as { title?: unknown };
    return typeof data.title === 'string' && data.title.trim() ? data.title.trim().slice(0, 200) : 'YouTube video';
  } catch {
    return 'YouTube video';
  } finally {
    clearTimeout(timer);
  }
}

// --- Minimal typing of the IFrame API surface we use -------------------------------------------------

export interface YouTubePlayer {
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  setVolume(volume: number): void;
  destroy(): void;
}

export interface YouTubeNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      width: number;
      height: number;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: () => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number };
}

type YouTubeWindow = Window & { YT?: YouTubeNamespace; onYouTubeIframeAPIReady?: () => void };

let apiPromise: Promise<YouTubeNamespace> | null = null;

/** Injects https://www.youtube.com/iframe_api once (allowed by the CSP) and resolves with `window.YT`. */
export function loadYouTubeApi(): Promise<YouTubeNamespace> {
  const win = window as YouTubeWindow;
  if (win.YT?.Player) return Promise.resolve(win.YT);
  apiPromise ??= new Promise<YouTubeNamespace>((resolve, reject) => {
    const previous = win.onYouTubeIframeAPIReady;
    win.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (win.YT) resolve(win.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error('YouTube player could not be loaded'));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

import type { NextConfig } from 'next';

// Public settings are read as NEXT_PUBLIC_*. The old VITE_* names are still accepted, so existing
// Vercel and local .env settings keep working without changes.
const pick = (name: string): string =>
  process.env[`NEXT_PUBLIC_${name}`] ?? process.env[`VITE_${name}`] ?? '';

// Next.js puts small inline scripts into every page to start the app, so script-src needs 'unsafe-inline'
// (the Next.js guide for a policy without nonces). Everything else is the same policy as before.
// `next dev` also needs 'unsafe-eval' for hot reload; production builds do not get it.
const DEV_ONLY = process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'";

const CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self' 'unsafe-inline'" +
  DEV_ONLY +
  " https://www.youtube.com https://s.ytimg.com https://www.googletagmanager.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self' https://*.supabase.co https://noembed.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.sentry.io; img-src 'self' data: blob: https://*.supabase.co https://i.ytimg.com https://*.google-analytics.com https://*.googletagmanager.com; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; worker-src 'self' blob:;";

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: pick('SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: pick('SUPABASE_PUBLISHABLE_KEY'),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: pick('GA_MEASUREMENT_ID'),
    NEXT_PUBLIC_SENTRY_DSN: pick('SENTRY_DSN'),
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;

/// <reference types="next" />

// Public settings inlined at build time by Next.js (see next.config.ts and .env.example).
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_SUPABASE_URL?: string;
    readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    /** Google Analytics 4 Measurement ID (G-XXXXXXXXXX); analytics stays off when empty. */
    readonly NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
    /** Sentry DSN; error logging stays off when empty. */
    readonly NEXT_PUBLIC_SENTRY_DSN?: string;
  }
}

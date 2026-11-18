/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Google Analytics 4 Measurement ID (G-XXXXXXXXXX); analytics stays off when empty. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
  /** Sentry DSN; error logging stays off when empty. */
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

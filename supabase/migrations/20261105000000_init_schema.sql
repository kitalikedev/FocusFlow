-- =============================================================================
-- Migration: 20261105000000_init_schema.sql
-- Description: Complete schema initialization for FocusFlow (PostgreSQL / Supabase)
-- Author: Database Architect
-- References: PRD v1.2.1 (FR-01, 02, 04, 05, 06, 09, 14, 15, 16, 19, 20, 21, 23, 24, 25, 27, 29, 30)
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS & HELPER FUNCTIONS
-- -----------------------------------------------------------------------------

-- Function to validate labels array on tasks (max 5 labels, each 1-24 chars, no empty)
CREATE OR REPLACE FUNCTION public.validate_task_labels(labels text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT
    CASE
      WHEN labels IS NULL THEN true
      WHEN pg_catalog.cardinality(labels) > 5 THEN false
      WHEN EXISTS (
        SELECT 1
        FROM pg_catalog.unnest(labels) AS l
        WHERE pg_catalog.char_length(pg_catalog.btrim(l)) = 0 OR pg_catalog.char_length(l) > 24
      ) THEN false
      ELSE true
    END;
$$;

-- -----------------------------------------------------------------------------
-- 2. TABLES DEFINITIONS
-- -----------------------------------------------------------------------------

-- 2.1 Table: user_settings (1 row per user)
-- References: FR-01, FR-02, FR-04, FR-05, FR-09, FR-10, FR-11, FR-12, FR-16, FR-24, FR-25
CREATE TABLE IF NOT EXISTS public.user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    focus_duration integer NOT NULL DEFAULT 1500 CHECK (focus_duration BETWEEN 60 AND 10800),
    short_break_duration integer NOT NULL DEFAULT 300 CHECK (short_break_duration BETWEEN 60 AND 10800),
    long_break_duration integer NOT NULL DEFAULT 900 CHECK (long_break_duration BETWEEN 60 AND 10800),
    long_break_interval integer NOT NULL DEFAULT 4 CHECK (long_break_interval BETWEEN 1 AND 24),
    auto_start_breaks boolean NOT NULL DEFAULT false,
    auto_start_focus boolean NOT NULL DEFAULT false,
    clock_visual_mode text NOT NULL DEFAULT 'minimal' CHECK (clock_visual_mode IN ('minimal', 'circular_ring', 'retro_flip')),
    clock_position text NOT NULL DEFAULT 'center' CHECK (clock_position IN ('center', 'mini_corner', 'zen')),
    active_wallpaper_id text NOT NULL DEFAULT 'preset-lofi-cafe',
    volume_rain numeric(3,2) NOT NULL DEFAULT 0.50 CHECK (volume_rain BETWEEN 0.00 AND 1.00),
    volume_brown_noise numeric(3,2) NOT NULL DEFAULT 0.00 CHECK (volume_brown_noise BETWEEN 0.00 AND 1.00),
    volume_campfire numeric(3,2) NOT NULL DEFAULT 0.00 CHECK (volume_campfire BETWEEN 0.00 AND 1.00),
    volume_master numeric(3,2) NOT NULL DEFAULT 0.80 CHECK (volume_master BETWEEN 0.00 AND 1.00),
    is_migrated boolean NOT NULL DEFAULT false,
    active_theme jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (octet_length(active_theme::text) <= 8192),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_settings_user_id UNIQUE (user_id)
);

-- 2.2 Table: tasks (Task Manager)
-- References: FR-19 (Core CRUD & Advanced: Priority, Due Date, Labels)
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 120),
    is_completed boolean NOT NULL DEFAULT false,
    priority text NOT NULL DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high')),
    due_date timestamptz,
    labels text[] NOT NULL DEFAULT '{}'::text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_tasks_labels CHECK (public.validate_task_labels(labels))
);

-- 2.3 Table: notes (Auto-saving Scratchpad, 1 row per user)
-- References: FR-20
CREATE TABLE IF NOT EXISTS public.notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL DEFAULT '' CHECK (char_length(content) <= 50000),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_notes_user_id UNIQUE (user_id)
);

-- 2.4 Table: focus_sessions (Analytics & History)
-- References: FR-06, FR-21, FR-29
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration_minutes integer NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
    intent_title text CHECK (intent_title IS NULL OR (char_length(trim(intent_title)) > 0 AND char_length(intent_title) <= 80)),
    task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
    completed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.5 Table: user_wallpapers (Custom Wallpapers uploaded to Supabase Storage)
-- References: FR-14, FR-15
CREATE TABLE IF NOT EXISTS public.user_wallpapers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path text NOT NULL CHECK (char_length(trim(storage_path)) > 0 AND storage_path LIKE user_id::text || '/%'),
    file_size integer NOT NULL CHECK (file_size > 0 AND file_size <= 5242880),
    luminance numeric(4,3) NOT NULL CHECK (luminance >= 0.000 AND luminance <= 1.000),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.6 Table: saved_themes (Custom Saved Themes)
-- References: FR-24, FR-25, FR-27
CREATE TABLE IF NOT EXISTS public.saved_themes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 50),
    config jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (octet_length(config::text) <= 8192),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tasks_user_status_due ON public.tasks (user_id, is_completed, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_labels_gin ON public.tasks USING gin (labels);
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON public.tasks (user_id, priority);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_completed ON public.focus_sessions (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_task ON public.focus_sessions (user_id, task_id);

CREATE INDEX IF NOT EXISTS idx_user_wallpapers_user ON public.user_wallpapers (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_themes_user ON public.saved_themes (user_id);

-- -----------------------------------------------------------------------------
-- 4. TRIGGERS & BUSINESS LOGIC
-- -----------------------------------------------------------------------------

-- 4.1 Last-Write-Wins (LWW) Update Handler (FR-23)
-- Suppresses older client updates (returns OLD) and protects updated_at integrity
CREATE OR REPLACE FUNCTION public.handle_last_write_wins()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    -- If incoming updated_at is older than the current record, discard the update
    IF NEW.updated_at < OLD.updated_at THEN
        RETURN OLD;
    END IF;

    -- If updated_at is identical to old (not explicitly set by client), advance it
    IF NEW.updated_at = OLD.updated_at THEN
        NEW.updated_at := pg_catalog.clock_timestamp();
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_settings_lww ON public.user_settings;
CREATE TRIGGER trg_user_settings_lww
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_last_write_wins();

DROP TRIGGER IF EXISTS trg_tasks_lww ON public.tasks;
CREATE TRIGGER trg_tasks_lww
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.handle_last_write_wins();

DROP TRIGGER IF EXISTS trg_notes_lww ON public.notes;
CREATE TRIGGER trg_notes_lww
BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION public.handle_last_write_wins();

DROP TRIGGER IF EXISTS trg_focus_sessions_lww ON public.focus_sessions;
CREATE TRIGGER trg_focus_sessions_lww
BEFORE UPDATE ON public.focus_sessions
FOR EACH ROW EXECUTE FUNCTION public.handle_last_write_wins();

DROP TRIGGER IF EXISTS trg_user_wallpapers_lww ON public.user_wallpapers;
CREATE TRIGGER trg_user_wallpapers_lww
BEFORE UPDATE ON public.user_wallpapers
FOR EACH ROW EXECUTE FUNCTION public.handle_last_write_wins();

DROP TRIGGER IF EXISTS trg_saved_themes_lww ON public.saved_themes;
CREATE TRIGGER trg_saved_themes_lww
BEFORE UPDATE ON public.saved_themes
FOR EACH ROW EXECUTE FUNCTION public.handle_last_write_wins();

-- 4.2 Enforce Maximum 100 Tasks per User (FR-19)
CREATE OR REPLACE FUNCTION public.enforce_tasks_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF (SELECT pg_catalog.count(*) FROM public.tasks WHERE user_id = NEW.user_id) >= 100 THEN
        RAISE EXCEPTION 'TASK_LIMIT_EXCEEDED: Maximum 100 tasks allowed per user.'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_tasks_limit ON public.tasks;
CREATE TRIGGER trg_enforce_tasks_limit
BEFORE INSERT ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.enforce_tasks_limit();

-- 4.3 Enforce Maximum 10 Saved Themes per User (FR-27)
CREATE OR REPLACE FUNCTION public.enforce_saved_themes_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF (SELECT pg_catalog.count(*) FROM public.saved_themes WHERE user_id = NEW.user_id) >= 10 THEN
        RAISE EXCEPTION 'SAVED_THEME_LIMIT_EXCEEDED: Maximum 10 saved themes allowed per user.'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_saved_themes_limit ON public.saved_themes;
CREATE TRIGGER trg_enforce_saved_themes_limit
BEFORE INSERT ON public.saved_themes
FOR EACH ROW EXECUTE FUNCTION public.enforce_saved_themes_limit();

-- 4.4 Enforce Maximum 3 Custom Wallpapers per User (FR-14)
CREATE OR REPLACE FUNCTION public.enforce_user_wallpapers_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF (SELECT pg_catalog.count(*) FROM public.user_wallpapers WHERE user_id = NEW.user_id) >= 3 THEN
        RAISE EXCEPTION 'WALLPAPER_LIMIT_EXCEEDED: Maximum 3 custom wallpapers allowed per user.'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_user_wallpapers_limit ON public.user_wallpapers;
CREATE TRIGGER trg_enforce_user_wallpapers_limit
BEFORE INSERT ON public.user_wallpapers
FOR EACH ROW EXECUTE FUNCTION public.enforce_user_wallpapers_limit();

-- 4.5 Supabase Keep-Alive Healthcheck Function (NFR-5.4)
CREATE OR REPLACE FUNCTION public.ping()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT 1;
$$;

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_themes ENABLE ROW LEVEL SECURITY;

-- 5.1 user_settings policies
DROP POLICY IF EXISTS "Users can read own settings" ON public.user_settings;
CREATE POLICY "Users can read own settings"
ON public.user_settings FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings"
ON public.user_settings FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings"
ON public.user_settings FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own settings" ON public.user_settings;
CREATE POLICY "Users can delete own settings"
ON public.user_settings FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 5.2 tasks policies
DROP POLICY IF EXISTS "Users can read own tasks" ON public.tasks;
CREATE POLICY "Users can read own tasks"
ON public.tasks FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
ON public.tasks FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 5.3 notes policies
DROP POLICY IF EXISTS "Users can read own notes" ON public.notes;
CREATE POLICY "Users can read own notes"
ON public.notes FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
CREATE POLICY "Users can insert own notes"
ON public.notes FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes"
ON public.notes FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can delete own notes"
ON public.notes FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 5.4 focus_sessions policies
DROP POLICY IF EXISTS "Users can read own focus sessions" ON public.focus_sessions;
CREATE POLICY "Users can read own focus sessions"
ON public.focus_sessions FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own focus sessions" ON public.focus_sessions;
CREATE POLICY "Users can insert own focus sessions"
ON public.focus_sessions FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own focus sessions" ON public.focus_sessions;
CREATE POLICY "Users can update own focus sessions"
ON public.focus_sessions FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own focus sessions" ON public.focus_sessions;
CREATE POLICY "Users can delete own focus sessions"
ON public.focus_sessions FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 5.5 user_wallpapers policies
DROP POLICY IF EXISTS "Users can read own wallpapers" ON public.user_wallpapers;
CREATE POLICY "Users can read own wallpapers"
ON public.user_wallpapers FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own wallpapers" ON public.user_wallpapers;
CREATE POLICY "Users can insert own wallpapers"
ON public.user_wallpapers FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own wallpapers" ON public.user_wallpapers;
CREATE POLICY "Users can update own wallpapers"
ON public.user_wallpapers FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own wallpapers" ON public.user_wallpapers;
CREATE POLICY "Users can delete own wallpapers"
ON public.user_wallpapers FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 5.6 saved_themes policies
DROP POLICY IF EXISTS "Users can read own saved themes" ON public.saved_themes;
CREATE POLICY "Users can read own saved themes"
ON public.saved_themes FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own saved themes" ON public.saved_themes;
CREATE POLICY "Users can insert own saved themes"
ON public.saved_themes FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own saved themes" ON public.saved_themes;
CREATE POLICY "Users can update own saved themes"
ON public.saved_themes FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own saved themes" ON public.saved_themes;
CREATE POLICY "Users can delete own saved themes"
ON public.saved_themes FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- 6. EXPLICIT GRANTS & PERMISSIONS (Data API Safety)
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Allow executing ping() for healthcheck / cron
GRANT EXECUTE ON FUNCTION public.ping() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_task_labels(text[]) TO authenticated;

-- Revoke all table permissions from anon by default
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Grant selective table access to authenticated users (RLS strictly enforced)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.focus_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_wallpapers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_themes TO authenticated;

-- Configure future table defaults
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- -----------------------------------------------------------------------------
-- 7. STORAGE BUCKET CONFIGURATION & POLICIES
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-wallpapers',
    'user-wallpapers',
    true,
    5242880,
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

-- Storage RLS Policies
DROP POLICY IF EXISTS "Allow public read on user-wallpapers" ON storage.objects;
CREATE POLICY "Allow public read on user-wallpapers"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'user-wallpapers');

DROP POLICY IF EXISTS "Allow authenticated insert to user-wallpapers folder" ON storage.objects;
CREATE POLICY "Allow authenticated insert to user-wallpapers folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'user-wallpapers'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
    AND (
        SELECT count(*)
        FROM storage.objects
        WHERE bucket_id = 'user-wallpapers'
          AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    ) < 3
);

DROP POLICY IF EXISTS "Allow authenticated update to user-wallpapers folder" ON storage.objects;
CREATE POLICY "Allow authenticated update to user-wallpapers folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'user-wallpapers'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'user-wallpapers'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Allow authenticated delete from user-wallpapers folder" ON storage.objects;
CREATE POLICY "Allow authenticated delete from user-wallpapers folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'user-wallpapers'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
);

COMMIT;

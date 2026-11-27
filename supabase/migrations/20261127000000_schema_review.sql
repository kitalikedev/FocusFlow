-- =============================================================================
-- Migration: 20261127000000_schema_review.sql
-- Description: Changes agreed at the team schema review on 26/11/2026 (Issue #63)
--   1. A focus session can only point to a task of the same user (composite FK).
--   2. Descriptions for every table and column (COMMENT ON).
-- Only adds constraints and comments: no data is changed or removed.
-- Needs PostgreSQL 15 or later for ON DELETE SET NULL (task_id).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. SAME-OWNER RULE FOR focus_sessions.task_id
-- -----------------------------------------------------------------------------

-- Stop before changing anything if a session already points to a task of another user.
DO $$
DECLARE
    cross_owner integer;
BEGIN
    SELECT pg_catalog.count(*) INTO cross_owner
    FROM public.focus_sessions fs
    JOIN public.tasks t ON t.id = fs.task_id
    WHERE t.user_id <> fs.user_id;

    IF cross_owner > 0 THEN
        RAISE EXCEPTION 'SCHEMA_REVIEW_ABORTED: % focus session(s) point to a task of another user.', cross_owner;
    END IF;
END;
$$;

-- The composite FK needs (id, user_id) to be unique on tasks; id alone already is.
ALTER TABLE public.tasks
    ADD CONSTRAINT uq_tasks_id_user_id UNIQUE (id, user_id);

-- Replace the single-column FK with one that also checks the owner.
-- ON DELETE SET NULL (task_id) clears only task_id and keeps user_id, so deleting
-- a task still keeps its sessions in the analytics (FR-29).
ALTER TABLE public.focus_sessions
    DROP CONSTRAINT IF EXISTS focus_sessions_task_id_fkey;

ALTER TABLE public.focus_sessions
    ADD CONSTRAINT fk_focus_sessions_task_same_owner
    FOREIGN KEY (task_id, user_id)
    REFERENCES public.tasks (id, user_id)
    ON DELETE SET NULL (task_id);

-- -----------------------------------------------------------------------------
-- 2. DESCRIPTIONS (shown in Supabase Studio and by \d+ in psql)
-- -----------------------------------------------------------------------------

-- 2.1 user_settings
COMMENT ON TABLE public.user_settings IS 'Workspace settings of one user (1 row per user): timer lengths, clock style, sound volumes, current theme and wallpaper.';
COMMENT ON COLUMN public.user_settings.id IS 'Primary key.';
COMMENT ON COLUMN public.user_settings.user_id IS 'Owner (auth.users). Unique: one settings row per user.';
COMMENT ON COLUMN public.user_settings.focus_duration IS 'Focus length in seconds (60-10800, default 1500 = 25 min).';
COMMENT ON COLUMN public.user_settings.short_break_duration IS 'Short break length in seconds (60-10800, default 300).';
COMMENT ON COLUMN public.user_settings.long_break_duration IS 'Long break length in seconds (60-10800, default 900).';
COMMENT ON COLUMN public.user_settings.long_break_interval IS 'Number of focus sessions before a long break (1-24, default 4).';
COMMENT ON COLUMN public.user_settings.auto_start_breaks IS 'Start the break automatically when a focus session ends.';
COMMENT ON COLUMN public.user_settings.auto_start_focus IS 'Start the next focus session automatically when a break ends.';
COMMENT ON COLUMN public.user_settings.clock_visual_mode IS 'Clock style: minimal, circular_ring or retro_flip.';
COMMENT ON COLUMN public.user_settings.clock_position IS 'Clock position: center, mini_corner or zen.';
COMMENT ON COLUMN public.user_settings.active_wallpaper_id IS 'Current wallpaper: a preset id or the storage path of an uploaded picture. No FK on purpose (ERD 12.4).';
COMMENT ON COLUMN public.user_settings.volume_rain IS 'Rain sound volume (0.00-1.00).';
COMMENT ON COLUMN public.user_settings.volume_brown_noise IS 'Brown noise volume (0.00-1.00).';
COMMENT ON COLUMN public.user_settings.volume_campfire IS 'Campfire sound volume (0.00-1.00).';
COMMENT ON COLUMN public.user_settings.volume_master IS 'Master volume (0.00-1.00).';
COMMENT ON COLUMN public.user_settings.is_migrated IS 'True once the guest data saved in the browser has been moved to this account.';
COMMENT ON COLUMN public.user_settings.active_theme IS 'Current theme tokens (colors, clock font, wallpaper) as JSON, max 8 KB.';
COMMENT ON COLUMN public.user_settings.created_at IS 'When the row was created.';
COMMENT ON COLUMN public.user_settings.updated_at IS 'Last change; used by the last-write-wins trigger.';

-- 2.2 tasks
COMMENT ON TABLE public.tasks IS 'Task list of a user (max 100 per user, enforced by trigger).';
COMMENT ON COLUMN public.tasks.id IS 'Primary key.';
COMMENT ON COLUMN public.tasks.user_id IS 'Owner (auth.users).';
COMMENT ON COLUMN public.tasks.title IS 'Task title, 1-120 characters, not blank.';
COMMENT ON COLUMN public.tasks.is_completed IS 'True when the task is done.';
COMMENT ON COLUMN public.tasks.priority IS 'Priority: none, low, medium or high.';
COMMENT ON COLUMN public.tasks.due_date IS 'Optional deadline.';
COMMENT ON COLUMN public.tasks.labels IS 'Up to 5 labels of 1-24 characters each (text[] with a GIN index, ERD 12.6).';
COMMENT ON COLUMN public.tasks.created_at IS 'When the task was created.';
COMMENT ON COLUMN public.tasks.updated_at IS 'Last change; used by the last-write-wins trigger.';

-- 2.3 notes
COMMENT ON TABLE public.notes IS 'Notepad of a user (1 row per user), saved automatically.';
COMMENT ON COLUMN public.notes.id IS 'Primary key.';
COMMENT ON COLUMN public.notes.user_id IS 'Owner (auth.users). Unique: one note per user.';
COMMENT ON COLUMN public.notes.content IS 'Note text, max 50000 characters.';
COMMENT ON COLUMN public.notes.created_at IS 'When the note was created.';
COMMENT ON COLUMN public.notes.updated_at IS 'Last change; used by the last-write-wins trigger.';

-- 2.4 focus_sessions
COMMENT ON TABLE public.focus_sessions IS 'Every finished focus session; the source of the Analytics page and the streak.';
COMMENT ON COLUMN public.focus_sessions.id IS 'Primary key.';
COMMENT ON COLUMN public.focus_sessions.user_id IS 'Owner (auth.users).';
COMMENT ON COLUMN public.focus_sessions.duration_minutes IS 'Length of the session in minutes (1-1440).';
COMMENT ON COLUMN public.focus_sessions.intent_title IS 'What the user focused on (max 80 characters); kept when the task is deleted.';
COMMENT ON COLUMN public.focus_sessions.task_id IS 'Optional task of the same user (composite FK with user_id); set to NULL when the task is deleted.';
COMMENT ON COLUMN public.focus_sessions.completed_at IS 'When the session ended.';
COMMENT ON COLUMN public.focus_sessions.created_at IS 'When the row was created.';
COMMENT ON COLUMN public.focus_sessions.updated_at IS 'Last change; used by the last-write-wins trigger.';

-- 2.5 user_wallpapers
COMMENT ON TABLE public.user_wallpapers IS 'Pictures a user uploaded as wallpapers (max 3 per user); the file itself is in the user-wallpapers Storage bucket.';
COMMENT ON COLUMN public.user_wallpapers.id IS 'Primary key.';
COMMENT ON COLUMN public.user_wallpapers.user_id IS 'Owner (auth.users).';
COMMENT ON COLUMN public.user_wallpapers.storage_path IS 'Path of the file in Storage; must start with the owner id and a slash.';
COMMENT ON COLUMN public.user_wallpapers.file_size IS 'File size in bytes (max 5 MB).';
COMMENT ON COLUMN public.user_wallpapers.luminance IS 'Relative brightness of the picture (0.000-1.000), measured once at upload.';
COMMENT ON COLUMN public.user_wallpapers.created_at IS 'When the picture was uploaded.';
COMMENT ON COLUMN public.user_wallpapers.updated_at IS 'Last change; used by the last-write-wins trigger.';

-- 2.6 saved_themes
COMMENT ON TABLE public.saved_themes IS 'Themes a user saved (max 10 per user). Names may repeat on purpose (ERD 12.8).';
COMMENT ON COLUMN public.saved_themes.id IS 'Primary key.';
COMMENT ON COLUMN public.saved_themes.user_id IS 'Owner (auth.users).';
COMMENT ON COLUMN public.saved_themes.name IS 'Theme name, 1-50 characters.';
COMMENT ON COLUMN public.saved_themes.config IS 'Theme tokens (colors, clock font, wallpaper) as JSON, max 8 KB.';
COMMENT ON COLUMN public.saved_themes.created_at IS 'When the theme was saved.';
COMMENT ON COLUMN public.saved_themes.updated_at IS 'Last change; used by the last-write-wins trigger.';

COMMIT;

-- FocusFlow demo data.
--
-- Fills one existing account with sample tasks, a note, 14 days of focus sessions and saved themes,
-- so the Analytics and Themes pages have real database content to show.
--
-- How to run:
--   1. Apply supabase/migrations first.
--   2. Sign up in the app with the account you want to use for the demo.
--   3. Replace the email in demo_email below with that account's email.
--   4. Paste this file into the Supabase SQL Editor and run it.
--
-- It is safe to run again: rows it already created are skipped, and existing data is never changed.
-- If anything fails (unknown email, task or theme limit reached), nothing is saved.

DO $seed$
DECLARE
  demo_email constant text := 'demo@example.com';
  demo_user uuid;
  added_tasks integer;
  added_sessions integer;
  added_themes integer;
BEGIN
  SELECT id INTO demo_user FROM auth.users WHERE lower(email) = lower(demo_email);
  IF demo_user IS NULL THEN
    RAISE EXCEPTION 'No account found for %. Sign up in the app first, then set demo_email in this file.', demo_email;
  END IF;

  -- Tasks: a mix of open and done, with priorities, due dates and labels.
  INSERT INTO public.tasks (id, user_id, title, is_completed, priority, due_date, labels, created_at)
  SELECT md5(demo_user::text || ':task:' || item.item_key)::uuid, demo_user, item.title, item.is_done, item.priority,
         CASE WHEN item.due_in_days IS NULL THEN NULL ELSE now() + make_interval(days => item.due_in_days) END,
         item.labels, now() - make_interval(days => item.age_days)
  FROM (VALUES
    ('report',   'Finish the web project report',     false, 'high',   1,    ARRAY['school', 'writing'],  1),
    ('slides',   'Prepare the presentation slides',   false, 'high',   3,    ARRAY['school'],             2),
    ('review',   'Review pull requests from the team', false, 'medium', 0,    ARRAY['team', 'github'],     1),
    ('sql',      'Practice SQL joins',                false, 'medium', 5,    ARRAY['study', 'database'],  4),
    ('react',    'Read the React Router guide',       false, 'low',    NULL, ARRAY['study'],              6),
    ('english',  'Learn 20 new English words',        false, 'low',    2,    ARRAY['study', 'english'],   3),
    ('inbox',    'Clean up the email inbox',          false, 'none',   NULL, ARRAY[]::text[],             2),
    ('erd',      'Draw the database diagram',         true,  'high',   -3,   ARRAY['school', 'database'], 9),
    ('layout',   'Build the responsive layout',       true,  'medium', -5,   ARRAY['school', 'frontend'], 11),
    ('setup',    'Set up the GitHub repository',      true,  'low',    -9,   ARRAY['team', 'github'],     13)
  ) AS item(item_key, title, is_done, priority, due_in_days, labels, age_days)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.tasks existing
    WHERE existing.id = md5(demo_user::text || ':task:' || item.item_key)::uuid
  );
  GET DIAGNOSTICS added_tasks = ROW_COUNT;

  -- Note: kept as is when the account already has one.
  INSERT INTO public.notes (user_id, content)
  VALUES (
    demo_user,
    E'Today''s plan\n- Finish the report introduction\n- Review the open pull requests\n- 3 focus sessions before lunch\n\nIdeas\n- Try the Deep Work timer for long writing tasks'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Focus sessions over the last 14 days. Day 6 is a rest day, so the current streak is 6 days.
  INSERT INTO public.focus_sessions (id, user_id, duration_minutes, intent_title, task_id, completed_at)
  SELECT md5(demo_user::text || ':session:' || item.days_ago || ':' || item.slot)::uuid, demo_user, item.minutes, item.intent,
         (SELECT task.id FROM public.tasks task
          WHERE task.user_id = demo_user
            AND task.id = md5(demo_user::text || ':task:' || item.task_key)::uuid),
         now() - make_interval(days => item.days_ago, mins => item.slot * 70)
  FROM (VALUES
    (0,  0, 25, 'Finish the web project report',    'report'),
    (1,  0, 25, 'Finish the web project report',    'report'),
    (1,  1, 25, 'Review pull requests',             'review'),
    (1,  2, 50, 'Prepare the presentation slides',  'slides'),
    (2,  0, 52, 'Prepare the presentation slides',  'slides'),
    (2,  1, 25, 'Learn English words',              'english'),
    (3,  0, 90, 'Finish the web project report',    'report'),
    (3,  1, 25, 'Practice SQL joins',               'sql'),
    (4,  0, 25, 'Practice SQL joins',               'sql'),
    (4,  1, 25, 'Practice SQL joins',               'sql'),
    (4,  2, 25, NULL,                               NULL),
    (5,  0, 52, 'Read the React Router guide',      'react'),
    (7,  0, 25, 'Draw the database diagram',        'erd'),
    (7,  1, 50, 'Draw the database diagram',        'erd'),
    (8,  0, 90, 'Build the responsive layout',      'layout'),
    (9,  0, 25, 'Build the responsive layout',      'layout'),
    (9,  1, 25, 'Build the responsive layout',      'layout'),
    (9,  2, 25, NULL,                               NULL),
    (10, 0, 52, 'Build the responsive layout',      'layout'),
    (11, 0, 25, 'Draw the database diagram',        'erd'),
    (12, 0, 25, 'Set up the GitHub repository',     'setup'),
    (12, 1, 25, 'Set up the GitHub repository',     'setup'),
    (13, 0, 50, 'Plan the project',                 NULL)
  ) AS item(days_ago, slot, minutes, intent, task_key)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.focus_sessions existing
    WHERE existing.id = md5(demo_user::text || ':session:' || item.days_ago || ':' || item.slot)::uuid
  );
  GET DIAGNOSTICS added_sessions = ROW_COUNT;

  -- Saved themes, in the same format the app stores.
  INSERT INTO public.saved_themes (id, user_id, name, config)
  SELECT md5(demo_user::text || ':theme:' || item.item_key)::uuid, demo_user, item.name, item.config::jsonb
  FROM (VALUES
    ('night',  'Deep Night Focus', '{"tokens":{"colorAccent":"#38bdf8","colorAccentContrast":"#000000","capsuleBg":"#0f172a","capsuleOpacity":0.6,"capsuleBlur":24,"capsuleRadius":24,"capsuleBorderWidth":1,"capsuleBorderColor":"rgba(56, 189, 248, 0.2)","fontClock":"''JetBrains Mono'', ui-monospace, monospace","clockScale":1,"clockWeight":600,"bgDim":20,"bgBlur":0,"bgBrightness":100,"bgSolidColor":"#0b0f19"},"effects":{"rain":0,"snow":0,"fireflies":0,"grain":0,"vignette":0,"scanlines":0,"glow":0},"wallpaperRef":{"type":"preset","idOrColor":"gradient-midnight"}}'),
    ('matcha', 'Morning Matcha',   '{"tokens":{"colorAccent":"#4ade80","colorAccentContrast":"#000000","capsuleBg":"#0f1f17","capsuleOpacity":0.55,"capsuleBlur":24,"capsuleRadius":32,"capsuleBorderWidth":1,"capsuleBorderColor":"rgba(74, 222, 128, 0.18)","fontClock":"''Outfit'', system-ui, sans-serif","clockScale":1,"clockWeight":600,"bgDim":20,"bgBlur":0,"bgBrightness":100,"bgSolidColor":"#0f1412"},"effects":{"rain":0,"snow":0,"fireflies":30,"grain":0,"vignette":0,"scanlines":0,"glow":0},"wallpaperRef":{"type":"preset","idOrColor":"gradient-forest"}}'),
    ('neon',   'Neon Sprint',      '{"tokens":{"colorAccent":"#ff2d95","colorAccentContrast":"#000000","capsuleBg":"#0b0618","capsuleOpacity":0.62,"capsuleBlur":24,"capsuleRadius":10,"capsuleBorderWidth":1,"capsuleBorderColor":"rgba(255, 45, 149, 0.45)","fontClock":"''JetBrains Mono'', ui-monospace, monospace","clockScale":1,"clockWeight":700,"bgDim":10,"bgBlur":0,"bgBrightness":100,"bgSolidColor":"#12002b"},"effects":{"rain":30,"snow":0,"fireflies":0,"grain":0,"vignette":0,"scanlines":20,"glow":60},"wallpaperRef":{"type":"preset","idOrColor":"cyber-neon-city"}}')
  ) AS item(item_key, name, config)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.saved_themes existing
    WHERE existing.id = md5(demo_user::text || ':theme:' || item.item_key)::uuid
  );
  GET DIAGNOSTICS added_themes = ROW_COUNT;

  RAISE NOTICE 'Seed finished for %: % tasks, % focus sessions, % themes added.',
    demo_email, added_tasks, added_sessions, added_themes;
END
$seed$;

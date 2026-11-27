-- =============================================================================
-- Minimal stand-in for the parts of Supabase that the migrations, the demo data
-- and the tests in docs/ERD.md section 11 use, so they can run on a plain
-- PostgreSQL 15 server in CI. Never run this on the real Supabase project:
-- there these roles, schemas and functions already exist.
-- =============================================================================

BEGIN;

-- Roles that Supabase gives to API requests.
-- Roles belong to the whole server, so create them only when they are missing.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
END;
$$;

-- auth: the users table and auth.uid(), which reads the user id from the JWT claims.
CREATE SCHEMA auth;

CREATE TABLE auth.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aud text,
    role text,
    email text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
    SELECT (nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub')::uuid;
$$;

GRANT USAGE ON SCHEMA auth TO anon, authenticated;

-- storage: the buckets and objects tables and storage.foldername(), used by the wallpaper policies.
CREATE SCHEMA storage;

CREATE TABLE storage.buckets (
    id text PRIMARY KEY,
    name text NOT NULL,
    public boolean NOT NULL DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[]
);

CREATE TABLE storage.objects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_id text REFERENCES storage.buckets (id),
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Folders of a path: 'user-id/picture.png' gives {user-id}.
CREATE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT (pg_catalog.string_to_array(name, '/'))[1:pg_catalog.cardinality(pg_catalog.string_to_array(name, '/')) - 1];
$$;

GRANT USAGE ON SCHEMA storage TO anon, authenticated;

COMMIT;

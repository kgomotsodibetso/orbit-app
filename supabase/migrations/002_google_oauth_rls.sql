-- ============================================================
-- Migration: 002_google_oauth_rls
-- Purpose: Allow newly-authenticated users (with no profile yet)
--          to create their own institution and profile during
--          the Google OAuth onboarding flow.
--
-- RUN IN: Supabase Dashboard → SQL Editor
-- ============================================================

-- Allow a newly-authenticated Google user (no profile yet)
-- to create their first institution.
CREATE POLICY "New users can create their own institution"
  ON institutions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
    )
  );

-- Allow a new user to insert their own profile row.
-- The existing "Admins manage profiles" policy reads institution_id
-- from JWT claims, which are NULL before the first profile is created,
-- so we need a separate bootstrap policy.
CREATE POLICY "New users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (
    id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
    )
  );

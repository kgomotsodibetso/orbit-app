-- ============================================================
-- Migration 004: Fix profiles SELECT policy
--
-- Problem: The only SELECT policy on profiles is
--   USING (institution_id = auth_institution_id())
-- which relies on auth_institution_id() querying the same
-- profiles table (circular). Even with the SECURITY DEFINER
-- fix in 003, a user whose profile row was never created has
-- nothing to look up — so auth_institution_id() returns NULL,
-- institution_id = NULL is always FALSE, and the user can
-- never read their own profile.
--
-- Fix: Add a direct "read your own row" policy so any
-- authenticated user can always SELECT their own profile
-- by primary key (id = auth.uid()). This breaks the
-- circular dependency completely and works even in edge
-- cases where institution_id is NULL.
-- ============================================================

CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

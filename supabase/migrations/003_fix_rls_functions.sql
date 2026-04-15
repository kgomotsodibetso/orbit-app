-- ============================================================
-- Migration 003: Fix RLS helper functions
--
-- Problem: auth_institution_id() and auth_role() read from JWT
-- custom claims, but no JWT hook was configured. They always
-- return NULL, so every RLS policy silently blocks all rows.
--
-- Fix: Replace with SECURITY DEFINER functions that query the
-- profiles table directly. SECURITY DEFINER runs as the function
-- owner (postgres), bypassing RLS — so there is no circular
-- dependency with the policies that call these functions.
-- ============================================================

CREATE OR REPLACE FUNCTION auth_institution_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT institution_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(role, 'viewer')
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

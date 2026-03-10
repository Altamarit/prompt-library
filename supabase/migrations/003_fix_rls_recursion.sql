-- Fix: infinite recursion in profiles RLS policies
-- The admin policies on profiles queried profiles itself, causing recursion.
-- Solution: use a SECURITY DEFINER function that bypasses RLS.

-- 1. Create helper function (runs as owner, bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id::text = auth.jwt() ->> 'sub'
      AND role = 'admin'
  );
$$;

-- 2. Drop the recursive policies on profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- The "Public can read basic profile info" policy (USING true) already covers
-- all reads, so admins can already read. We just need admin update:
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 3. Fix admin policies on other tables that also self-reference profiles

-- collections
DROP POLICY IF EXISTS "Admins can manage all collections" ON public.collections;
CREATE POLICY "Admins can manage all collections"
  ON public.collections FOR ALL
  USING (public.is_admin());

-- prompts
DROP POLICY IF EXISTS "Admins can manage all prompts" ON public.prompts;
CREATE POLICY "Admins can manage all prompts"
  ON public.prompts FOR ALL
  USING (public.is_admin());

-- prompt_usage_logs
DROP POLICY IF EXISTS "Admins can read all usage logs" ON public.prompt_usage_logs;
CREATE POLICY "Admins can read all usage logs"
  ON public.prompt_usage_logs FOR SELECT
  USING (public.is_admin());

-- xp_events
DROP POLICY IF EXISTS "Admins can read all xp events" ON public.xp_events;
CREATE POLICY "Admins can read all xp events"
  ON public.xp_events FOR SELECT
  USING (public.is_admin());

-- prompt_reports
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.prompt_reports;
CREATE POLICY "Admins can manage all reports"
  ON public.prompt_reports FOR ALL
  USING (public.is_admin());

-- models
DROP POLICY IF EXISTS "Admins can manage models" ON public.models;
CREATE POLICY "Admins can manage models"
  ON public.models FOR ALL
  USING (public.is_admin());

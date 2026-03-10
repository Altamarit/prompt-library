-- Fix: Firebase UIDs are not UUIDs. Change to text.
-- Must drop ALL policies and FKs before altering column types.

-- ============================================================
-- STEP 1: Drop ALL RLS policies on ALL tables
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone authenticated can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can read basic profile info" ON public.profiles;

-- usages
DROP POLICY IF EXISTS "Anyone authenticated can read usages" ON public.usages;
DROP POLICY IF EXISTS "Authenticated users can create usages" ON public.usages;

-- collections
DROP POLICY IF EXISTS "Users can read own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can read public collections" ON public.collections;
DROP POLICY IF EXISTS "Users can insert own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can update own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON public.collections;
DROP POLICY IF EXISTS "Admins can manage all collections" ON public.collections;

-- prompts
DROP POLICY IF EXISTS "Users can read own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can read community prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can insert own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Users can delete own prompts" ON public.prompts;
DROP POLICY IF EXISTS "Admins can manage all prompts" ON public.prompts;

-- prompt_versions
DROP POLICY IF EXISTS "Users can read versions of accessible prompts" ON public.prompt_versions;
DROP POLICY IF EXISTS "Users can insert versions of own prompts" ON public.prompt_versions;

-- prompt_likes
DROP POLICY IF EXISTS "Users can read all likes" ON public.prompt_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON public.prompt_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.prompt_likes;

-- prompt_usage_logs
DROP POLICY IF EXISTS "Users can read own usage logs" ON public.prompt_usage_logs;
DROP POLICY IF EXISTS "Users can insert own usage logs" ON public.prompt_usage_logs;
DROP POLICY IF EXISTS "Admins can read all usage logs" ON public.prompt_usage_logs;

-- xp_events
DROP POLICY IF EXISTS "Users can read own xp events" ON public.xp_events;
DROP POLICY IF EXISTS "Admins can read all xp events" ON public.xp_events;
DROP POLICY IF EXISTS "System can insert xp events" ON public.xp_events;

-- prompt_reports
DROP POLICY IF EXISTS "Users can insert reports" ON public.prompt_reports;
DROP POLICY IF EXISTS "Users can read own reports" ON public.prompt_reports;
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.prompt_reports;

-- models
DROP POLICY IF EXISTS "Anyone authenticated can read models" ON public.models;
DROP POLICY IF EXISTS "Admins can manage models" ON public.models;

-- prompt_model_stats
DROP POLICY IF EXISTS "Anyone authenticated can read model stats" ON public.prompt_model_stats;
DROP POLICY IF EXISTS "Users can manage stats for own prompts" ON public.prompt_model_stats;

-- ============================================================
-- STEP 2: Drop ALL foreign key constraints
-- ============================================================
ALTER TABLE public.prompt_model_stats DROP CONSTRAINT IF EXISTS prompt_model_stats_prompt_id_fkey;
ALTER TABLE public.prompt_model_stats DROP CONSTRAINT IF EXISTS prompt_model_stats_model_id_fkey;
ALTER TABLE public.prompt_reports DROP CONSTRAINT IF EXISTS prompt_reports_prompt_id_fkey;
ALTER TABLE public.prompt_reports DROP CONSTRAINT IF EXISTS prompt_reports_reporter_id_fkey;
ALTER TABLE public.prompt_reports DROP CONSTRAINT IF EXISTS prompt_reports_resolved_by_fkey;
ALTER TABLE public.xp_events DROP CONSTRAINT IF EXISTS xp_events_user_id_fkey;
ALTER TABLE public.xp_events DROP CONSTRAINT IF EXISTS xp_events_source_prompt_id_fkey;
ALTER TABLE public.prompt_usage_logs DROP CONSTRAINT IF EXISTS prompt_usage_logs_prompt_id_fkey;
ALTER TABLE public.prompt_usage_logs DROP CONSTRAINT IF EXISTS prompt_usage_logs_user_id_fkey;
ALTER TABLE public.prompt_likes DROP CONSTRAINT IF EXISTS prompt_likes_prompt_id_fkey;
ALTER TABLE public.prompt_likes DROP CONSTRAINT IF EXISTS prompt_likes_user_id_fkey;
ALTER TABLE public.prompt_versions DROP CONSTRAINT IF EXISTS prompt_versions_prompt_id_fkey;
ALTER TABLE public.prompts DROP CONSTRAINT IF EXISTS prompts_owner_id_fkey;
ALTER TABLE public.prompts DROP CONSTRAINT IF EXISTS prompts_usage_id_fkey;
ALTER TABLE public.prompts DROP CONSTRAINT IF EXISTS prompts_collection_id_fkey;
ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_owner_id_fkey;
ALTER TABLE public.usages DROP CONSTRAINT IF EXISTS usages_created_by_fkey;

-- Also drop the unique constraint on prompt_likes that references the columns
ALTER TABLE public.prompt_likes DROP CONSTRAINT IF EXISTS prompt_likes_prompt_id_user_id_key;

-- ============================================================
-- STEP 3: Alter column types from uuid to text
-- ============================================================
ALTER TABLE public.profiles ALTER COLUMN id TYPE text;
ALTER TABLE public.usages ALTER COLUMN created_by TYPE text;
ALTER TABLE public.collections ALTER COLUMN owner_id TYPE text;
ALTER TABLE public.prompts ALTER COLUMN owner_id TYPE text;
ALTER TABLE public.prompt_likes ALTER COLUMN user_id TYPE text;
ALTER TABLE public.prompt_usage_logs ALTER COLUMN user_id TYPE text;
ALTER TABLE public.xp_events ALTER COLUMN user_id TYPE text;
ALTER TABLE public.prompt_reports ALTER COLUMN reporter_id TYPE text;
ALTER TABLE public.prompt_reports ALTER COLUMN resolved_by TYPE text;

-- ============================================================
-- STEP 4: Re-add unique constraint and foreign keys
-- ============================================================
ALTER TABLE public.prompt_likes ADD CONSTRAINT prompt_likes_prompt_id_user_id_key UNIQUE (prompt_id, user_id);

ALTER TABLE public.usages ADD CONSTRAINT usages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);
ALTER TABLE public.collections ADD CONSTRAINT collections_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);
ALTER TABLE public.prompts ADD CONSTRAINT prompts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);
ALTER TABLE public.prompts ADD CONSTRAINT prompts_usage_id_fkey FOREIGN KEY (usage_id) REFERENCES public.usages(id);
ALTER TABLE public.prompts ADD CONSTRAINT prompts_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id);
ALTER TABLE public.prompt_versions ADD CONSTRAINT prompt_versions_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompts(id) ON DELETE CASCADE;
ALTER TABLE public.prompt_likes ADD CONSTRAINT prompt_likes_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompts(id) ON DELETE CASCADE;
ALTER TABLE public.prompt_likes ADD CONSTRAINT prompt_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE public.prompt_usage_logs ADD CONSTRAINT prompt_usage_logs_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompts(id) ON DELETE CASCADE;
ALTER TABLE public.prompt_usage_logs ADD CONSTRAINT prompt_usage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE public.xp_events ADD CONSTRAINT xp_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE public.xp_events ADD CONSTRAINT xp_events_source_prompt_id_fkey FOREIGN KEY (source_prompt_id) REFERENCES public.prompts(id);
ALTER TABLE public.prompt_reports ADD CONSTRAINT prompt_reports_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompts(id) ON DELETE CASCADE;
ALTER TABLE public.prompt_reports ADD CONSTRAINT prompt_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id);
ALTER TABLE public.prompt_reports ADD CONSTRAINT prompt_reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.profiles(id);
ALTER TABLE public.prompt_model_stats ADD CONSTRAINT prompt_model_stats_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompts(id) ON DELETE CASCADE;
ALTER TABLE public.prompt_model_stats ADD CONSTRAINT prompt_model_stats_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(id);

-- ============================================================
-- STEP 5: Recreate is_admin() function
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.jwt() ->> 'sub'
      AND role = 'admin'
  );
$$;

-- ============================================================
-- STEP 6: Recreate ALL RLS policies (with text comparisons)
-- ============================================================

-- profiles
CREATE POLICY "Anyone authenticated can read profiles"
  ON public.profiles FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (id = auth.jwt() ->> 'sub');
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE USING (public.is_admin());

-- usages
CREATE POLICY "Anyone authenticated can read usages"
  ON public.usages FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "Authenticated users can create usages"
  ON public.usages FOR INSERT WITH CHECK (auth.jwt() IS NOT NULL);

-- collections
CREATE POLICY "Users can read own collections"
  ON public.collections FOR SELECT USING (owner_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can read public collections"
  ON public.collections FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own collections"
  ON public.collections FOR INSERT WITH CHECK (owner_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can update own collections"
  ON public.collections FOR UPDATE USING (owner_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can delete own collections"
  ON public.collections FOR DELETE USING (owner_id = auth.jwt() ->> 'sub');
CREATE POLICY "Admins can manage all collections"
  ON public.collections FOR ALL USING (public.is_admin());

-- prompts
CREATE POLICY "Users can read own prompts"
  ON public.prompts FOR SELECT USING (owner_id = auth.jwt() ->> 'sub' AND is_deleted = false);
CREATE POLICY "Users can read community prompts"
  ON public.prompts FOR SELECT USING (visibility = 'community' AND is_deleted = false);
CREATE POLICY "Users can insert own prompts"
  ON public.prompts FOR INSERT WITH CHECK (owner_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can update own prompts"
  ON public.prompts FOR UPDATE USING (owner_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can delete own prompts"
  ON public.prompts FOR DELETE USING (owner_id = auth.jwt() ->> 'sub');
CREATE POLICY "Admins can manage all prompts"
  ON public.prompts FOR ALL USING (public.is_admin());

-- prompt_versions
CREATE POLICY "Users can read versions of accessible prompts"
  ON public.prompt_versions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.prompts pr WHERE pr.id = prompt_id
      AND (pr.owner_id = auth.jwt() ->> 'sub' OR pr.visibility = 'community') AND pr.is_deleted = false)
  );
CREATE POLICY "Users can insert versions of own prompts"
  ON public.prompt_versions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.prompts pr WHERE pr.id = prompt_id AND pr.owner_id = auth.jwt() ->> 'sub')
  );

-- prompt_likes
CREATE POLICY "Users can read all likes"
  ON public.prompt_likes FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "Users can insert own likes"
  ON public.prompt_likes FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can delete own likes"
  ON public.prompt_likes FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- prompt_usage_logs
CREATE POLICY "Users can read own usage logs"
  ON public.prompt_usage_logs FOR SELECT USING (user_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can insert own usage logs"
  ON public.prompt_usage_logs FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');
CREATE POLICY "Admins can read all usage logs"
  ON public.prompt_usage_logs FOR SELECT USING (public.is_admin());

-- xp_events
CREATE POLICY "Users can read own xp events"
  ON public.xp_events FOR SELECT USING (user_id = auth.jwt() ->> 'sub');
CREATE POLICY "Admins can read all xp events"
  ON public.xp_events FOR SELECT USING (public.is_admin());
CREATE POLICY "System can insert xp events"
  ON public.xp_events FOR INSERT WITH CHECK (auth.jwt() IS NOT NULL);

-- prompt_reports
CREATE POLICY "Users can insert reports"
  ON public.prompt_reports FOR INSERT WITH CHECK (reporter_id = auth.jwt() ->> 'sub');
CREATE POLICY "Users can read own reports"
  ON public.prompt_reports FOR SELECT USING (reporter_id = auth.jwt() ->> 'sub');
CREATE POLICY "Admins can manage all reports"
  ON public.prompt_reports FOR ALL USING (public.is_admin());

-- models
CREATE POLICY "Anyone authenticated can read models"
  ON public.models FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "Admins can manage models"
  ON public.models FOR ALL USING (public.is_admin());

-- prompt_model_stats
CREATE POLICY "Anyone authenticated can read model stats"
  ON public.prompt_model_stats FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "Users can manage stats for own prompts"
  ON public.prompt_model_stats FOR ALL USING (
    EXISTS (SELECT 1 FROM public.prompts pr WHERE pr.id = prompt_id AND pr.owner_id = auth.jwt() ->> 'sub')
  );

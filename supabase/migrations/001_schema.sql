-- Prompt Library: Complete Database Schema
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  xp_total integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = auth.jwt() ->> 'sub' AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = auth.jwt() ->> 'sub' AND p.role = 'admin'
    )
  );

-- Public read for display_name and avatar (community features)
CREATE POLICY "Public can read basic profile info"
  ON public.profiles FOR SELECT
  USING (true);

-- ============================================================
-- 2. USAGES (prompt categories)
-- ============================================================
CREATE TABLE public.usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read usages"
  ON public.usages FOR SELECT
  USING (auth.jwt() IS NOT NULL);

CREATE POLICY "Authenticated users can create usages"
  ON public.usages FOR INSERT
  WITH CHECK (auth.jwt() IS NOT NULL);

-- ============================================================
-- 3. COLLECTIONS
-- ============================================================
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own collections"
  ON public.collections FOR SELECT
  USING (owner_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can read public collections"
  ON public.collections FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert own collections"
  ON public.collections FOR INSERT
  WITH CHECK (owner_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own collections"
  ON public.collections FOR UPDATE
  USING (owner_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own collections"
  ON public.collections FOR DELETE
  USING (owner_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Admins can manage all collections"
  ON public.collections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = auth.jwt() ->> 'sub' AND p.role = 'admin'
    )
  );

-- ============================================================
-- 4. PROMPTS
-- ============================================================
CREATE TABLE public.prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id),
  usage_id uuid REFERENCES public.usages(id),
  collection_id uuid REFERENCES public.collections(id),
  title text NOT NULL,
  initial_version text NOT NULL,
  current_version text NOT NULL,
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'community')),
  tokens_estimated integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  usage_count integer NOT NULL DEFAULT 0,
  likes_count integer NOT NULL DEFAULT 0,
  total_sessions integer NOT NULL DEFAULT 0,
  successful_sessions integer NOT NULL DEFAULT 0,
  avg_iterations numeric NOT NULL DEFAULT 0,
  is_deleted boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_prompts_owner ON public.prompts(owner_id);
CREATE INDEX idx_prompts_usage ON public.prompts(usage_id);
CREATE INDEX idx_prompts_collection ON public.prompts(collection_id);
CREATE INDEX idx_prompts_visibility ON public.prompts(visibility);
CREATE INDEX idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX idx_prompts_likes ON public.prompts(likes_count DESC);
CREATE INDEX idx_prompts_usage_count ON public.prompts(usage_count DESC);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prompts"
  ON public.prompts FOR SELECT
  USING (owner_id::text = auth.jwt() ->> 'sub' AND is_deleted = false);

CREATE POLICY "Users can read community prompts"
  ON public.prompts FOR SELECT
  USING (visibility = 'community' AND is_deleted = false);

CREATE POLICY "Users can insert own prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (owner_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own prompts"
  ON public.prompts FOR UPDATE
  USING (owner_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own prompts"
  ON public.prompts FOR DELETE
  USING (owner_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Admins can manage all prompts"
  ON public.prompts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = auth.jwt() ->> 'sub' AND p.role = 'admin'
    )
  );

-- ============================================================
-- 5. PROMPT VERSIONS
-- ============================================================
CREATE TABLE public.prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content text NOT NULL,
  tokens_estimated integer,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prompt_versions_prompt ON public.prompt_versions(prompt_id);

ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read versions of accessible prompts"
  ON public.prompt_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts pr
      WHERE pr.id = prompt_id
        AND (pr.owner_id::text = auth.jwt() ->> 'sub' OR pr.visibility = 'community')
        AND pr.is_deleted = false
    )
  );

CREATE POLICY "Users can insert versions of own prompts"
  ON public.prompt_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prompts pr
      WHERE pr.id = prompt_id AND pr.owner_id::text = auth.jwt() ->> 'sub'
    )
  );

-- ============================================================
-- 6. PROMPT LIKES
-- ============================================================
CREATE TABLE public.prompt_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);

CREATE INDEX idx_prompt_likes_prompt ON public.prompt_likes(prompt_id);
CREATE INDEX idx_prompt_likes_user ON public.prompt_likes(user_id);

ALTER TABLE public.prompt_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all likes"
  ON public.prompt_likes FOR SELECT
  USING (auth.jwt() IS NOT NULL);

CREATE POLICY "Users can insert own likes"
  ON public.prompt_likes FOR INSERT
  WITH CHECK (user_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own likes"
  ON public.prompt_likes FOR DELETE
  USING (user_id::text = auth.jwt() ->> 'sub');

-- ============================================================
-- 7. PROMPT USAGE LOGS
-- ============================================================
CREATE TABLE public.prompt_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  used_at timestamptz NOT NULL DEFAULT now(),
  context text,
  session_id uuid
);

CREATE INDEX idx_usage_logs_prompt ON public.prompt_usage_logs(prompt_id);
CREATE INDEX idx_usage_logs_user ON public.prompt_usage_logs(user_id);
CREATE INDEX idx_usage_logs_used_at ON public.prompt_usage_logs(used_at DESC);

ALTER TABLE public.prompt_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage logs"
  ON public.prompt_usage_logs FOR SELECT
  USING (user_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own usage logs"
  ON public.prompt_usage_logs FOR INSERT
  WITH CHECK (user_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Admins can read all usage logs"
  ON public.prompt_usage_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = auth.jwt() ->> 'sub' AND p.role = 'admin'
    )
  );

-- ============================================================
-- 8. XP EVENTS
-- ============================================================
CREATE TABLE public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  type text NOT NULL,
  amount integer NOT NULL,
  source_prompt_id uuid REFERENCES public.prompts(id),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_events_user ON public.xp_events(user_id);
CREATE INDEX idx_xp_events_type ON public.xp_events(type);
CREATE INDEX idx_xp_events_created_at ON public.xp_events(created_at DESC);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own xp events"
  ON public.xp_events FOR SELECT
  USING (user_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Admins can read all xp events"
  ON public.xp_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = auth.jwt() ->> 'sub' AND p.role = 'admin'
    )
  );

CREATE POLICY "System can insert xp events"
  ON public.xp_events FOR INSERT
  WITH CHECK (auth.jwt() IS NOT NULL);

-- ============================================================
-- 9. PROMPT REPORTS
-- ============================================================
CREATE TABLE public.prompt_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id),
  reason text NOT NULL,
  comment text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.profiles(id)
);

CREATE INDEX idx_reports_prompt ON public.prompt_reports(prompt_id);
CREATE INDEX idx_reports_status ON public.prompt_reports(status);

ALTER TABLE public.prompt_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert reports"
  ON public.prompt_reports FOR INSERT
  WITH CHECK (reporter_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can read own reports"
  ON public.prompt_reports FOR SELECT
  USING (reporter_id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Admins can manage all reports"
  ON public.prompt_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = auth.jwt() ->> 'sub' AND p.role = 'admin'
    )
  );

-- ============================================================
-- 10. MODELS (LLM configuration)
-- ============================================================
CREATE TABLE public.models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  max_context_tokens integer NOT NULL,
  input_price_per_million_tokens numeric NOT NULL,
  output_price_per_million_tokens numeric NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_default_reference boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read models"
  ON public.models FOR SELECT
  USING (auth.jwt() IS NOT NULL);

CREATE POLICY "Admins can manage models"
  ON public.models FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = auth.jwt() ->> 'sub' AND p.role = 'admin'
    )
  );

-- ============================================================
-- 11. PROMPT MODEL STATS (optional)
-- ============================================================
CREATE TABLE public.prompt_model_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES public.models(id),
  estimated_input_tokens integer,
  estimated_cost_per_call numeric,
  estimated_cost_per_session numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_model_stats_prompt ON public.prompt_model_stats(prompt_id);

ALTER TABLE public.prompt_model_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read model stats"
  ON public.prompt_model_stats FOR SELECT
  USING (auth.jwt() IS NOT NULL);

CREATE POLICY "Users can manage stats for own prompts"
  ON public.prompt_model_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts pr
      WHERE pr.id = prompt_id AND pr.owner_id::text = auth.jwt() ->> 'sub'
    )
  );

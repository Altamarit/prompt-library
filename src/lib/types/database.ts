export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  xp_total: number;
  level: number;
  created_at: string;
}

export interface Usage {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_public: boolean;
  created_at: string;
}

export interface Prompt {
  id: string;
  owner_id: string;
  usage_id: string | null;
  collection_id: string | null;
  title: string;
  initial_version: string;
  current_version: string;
  visibility: 'private' | 'community';
  tokens_estimated: number | null;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
  likes_count: number;
  total_sessions: number;
  successful_sessions: number;
  avg_iterations: number;
  is_deleted: boolean;
}

export interface PromptWithRelations extends Prompt {
  owner?: Profile;
  usage?: Usage;
  collection?: Collection;
  user_has_liked?: boolean;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_number: number;
  content: string;
  tokens_estimated: number | null;
  note: string | null;
  created_at: string;
}

export interface PromptLike {
  id: string;
  prompt_id: string;
  user_id: string;
  created_at: string;
}

export interface PromptUsageLog {
  id: string;
  prompt_id: string;
  user_id: string;
  used_at: string;
  context: string | null;
  session_id: string | null;
}

export interface XpEvent {
  id: string;
  user_id: string;
  type: 'prompt_created' | 'prompt_used' | 'like_received' | 'milestone' | 'prompt_deleted_due_to_report';
  amount: number;
  source_prompt_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PromptReport {
  id: string;
  prompt_id: string;
  reporter_id: string;
  reason: string;
  comment: string | null;
  status: 'open' | 'resolved' | 'rejected';
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  max_context_tokens: number;
  input_price_per_million_tokens: number;
  output_price_per_million_tokens: number;
  is_active: boolean;
  is_default_reference: boolean;
  created_at: string;
}

export interface PromptModelStats {
  id: string;
  prompt_id: string;
  model_id: string;
  estimated_input_tokens: number | null;
  estimated_cost_per_call: number | null;
  estimated_cost_per_session: number | null;
  updated_at: string;
}

export interface PromptReportWithRelations extends PromptReport {
  prompt?: Prompt;
  reporter?: Profile;
  resolved_by_profile?: Profile;
}

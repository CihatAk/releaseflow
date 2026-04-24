import { createClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[Supabase] Missing environment variables - using demo mode");
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseClient;
}

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  plan: "free" | "pro" | "team";
  plan_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Repository = {
  id: string;
  owner_id: string;
  repo_id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  settings: Record<string, unknown>;
  last_sync_at: string | null;
  created_at: string;
};

export type Template = {
  id: string;
  owner_id: string;
  name: string;
  format: string;
  content: string;
  is_default: boolean;
  is_public: boolean;
  usage_count: number;
  created_at: string;
};

export type Changelog = {
  id: string;
  owner_id: string;
  repo_id: string;
  version: string;
  content: string;
  format: string;
  commit_count: number;
  published_at: string | null;
  slug: string | null;
  is_public: boolean;
  view_count: number;
  created_at: string;
};

export type Subscription = {
  id: string;
  owner_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  plan: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
};
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

const MISSING_ENV_ERROR = "[Supabase] Missing environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url.startsWith("https://") && key.startsWith("eyJ"));
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    console.warn(MISSING_ENV_ERROR);
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: fetch,
      },
    });
  }

  return supabaseClient;
}

export function createServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: fetch,
      },
    });
  }

  return serverClient;
}

export function isConfigured(): boolean {
  return isSupabaseConfigured();
}

export function getConnectionInfo() {
  const configured = isSupabaseConfigured();
  return {
    configured,
    url: configured ? process.env.NEXT_PUBLIC_SUPABASE_URL : null,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith("eyJ"),
  };
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

export type ApiKey = {
  id: string;
  owner_id: string;
  name: string;
  key: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "editor" | "viewer";
  created_at: string;
};
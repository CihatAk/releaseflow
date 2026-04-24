import { createServerClient } from "./supabase/client";

export async function getProfile(userId: string) {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[DB] Get profile error:", error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const supabase = createServerClient();
  if (!supabase) return { error: "Demo mode" };

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}

export async function checkPlanLimit(userId: string, limitType: string) {
  const supabase = createServerClient();
  if (!supabase) return true;

  const { data, error } = await supabase.rpc("check_plan_limit", {
    p_user_id: userId,
    p_limit_type: limitType,
  });

  if (error) {
    console.error("[DB] Plan limit check error:", error);
    return false;
  }

  return data;
}

export async function getRepositories(userId: string) {
  const supabase = createServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("repositories")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[DB] Get repos error:", error);
    return [];
  }

  return data || [];
}

export async function addRepository(userId: string, repo: {
  repo_id: number;
  name: string;
  full_name: string;
  private: boolean;
  description?: string;
}) {
  const supabase = createServerClient();
  if (!supabase) return { error: "Demo mode" };

  const canCreate = await checkPlanLimit(userId, "repos");
  if (!canCreate) {
    return { error: "Repo limit reached for your plan" };
  }

  const { data, error } = await supabase
    .from("repositories")
    .insert({ ...repo, owner_id: userId })
    .select()
    .single();

  return { data, error };
}

export async function deleteRepository(userId: string, repoId: string) {
  const supabase = createServerClient();
  if (!supabase) return { error: "Demo mode" };

  const { error } = await supabase
    .from("repositories")
    .delete()
    .eq("id", repoId)
    .eq("owner_id", userId);

  return { error };
}

export async function getTemplates(userId: string) {
  const supabase = createServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[DB] Get templates error:", error);
    return [];
  }

  return data || [];
}

export async function saveTemplate(userId: string, template: {
  name: string;
  format: string;
  content: string;
  is_default?: boolean;
  is_public?: boolean;
}) {
  const supabase = createServerClient();
  if (!supabase) return { error: "Demo mode" };

  const { data, error } = await supabase
    .from("templates")
    .insert({ ...template, owner_id: userId })
    .select()
    .single();

  return { data, error };
}

export async function saveChangelog(userId: string, changelog: {
  repo_id: string;
  version: string;
  content: string;
  format: string;
  slug?: string;
  is_public?: boolean;
}) {
  const supabase = createServerClient();
  if (!supabase) return { error: "Demo mode" };

  const { data, error } = await supabase
    .from("changelogs")
    .insert({ ...changelog, owner_id: userId })
    .select()
    .single();

  return { data, error };
}

export async function getSubscription(userId: string) {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("owner_id", userId)
    .eq("status", "active")
    .single();

  if (error) return null;
  return data;
}

export async function createApiKey(userId: string, name: string) {
  const supabase = createServerClient();
  if (!supabase) return { error: "Demo mode" };

  const key = `rf_${crypto.randomUUID().replace(/-/g, "")}`;

  const { data, error } = await supabase
    .from("api_keys")
    .insert({ name, key, owner_id: userId })
    .select()
    .single();

  return { data: { ...data, key }, error };
}
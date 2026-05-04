import { createServerClient } from "./supabase/client";
import type { Profile, Repository, Template, Changelog, Subscription, ApiKey, UserAiKey } from "./supabase/client";
import { encrypt, decrypt } from "./encryption";

const CACHE_TTL = 60 * 1000; 
const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (item && item.expires > Date.now()) {
    return item.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttl = CACHE_TTL) {
  cache.set(key, { data, expires: Date.now() + ttl });
}

function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const cacheKey = `profile:${userId}`;
  const cached = getCached<Profile>(cacheKey);
  if (cached) return cached;

  const supabase = createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[DB] Get profile error:", error.message);
    return null;
  }

  setCache(cacheKey, data);
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<{ data?: Profile; error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured" };

  clearCache(`profile:${userId}`);

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("[DB] Update profile error:", error.message);
    return { error: error.message };
  }

  return { data: data as Profile };
}

export async function checkPlanLimit(userId: string, limitType: string): Promise<boolean> {
  const supabase = createServerClient();
  if (!supabase) return true;

  try {
    const { data, error } = await supabase.rpc("check_plan_limit", {
      p_user_id: userId,
      p_limit_type: limitType,
    });

    if (error) {
      console.error("[DB] Plan limit check error:", error.message);
      return false;
    }

    return data ?? false;
  } catch {
    return false;
  }
}

export async function getRepositories(userId: string): Promise<Repository[]> {
  const cacheKey = `repos:${userId}`;
  const cached = getCached<Repository[]>(cacheKey);
  if (cached) return cached;

  const supabase = createServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("repositories")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[DB] Get repos error:", error.message);
    return [];
  }

  const repos = data || [];
  setCache(cacheKey, repos);
  return repos;
}

export async function addRepository(userId: string, repo: Omit<Repository, "id" | "owner_id" | "created_at" | "updated_at">): Promise<{ data?: Repository; error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured" };

  const canCreate = await checkPlanLimit(userId, "repos");
  if (!canCreate) {
    return { error: "Repo limit reached for your plan" };
  }

  clearCache(`repos:${userId}`);

  const { data, error } = await supabase
    .from("repositories")
    .insert({ ...repo, owner_id: userId })
    .select()
    .single();

  if (error) {
    console.error("[DB] Add repo error:", error.message);
    return { error: error.message };
  }

  return { data: data as Repository };
}

export async function deleteRepository(userId: string, repoId: string): Promise<{ error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured" };

  clearCache(`repos:${userId}`);

  const { error } = await supabase
    .from("repositories")
    .delete()
    .eq("id", repoId)
    .eq("owner_id", userId);

  if (error) {
    console.error("[DB] Delete repo error:", error.message);
    return { error: error.message };
  }

  return {};
}

export async function getTemplates(userId: string): Promise<Template[]> {
  const cacheKey = `templates:${userId}`;
  const cached = getCached<Template[]>(cacheKey);
  if (cached) return cached;

  const supabase = createServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[DB] Get templates error:", error.message);
    return [];
  }

  const templates = data || [];
  setCache(cacheKey, templates);
  return templates;
}

export async function saveTemplate(userId: string, template: Omit<Template, "id" | "owner_id" | "created_at" | "usage_count">): Promise<{ data?: Template; error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured" };

  clearCache(`templates:${userId}`);

  const { data, error } = await supabase
    .from("templates")
    .insert({ ...template, owner_id: userId })
    .select()
    .single();

  if (error) {
    console.error("[DB] Save template error:", error.message);
    return { error: error.message };
  }

  return { data: data as Template };
}

export async function getChangelogs(userId: string, repoId?: string): Promise<Changelog[]> {
  const supabase = createServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("changelogs")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (repoId) {
    query = query.eq("repo_id", repoId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[DB] Get changelogs error:", error.message);
    return [];
  }

  return data || [];
}

export async function saveChangelog(userId: string, changelog: Omit<Changelog, "id" | "owner_id" | "created_at" | "view_count">): Promise<{ data?: Changelog; error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { data, error } = await supabase
    .from("changelogs")
    .insert({ ...changelog, owner_id: userId })
    .select()
    .single();

  if (error) {
    console.error("[DB] Save changelog error:", error.message);
    return { error: error.message };
  }

  return { data: data as Changelog };
}

export async function publishChangelog(changelogId: string, slug: string): Promise<{ error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase
    .from("changelogs")
    .update({ is_public: true, slug, published_at: new Date().toISOString() })
    .eq("id", changelogId);

  if (error) {
    console.error("[DB] Publish changelog error:", error.message);
    return { error: error.message };
  }

  return {};
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const cacheKey = `subscription:${userId}`;
  const cached = getCached<Subscription>(cacheKey);
  if (cached) return cached;

  const supabase = createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("owner_id", userId)
    .eq("status", "active")
    .single();

  if (error) return null;

  setCache(cacheKey, data, 5 * 60 * 1000);
  return data as Subscription;
}

export async function createApiKey(userId: string, name: string): Promise<{ data?: ApiKey; error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured" };

  const key = `rf_${crypto.randomUUID().replace(/-/g, "").substring(0, 32)}`;

  const { data, error } = await supabase
    .from("api_keys")
    .insert({ name, key, owner_id: userId })
    .select()
    .single();

  if (error) {
    console.error("[DB] Create API key error:", error.message);
    return { error: error.message };
  }

  return { data: { ...data as ApiKey, key } };
}

export async function validateApiKey(key: string): Promise<{ valid: boolean; userId?: string; expires_at?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { valid: false };

  const { data, error } = await supabase
    .from("api_keys")
    .select("owner_id, expires_at")
    .eq("key", key)
    .single();

  if (error || !data) {
    return { valid: false };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false };
  }

  return { valid: true, userId: data.owner_id, expires_at: data.expires_at };
}

export async function incrementViewCount(changelogId: string): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) return;

  await supabase.rpc("increment_view_count", { p_changelog_id: changelogId });
}

export async function incrementUsageCount(templateId: string): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) return;

  await supabase.rpc("increment_template_usage", { p_template_id: templateId });
}

export async function getUserAiKeys(userId: string): Promise<Pick<UserAiKey, "id" | "provider" | "label" | "is_active" | "created_at" | "updated_at">[]> {
  const supabase = createServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_ai_keys")
    .select("id, provider, label, is_active, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[DB] Get user AI keys error:", error.message);
    return [];
  }

  return data || [];
}

export async function getActiveUserAiKey(userId: string, provider: string): Promise<string | null> {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_ai_keys")
    .select("key")
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  try {
    return decrypt(data.key);
  } catch {
    console.error("[DB] Failed to decrypt AI key");
    return null;
  }
}

export async function saveUserAiKey(
  userId: string,
  provider: string,
  key: string,
  label?: string
): Promise<{ data?: UserAiKey; error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured" };

  const encryptedKey = encrypt(key);

  const { data, error } = await supabase
    .from("user_ai_keys")
    .insert({ user_id: userId, provider, key: encryptedKey, label: label || null })
    .select()
    .single();

  if (error) {
    console.error("[DB] Save user AI key error:", error.message);
    return { error: error.message };
  }

  return { data: data as UserAiKey };
}

export async function deleteUserAiKey(userId: string, keyId: string): Promise<{ error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase
    .from("user_ai_keys")
    .delete()
    .eq("id", keyId)
    .eq("user_id", userId);

  if (error) {
    console.error("[DB] Delete user AI key error:", error.message);
    return { error: error.message };
  }

  return {};
}

export async function toggleUserAiKey(userId: string, keyId: string, isActive: boolean): Promise<{ error?: string }> {
  const supabase = createServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase
    .from("user_ai_keys")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", keyId)
    .eq("user_id", userId);

  if (error) {
    console.error("[DB] Toggle user AI key error:", error.message);
    return { error: error.message };
  }

  return {};
}
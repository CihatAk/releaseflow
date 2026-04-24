-- Supabase Database Schema for ReleaseFlow
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  github_token_encrypted TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repositories table
CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  repo_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  private BOOLEAN DEFAULT false,
  description TEXT,
  default_branch TEXT DEFAULT 'main',
  settings JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, repo_id)
);

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT DEFAULT 'keepachangelog',
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Changelogs table
CREATE TABLE public.changelogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  repo_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  format TEXT DEFAULT 'keepachangelog',
  commit_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  slug TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Subscriptions table (Stripe)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  plan TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys table
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_plan ON public.profiles(plan);
CREATE INDEX idx_repos_owner ON public.repositories(owner_id);
CREATE INDEX idx_changelogs_owner ON public.changelogs(owner_id);
CREATE INDEX idx_changelogs_slug ON public.changelogs(slug) WHERE is_public = true;
CREATE INDEX idx_subscriptions_owner ON public.subscriptions(owner_id);
CREATE INDEX idx_api_keys_key ON public.api_keys(key);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changelogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Profiler policies (owner only)
CREATE POLICY "Owners can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Repositories policies
CREATE POLICY "Users can view own repos" ON public.repositories
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own repos" ON public.repositories
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own repos" ON public.repositories
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own repos" ON public.repositories
  FOR DELETE USING (owner_id = auth.uid());

-- Templates policies
CREATE POLICY "Users can view own templates" ON public.templates
  FOR SELECT USING (owner_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage own templates" ON public.templates
  FOR ALL USING (owner_id = auth.uid());

-- Public changelogs
CREATE POLICY "Public changelogs are viewable" ON public.changelogs
  FOR SELECT USING (is_public = true);

-- Subscription policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can manage own subscription" ON public.subscriptions
  FOR ALL USING (owner_id = auth.uid());

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to count user repositories
CREATE OR REPLACE FUNCTION public.count_user_repos(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.repositories WHERE owner_id = p_user_id;
$$ LANGUAGE sql STABLE;

-- Function to check plan limits
CREATE OR REPLACE FUNCTION public.check_plan_limit(p_user_id UUID, p_limit_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_count INTEGER;
  v_allowed INTEGER;
BEGIN
  SELECT plan INTO v_plan FROM public.profiles WHERE id = p_user_id;
  
  IF v_plan = 'free' THEN
    v_allowed := 3;
  ELSIF v_plan = 'pro' THEN
    v_allowed := 1000;
  ELSIF v_plan = 'team' THEN
    v_allowed := 10000;
  ELSE
    v_allowed := 0;
  END IF;
  
  IF p_limit_type = 'repos' THEN
    SELECT COUNT(*) INTO v_count FROM public.repositories WHERE owner_id = p_user_id;
  ELSIF p_limit_type = 'templates' THEN
    SELECT COUNT(*) INTO v_count FROM public.templates WHERE owner_id = p_user_id;
  ELSIF p_limit_type = 'changelogs' THEN
    SELECT COUNT(*) INTO v_count FROM public.changelogs WHERE owner_id = p_user_id;
  ELSE
    v_count := 0;
  END IF;
  
  RETURN v_count < v_allowed;
END;
$$ LANGUAGE plpgsql STABLE;
-- 在 Supabase SQL Editor 中运行此脚本
-- 直达链接: https://supabase.com/dashboard/project/gyzweqkiyugjhcjabstu/sql/new

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON public.users FOR SELECT USING (true);

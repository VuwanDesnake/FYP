
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'blog',
  ADD COLUMN IF NOT EXISTS author_name text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS external_url text,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'green',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notes" ON public.user_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notes" ON public.user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes" ON public.user_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notes" ON public.user_notes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.tip_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tip_id uuid NOT NULL,
  is_helpful boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tip_id)
);
ALTER TABLE public.tip_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authed can view feedback" ON public.tip_feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own feedback" ON public.tip_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own feedback" ON public.tip_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own feedback" ON public.tip_feedback FOR DELETE USING (auth.uid() = user_id);

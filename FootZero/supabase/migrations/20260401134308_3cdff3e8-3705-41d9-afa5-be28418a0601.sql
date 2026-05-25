
-- Eco tips managed by admin
CREATE TABLE public.eco_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'Easy',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.eco_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active tips" ON public.eco_tips FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can manage tips" ON public.eco_tips FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Goal templates managed by admin
CREATE TABLE public.goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_co2_kg NUMERIC NOT NULL DEFAULT 50,
  duration_days INTEGER NOT NULL DEFAULT 7,
  category TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.goal_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active templates" ON public.goal_templates FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can manage templates" ON public.goal_templates FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Resources managed by admin
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '#',
  category TEXT NOT NULL DEFAULT 'General',
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active resources" ON public.resources FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can manage resources" ON public.resources FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Facts for rotating widget
CREATE TABLE public.facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_text TEXT NOT NULL,
  source TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active facts" ON public.facts FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can manage facts" ON public.facts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Add onboarding_completed to user_preferences
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

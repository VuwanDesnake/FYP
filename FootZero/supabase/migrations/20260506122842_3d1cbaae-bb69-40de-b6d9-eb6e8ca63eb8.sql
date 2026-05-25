
CREATE TABLE public.emission_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  unit text NOT NULL,
  co2_per_unit numeric NOT NULL DEFAULT 0,
  icon text DEFAULT '🌱',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emission_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sources"
ON public.emission_sources FOR SELECT
USING (is_active = true OR public.get_my_role() = 'admin');

CREATE POLICY "Admins can insert sources"
ON public.emission_sources FOR INSERT
TO authenticated
WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "Admins can update sources"
ON public.emission_sources FOR UPDATE
TO authenticated
USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can delete sources"
ON public.emission_sources FOR DELETE
TO authenticated
USING (public.get_my_role() = 'admin');

INSERT INTO public.emission_sources (category, name, unit, co2_per_unit, icon) VALUES
  ('transport', 'Car', 'km', 0.21, '🚗'),
  ('transport', 'Bus', 'km', 0.089, '🚌'),
  ('transport', 'Train', 'km', 0.041, '🚆'),
  ('transport', 'Flight', 'km', 0.255, '✈️'),
  ('transport', 'Motorbike', 'km', 0.114, '🏍️'),
  ('transport', 'Walk', 'km', 0, '🚶'),
  ('transport', 'Bike', 'km', 0, '🚲'),
  ('diet', 'Vegan meal', 'meal', 0.7, '🥗'),
  ('diet', 'Vegetarian meal', 'meal', 1.25, '🥕'),
  ('diet', 'Mixed meal', 'meal', 2.5, '🍽️'),
  ('diet', 'Meat-heavy meal', 'meal', 4.5, '🥩'),
  ('energy', 'Electricity', 'kWh', 0.233, '⚡'),
  ('energy', 'Natural Gas', 'kWh', 0.203, '🔥'),
  ('energy', 'Coal', 'kWh', 0.341, '🪨'),
  ('shopping', 'Clothing item', 'item', 10, '👕'),
  ('shopping', 'Electronics', 'item', 70, '📱'),
  ('shopping', 'Furniture', 'item', 90, '🛋️');

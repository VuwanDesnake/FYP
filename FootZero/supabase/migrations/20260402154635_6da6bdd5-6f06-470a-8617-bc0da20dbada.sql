
-- Create a security definer function to check roles without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Drop the recursive admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate it using the security definer function
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.get_my_role() = 'admin');

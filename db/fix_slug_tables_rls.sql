-- Fix RLS policies for reserved_slugs and premium_slugs tables
-- These tables need to allow SELECT for all authenticated users
-- so the frontend can validate slugs during URL creation

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to reserved slugs" ON public.reserved_slugs;
DROP POLICY IF EXISTS "Allow public read access to premium slugs" ON public.premium_slugs;

-- Create new policies that allow SELECT for authenticated users
CREATE POLICY "Allow authenticated users to read reserved slugs"
ON public.reserved_slugs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to read premium slugs"
ON public.premium_slugs
FOR SELECT
TO authenticated
USING (true);

-- Verify RLS is enabled on both tables
ALTER TABLE public.reserved_slugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_slugs ENABLE ROW LEVEL SECURITY;

-- Grant SELECT permission to authenticated role
GRANT SELECT ON public.reserved_slugs TO authenticated;
GRANT SELECT ON public.premium_slugs TO authenticated;

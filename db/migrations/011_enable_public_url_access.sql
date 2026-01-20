-- Migration: Enable public access to URLs for redirection
-- This allows anonymous users to access short links via QR codes and direct URLs
-- Without this policy, only authenticated users can resolve slugs

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Permitir leitura pública de URLs para redirecionamento" ON public.urls;

-- Create policy to allow public SELECT access to urls table
-- This is necessary for the RedirectHandler to work for anonymous users
CREATE POLICY "Permitir leitura pública de URLs para redirecionamento" 
ON public.urls
FOR SELECT
USING (true);

-- Note: This only allows reading URLs, not creating, updating, or deleting them
-- Those operations still require authentication and ownership verification

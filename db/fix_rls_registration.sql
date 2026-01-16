-- Fix RLS Policy for User Registration
-- This allows users to create their own profile during signup

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Create new policy that allows INSERT during signup
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also ensure users can read their own profile after creation
DROP POLICY IF EXISTS "Users can view own profile" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

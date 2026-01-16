-- Complete RLS Fix for User Registration
-- This script ensures users can register and manage their own data

-- First, let's check and drop all existing policies on the users table
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable read access for users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;

-- Ensure RLS is enabled on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow users to INSERT their own profile during signup
-- This is critical for the registration flow
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to SELECT (read) their own profile
CREATE POLICY "Users can select own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 3: Allow users to UPDATE their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

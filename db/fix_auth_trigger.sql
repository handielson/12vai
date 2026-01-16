-- Automatic User Profile Creation via Trigger
-- This trigger automatically creates a user profile in the public.users table
-- when a new user signs up via Supabase Auth

-- First, drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Now we can remove the INSERT policy since the trigger handles it
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Keep only SELECT and UPDATE policies
-- (These should already exist from the previous SQL, but let's ensure they're correct)
DROP POLICY IF EXISTS "Users can select own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

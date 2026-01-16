-- =====================================================
-- CORRIGIR REGISTRO DE USUÁRIOS
-- =====================================================
-- Este script resolve o problema de usuários não aparecerem
-- na tabela users após o registro

-- Passo 1: Criar a função que adiciona usuários automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, is_admin)
  VALUES (NEW.id, NEW.email, 'free', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Passo 2: Criar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Passo 3: Migrar usuários existentes que não estão na tabela users
INSERT INTO public.users (id, email, plan, is_admin)
SELECT 
  au.id,
  au.email,
  'free' as plan,
  false as is_admin
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Passo 4: Verificar usuários migrados
SELECT 
  u.email,
  u.is_admin,
  u.plan,
  u.created_at
FROM public.users u
ORDER BY u.created_at DESC;

-- =====================================================
-- TORNAR UM USUÁRIO ADMIN
-- =====================================================
-- Após executar os passos acima, você pode tornar qualquer
-- usuário admin executando:

-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar admins:
-- SELECT email, is_admin FROM public.users WHERE is_admin = true;

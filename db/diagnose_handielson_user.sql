-- =====================================================
-- DIAGNOSTICAR PROBLEMA COM USUÁRIO handielson@gmail.com
-- =====================================================

-- Passo 1: Verificar dados do usuário
SELECT 
    id,
    email,
    is_admin,
    plan,
    custom_url_limit,
    created_at
FROM users
WHERE email = 'handielson@gmail.com';

-- Passo 2: Verificar se existe no auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'handielson@gmail.com';

-- Passo 3: Verificar políticas RLS atuais
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- Passo 4: Testar se a query que causa recursão funciona
-- Esta é a query que o código usa para verificar se é admin
SELECT is_admin 
FROM users 
WHERE id = (SELECT id FROM users WHERE email = 'handielson@gmail.com' LIMIT 1);

-- Passo 5: Comparar com usuário que funciona
SELECT 
    email,
    is_admin,
    plan,
    custom_url_limit
FROM users
WHERE email IN ('handielson@gmail.com', 'business@vaili.test')
ORDER BY email;

-- =====================================================
-- SOLUÇÃO TEMPORÁRIA: Simplificar Política RLS
-- =====================================================

-- Se houver recursão, use esta política mais simples:
DROP POLICY IF EXISTS "Users can view profiles based on role" ON users;

CREATE POLICY "Simple user view policy"
  ON users FOR SELECT
  USING (true); -- TEMPORÁRIO: permite todos verem todos

-- ATENÇÃO: Esta política é INSEGURA para produção!
-- Use apenas para testar se resolve o problema
-- Depois precisamos criar uma política segura

-- Verificar
SELECT email, is_admin FROM users ORDER BY created_at DESC;

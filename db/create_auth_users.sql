-- ============================================
-- CRIAR USUÁRIOS AUTENTICADOS (com login funcional)
-- ============================================
-- COPIE TODO ESTE SCRIPT e COLE no SQL Editor do Supabase
-- Clique em RUN

-- ============================================
-- IMPORTANTE: Este script cria usuários no auth.users
-- Senha para TODOS os usuários: 123456
-- ============================================

-- Criar usuário FREE
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'free@vaili.test',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Criar usuário PRO
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'pro@vaili.test',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Criar usuário BUSINESS
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'business@vaili.test',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Criar usuário WHITE LABEL
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'whitelabel@vaili.test',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- ============================================
-- Aguardar o trigger criar os perfis automaticamente
-- ============================================
-- O trigger "on_auth_user_created" deve criar os perfis na tabela users
-- Aguarde 2 segundos e execute a próxima query

-- ============================================
-- Atualizar os planos
-- ============================================

-- Atualizar para PRO
UPDATE users
SET plan = 'pro'
WHERE email = 'pro@vaili.test';

-- Atualizar para BUSINESS
UPDATE users
SET plan = 'business'
WHERE email = 'business@vaili.test';

-- Atualizar para WHITE LABEL
UPDATE users
SET plan = 'white_label'
WHERE email = 'whitelabel@vaili.test';

-- ============================================
-- Verificar resultado final
-- ============================================

SELECT 
  u.email,
  u.plan,
  CASE u.plan
    WHEN 'free' THEN '🆓 Free'
    WHEN 'pro' THEN '💎 Pro'
    WHEN 'business' THEN '🏢 Business'
    WHEN 'white_label' THEN '🎨 White Label'
  END as plano,
  au.email_confirmed_at,
  u.created_at
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email LIKE '%@vaili.test'
ORDER BY 
  CASE u.plan
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'business' THEN 3
    WHEN 'white_label' THEN 4
  END;

-- ✅ Resultado esperado:
-- | email                  | plan        | plano           | email_confirmed_at |
-- |------------------------|-------------|-----------------|-------------------|
-- | free@vaili.test        | free        | 🆓 Free         | 2026-01-13...     |
-- | pro@vaili.test         | pro         | 💎 Pro          | 2026-01-13...     |
-- | business@vaili.test    | business    | 🏢 Business     | 2026-01-13...     |
-- | whitelabel@vaili.test  | white_label | 🎨 White Label  | 2026-01-13...     |

-- ✅ Agora você pode fazer login em http://localhost:3000 com:
-- Email: free@vaili.test / Senha: 123456
-- Email: pro@vaili.test / Senha: 123456
-- Email: business@vaili.test / Senha: 123456
-- Email: whitelabel@vaili.test / Senha: 123456

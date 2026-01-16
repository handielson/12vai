-- ============================================
-- SCRIPT FINAL COMPLETO: Limpar e Criar Usuários Autenticados
-- ============================================
-- COPIE TODO ESTE SCRIPT e COLE no SQL Editor do Supabase
-- Clique em RUN APENAS UMA VEZ

-- ============================================
-- PASSO 1: Limpar TUDO
-- ============================================

-- Apagar todas as URLs
DELETE FROM urls;

-- Apagar todos os usuários da tabela public.users
DELETE FROM users;

-- Apagar todos os usuários do auth.users
DELETE FROM auth.users;

-- ============================================
-- PASSO 2: Criar os 4 usuários autenticados
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
-- PASSO 3: Atualizar os planos
-- ============================================
-- O trigger já criou os perfis com plano 'free'
-- Agora vamos atualizar os outros planos

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
-- PASSO 4: Verificar resultado final
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
  au.email_confirmed_at IS NOT NULL as email_confirmado,
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

-- ✅ Resultado esperado: 4 usuários com planos corretos e email confirmado
-- 
-- ✅ Agora você pode fazer login em http://localhost:3000 com:
-- 
-- Email: free@vaili.test / Senha: 123456 (Plano: Free)
-- Email: pro@vaili.test / Senha: 123456 (Plano: Pro)
-- Email: business@vaili.test / Senha: 123456 (Plano: Business)
-- Email: whitelabel@vaili.test / Senha: 123456 (Plano: White Label)

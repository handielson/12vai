-- ============================================
-- Script para LIMPAR e CRIAR usuários de teste
-- ============================================
-- ATENÇÃO: Este script vai APAGAR todos os usuários e URLs existentes!
-- Execute no SQL Editor do Supabase

-- ============================================
-- PASSO 1: Limpar dados existentes
-- ============================================

-- Apagar todas as URLs (CASCADE vai apagar os clicks também)
DELETE FROM urls;

-- Apagar todos os usuários da tabela public.users
DELETE FROM users;

-- Apagar usuários do Supabase Auth
-- IMPORTANTE: Execute este bloco separadamente se necessário
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM auth.users
  LOOP
    -- Deletar usuário do auth
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;
END $$;

-- ============================================
-- PASSO 2: Criar os 4 usuários de teste
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
  recovery_token
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
  recovery_token
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
  recovery_token
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
  recovery_token
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
  ''
);

-- ============================================
-- PASSO 3: Atualizar planos (o trigger já criou os perfis)
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
-- PASSO 4: Verificar usuários criados
-- ============================================

SELECT 
  email,
  plan,
  CASE plan
    WHEN 'free' THEN '🆓 Free - Sem slugs customizados'
    WHEN 'pro' THEN '💎 Pro - Slugs customizados'
    WHEN 'business' THEN '🏢 Business - Slugs customizados + Premium'
    WHEN 'white_label' THEN '🎨 White Label - Todos os recursos'
  END as recursos,
  created_at
FROM users
WHERE email LIKE '%@vaili.test'
ORDER BY 
  CASE plan
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'business' THEN 3
    WHEN 'white_label' THEN 4
  END;

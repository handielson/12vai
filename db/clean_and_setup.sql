-- ============================================
-- Script SIMPLIFICADO: Limpar e Preparar para Novos Usuários
-- ============================================
-- Execute no SQL Editor do Supabase

-- ============================================
-- PASSO 1: Limpar TODOS os dados existentes
-- ============================================

-- Apagar todas as URLs (CASCADE vai apagar os clicks também)
DELETE FROM urls;

-- Apagar todos os usuários da tabela public.users
DELETE FROM users;

-- ============================================
-- PASSO 2: Limpar usuários do Supabase Auth
-- ============================================
-- Vá para: Supabase Dashboard → Authentication → Users
-- Clique nos 3 pontinhos (...) de cada usuário e selecione "Delete user"
-- OU execute o comando abaixo (pode dar erro de permissão, nesse caso use a interface)

-- Listar todos os usuários para você deletar manualmente
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- PASSO 3: Criar os 4 usuários via Dashboard
-- ============================================
-- Vá para: Supabase Dashboard → Authentication → Users → Add user
-- Crie manualmente (é mais seguro):

-- Usuário 1:
-- Email: free@vaili.test
-- Password: 123456
-- Auto Confirm User: ✅ SIM

-- Usuário 2:
-- Email: pro@vaili.test
-- Password: 123456
-- Auto Confirm User: ✅ SIM

-- Usuário 3:
-- Email: business@vaili.test
-- Password: 123456
-- Auto Confirm User: ✅ SIM

-- Usuário 4:
-- Email: whitelabel@vaili.test
-- Password: 123456
-- Auto Confirm User: ✅ SIM

-- ============================================
-- PASSO 4: Atualizar os planos
-- ============================================
-- Execute DEPOIS de criar os 4 usuários acima

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
-- PASSO 5: Verificar se funcionou
-- ============================================

SELECT 
  email,
  plan,
  CASE plan
    WHEN 'free' THEN '🆓 Free'
    WHEN 'pro' THEN '💎 Pro'
    WHEN 'business' THEN '🏢 Business'
    WHEN 'white_label' THEN '🎨 White Label'
  END as plano,
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

-- Resultado esperado:
-- | email                  | plan        | plano           |
-- |------------------------|-------------|-----------------|
-- | free@vaili.test        | free        | 🆓 Free         |
-- | pro@vaili.test         | pro         | 💎 Pro          |
-- | business@vaili.test    | business    | 🏢 Business     |
-- | whitelabel@vaili.test  | white_label | 🎨 White Label  |

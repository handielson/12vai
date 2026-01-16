-- Script para criar/atualizar usuários de teste para cada plano
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- PASSO 1: Criar usuários de teste via Supabase Auth
-- ============================================
-- IMPORTANTE: Você precisa criar estes usuários manualmente via interface do Supabase
-- ou via registro no frontend primeiro, depois execute o PASSO 2 abaixo.

-- Usuários sugeridos:
-- 1. free@vaili.test      - senha: 123456 (Plano Free)
-- 2. pro@vaili.test       - senha: 123456 (Plano Pro)
-- 3. business@vaili.test  - senha: 123456 (Plano Business)
-- 4. whitelabel@vaili.test - senha: 123456 (Plano White Label)

-- ============================================
-- PASSO 2: Atualizar planos dos usuários
-- ============================================

-- Atualizar para plano FREE (já é o padrão, mas garantindo)
UPDATE users
SET plan = 'free'
WHERE email = 'free@vaili.test'
RETURNING id, email, plan;

-- Atualizar para plano PRO
UPDATE users
SET plan = 'pro'
WHERE email = 'pro@vaili.test'
RETURNING id, email, plan;

-- Atualizar para plano BUSINESS
UPDATE users
SET plan = 'business'
WHERE email = 'business@vaili.test'
RETURNING id, email, plan;

-- Atualizar para plano WHITE LABEL
UPDATE users
SET plan = 'white_label'
WHERE email = 'whitelabel@vaili.test'
RETURNING id, email, plan;

-- ============================================
-- PASSO 3: Verificar os usuários criados
-- ============================================

SELECT 
  email,
  plan,
  created_at,
  CASE plan
    WHEN 'free' THEN '❌ Sem slugs customizados, sem premium'
    WHEN 'pro' THEN '✅ Slugs customizados, ❌ sem premium'
    WHEN 'business' THEN '✅ Slugs customizados, ✅ slugs premium'
    WHEN 'white_label' THEN '✅ Slugs customizados, ✅ slugs premium, ✅ domínio próprio'
  END as recursos
FROM users
WHERE email IN ('free@vaili.test', 'pro@vaili.test', 'business@vaili.test', 'whitelabel@vaili.test')
ORDER BY 
  CASE plan
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'business' THEN 3
    WHEN 'white_label' THEN 4
  END;

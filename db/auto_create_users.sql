-- ============================================
-- SCRIPT COMPLETO: Limpar e Criar Usuários Automaticamente
-- ============================================
-- COPIE TODO ESTE ARQUIVO e COLE no SQL Editor do Supabase
-- Clique em RUN apenas UMA VEZ

-- ============================================
-- PASSO 1: Limpar tudo
-- ============================================

-- Apagar todas as URLs
DELETE FROM urls;

-- Apagar todos os usuários da tabela public.users
DELETE FROM users;

-- ============================================
-- PASSO 2: Criar os 4 usuários diretamente
-- ============================================

-- Inserir os 4 usuários na tabela users
-- O trigger não funcionou, então vamos criar diretamente

-- Usuário FREE
INSERT INTO users (id, email, plan)
VALUES (
  gen_random_uuid(),
  'free@vaili.test',
  'free'
);

-- Usuário PRO
INSERT INTO users (id, email, plan)
VALUES (
  gen_random_uuid(),
  'pro@vaili.test',
  'pro'
);

-- Usuário BUSINESS
INSERT INTO users (id, email, plan)
VALUES (
  gen_random_uuid(),
  'business@vaili.test',
  'business'
);

-- Usuário WHITE LABEL
INSERT INTO users (id, email, plan)
VALUES (
  gen_random_uuid(),
  'whitelabel@vaili.test',
  'white_label'
);

-- ============================================
-- PASSO 3: Verificar resultado
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
ORDER BY 
  CASE plan
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'business' THEN 3
    WHEN 'white_label' THEN 4
  END;

-- ✅ Resultado esperado:
-- | email                  | plan        | plano           |
-- |------------------------|-------------|-----------------|
-- | free@vaili.test        | free        | 🆓 Free         |
-- | pro@vaili.test         | pro         | 💎 Pro          |
-- | business@vaili.test    | business    | 🏢 Business     |
-- | whitelabel@vaili.test  | white_label | 🎨 White Label  |

-- ⚠️ IMPORTANTE: Estes usuários NÃO terão login funcional porque não estão no auth.users
-- Eles servem apenas para TESTE de lógica de planos no código
-- Para fazer login de verdade, você precisa criar via Dashboard: Authentication → Users → Add user

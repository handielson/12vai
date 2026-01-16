-- ============================================
-- PASSO 1: Verificar usuários existentes
-- ============================================
-- Execute este script primeiro para ver quais usuários já existem

SELECT 
  email,
  plan,
  created_at
FROM users
ORDER BY created_at DESC;

-- ============================================
-- PASSO 2: Atualizar planos de usuários EXISTENTES
-- ============================================
-- Substitua os emails abaixo pelos emails dos usuários que você JÁ CRIOU

-- Se você já tem um usuário, atualize o email abaixo e descomente:
/*
-- Atualizar para FREE
UPDATE users SET plan = 'free' WHERE email = 'SEU_EMAIL_AQUI@gmail.com';

-- Atualizar para PRO
UPDATE users SET plan = 'pro' WHERE email = 'SEU_EMAIL_AQUI@gmail.com';

-- Atualizar para BUSINESS
UPDATE users SET plan = 'business' WHERE email = 'SEU_EMAIL_AQUI@gmail.com';

-- Atualizar para WHITE LABEL
UPDATE users SET plan = 'white_label' WHERE email = 'SEU_EMAIL_AQUI@gmail.com';
*/

-- ============================================
-- PASSO 3: Verificar planos atualizados
-- ============================================

SELECT 
  email,
  plan,
  CASE plan
    WHEN 'free' THEN '🆓 Free - Sem slugs customizados'
    WHEN 'pro' THEN '💎 Pro - Slugs customizados'
    WHEN 'business' THEN '🏢 Business - Slugs customizados + Premium'
    WHEN 'white_label' THEN '🎨 White Label - Todos os recursos'
  END as recursos
FROM users
ORDER BY 
  CASE plan
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'business' THEN 3
    WHEN 'white_label' THEN 4
  END;

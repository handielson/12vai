-- ============================================
-- ATUALIZAR PLANOS - Versão Específica
-- ============================================
-- Este script atualiza os planos dos 4 usuários de teste

-- Listar usuários que contêm "vaili" no email
SELECT email, plan FROM users WHERE email LIKE '%vaili%';

-- Atualizar para PRO (usuário com "pro" no email)
UPDATE users
SET plan = 'pro'
WHERE email LIKE '%pro%vaili%' OR email LIKE '%vaili%pro%';

-- Atualizar para BUSINESS (usuário com "business" no email)
UPDATE users
SET plan = 'business'
WHERE email LIKE '%business%vaili%' OR email LIKE '%vaili%business%';

-- Atualizar para WHITE LABEL (usuário com "white" ou "whitelabel" no email)
UPDATE users
SET plan = 'white_label'
WHERE email LIKE '%white%vaili%' OR email LIKE '%vaili%white%';

-- Verificar resultado
SELECT 
  email,
  plan,
  CASE plan
    WHEN 'free' THEN '🆓 Free'
    WHEN 'pro' THEN '💎 Pro'
    WHEN 'business' THEN '🏢 Business'
    WHEN 'white_label' THEN '🎨 White Label'
  END as plano
FROM users
WHERE email LIKE '%vaili%'
ORDER BY plan;

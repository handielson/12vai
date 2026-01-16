-- Script para verificar usuários e seus planos no sistema

-- 1. Listar todos os usuários e seus planos
SELECT 
  id,
  email,
  plan,
  stripe_customer_id,
  subscription_status,
  created_at
FROM users
ORDER BY created_at DESC;

-- 2. Contar usuários por plano
SELECT 
  plan,
  COUNT(*) as total_usuarios
FROM users
GROUP BY plan
ORDER BY 
  CASE plan
    WHEN 'white_label' THEN 1
    WHEN 'business' THEN 2
    WHEN 'pro' THEN 3
    WHEN 'free' THEN 4
  END;

-- 3. Verificar se existe algum usuário com plano premium (business ou white_label)
SELECT 
  id,
  email,
  plan,
  created_at
FROM users
WHERE plan IN ('business', 'white_label', 'pro')
ORDER BY created_at DESC;

-- 4. Atualizar um usuário específico para plano Business (EXEMPLO - NÃO EXECUTE SEM CONFIRMAR)
-- Substitua 'usuario@email.com' pelo email do usuário que você quer promover
/*
UPDATE users
SET plan = 'business'
WHERE email = 'usuario@email.com'
RETURNING id, email, plan;
*/

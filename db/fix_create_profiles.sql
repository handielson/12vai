-- ============================================
-- CORREÇÃO: Criar perfis para usuários existentes
-- ============================================
-- Este script cria os perfis na tabela users para os usuários que já existem no auth.users

-- Inserir perfis para TODOS os usuários do auth que ainda não têm perfil
INSERT INTO users (id, email, plan)
SELECT 
  au.id,
  au.email,
  'free' as plan
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- ✅ Perfis criados!
-- ⏭️ Agora execute step3_update_plans.sql para atualizar os planos

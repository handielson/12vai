-- =====================================================
-- CRIAR USUÁRIO ADMIN: handielson@gmail.com
-- =====================================================

-- IMPORTANTE: Execute este script no Supabase SQL Editor

-- Opção 1: Se o usuário JÁ SE CADASTROU no sistema
-- (Recomendado - mais seguro)
-- Primeiro faça o cadastro normal em http://localhost:3000
-- Depois execute este comando:

UPDATE users 
SET is_admin = true 
WHERE email = 'handielson@gmail.com';

-- Verificar se funcionou:
SELECT email, is_admin, plan, created_at 
FROM users 
WHERE email = 'handielson@gmail.com';


-- =====================================================
-- Opção 2: CRIAR USUÁRIO DIRETAMENTE (Avançado)
-- =====================================================
-- ATENÇÃO: Esta opção cria o usuário diretamente no banco
-- Só use se você não conseguir fazer o cadastro normal

-- Passo 1: Criar usuário na tabela auth.users (Supabase Auth)
-- NOTA: A senha será '@Jsj2865' mas será hasheada pelo Supabase
-- Você precisará usar a API do Supabase ou fazer o cadastro manual

-- Passo 2: Depois que o usuário for criado via cadastro normal,
-- execute o UPDATE acima para torná-lo admin


-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Ver todos os admins
SELECT 
    email,
    is_admin,
    plan,
    created_at
FROM users
WHERE is_admin = true
ORDER BY created_at DESC;

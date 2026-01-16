-- =====================================================
-- LISTAR TODOS OS USUÁRIOS CADASTRADOS
-- =====================================================

-- Ver todos os usuários do sistema
SELECT 
    id,
    email,
    is_admin,
    plan,
    created_at,
    CASE 
        WHEN is_admin THEN '👑 ADMIN'
        ELSE '👤 Usuário Normal'
    END as tipo
FROM users
ORDER BY created_at DESC;

-- =====================================================
-- TORNAR UM USUÁRIO EXISTENTE EM ADMIN
-- =====================================================

-- Copie o email de um usuário da lista acima e execute:
-- UPDATE users 
-- SET is_admin = true 
-- WHERE email = 'EMAIL_DO_USUARIO_AQUI';

-- Exemplo:
-- UPDATE users 
-- SET is_admin = true 
-- WHERE email = 'usuario@exemplo.com';

-- =====================================================
-- VERIFICAR USUÁRIOS ADMIN
-- =====================================================

SELECT 
    email,
    is_admin,
    plan,
    created_at
FROM users
WHERE is_admin = true;

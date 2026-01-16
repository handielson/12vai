-- =====================================================
-- CONSULTAR USUÁRIOS ADMIN
-- =====================================================

-- Ver todos os usuários admin
SELECT 
    id,
    email,
    is_admin,
    created_at,
    plan
FROM users
WHERE is_admin = true
ORDER BY created_at DESC;

-- =====================================================
-- TORNAR UM USUÁRIO ADMIN
-- =====================================================

-- Substitua 'seu-email@exemplo.com' pelo email do usuário
-- UPDATE users 
-- SET is_admin = true 
-- WHERE email = 'seu-email@exemplo.com';

-- =====================================================
-- CRIAR UM NOVO USUÁRIO ADMIN (se não existir)
-- =====================================================

-- IMPORTANTE: Este usuário precisa primeiro fazer o cadastro
-- no sistema através da tela de registro. Depois execute:

-- UPDATE users 
-- SET is_admin = true 
-- WHERE email = 'admin@vaiencurta.com.br';

-- =====================================================
-- VERIFICAR TODOS OS USUÁRIOS (admin e não-admin)
-- =====================================================

SELECT 
    email,
    is_admin,
    plan,
    created_at,
    CASE 
        WHEN is_admin THEN '👑 ADMIN'
        ELSE '👤 Usuário'
    END as tipo
FROM users
ORDER BY is_admin DESC, created_at DESC;

-- =====================================================
-- ADICIONAR FUNCIONALIDADE DE BLOQUEIO DE USUÁRIOS
-- =====================================================

-- Passo 1: Adicionar campo is_blocked
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Passo 2: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);

-- Passo 3: Atualizar comentário da coluna
COMMENT ON COLUMN users.is_blocked IS 'Indica se o usuário está bloqueado e não pode fazer login';

-- Passo 4: Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('is_blocked', 'is_admin', 'email')
ORDER BY ordinal_position;

-- Passo 5: Testar - marcar um usuário como bloqueado (exemplo)
-- UPDATE users 
-- SET is_blocked = true 
-- WHERE email = 'teste@exemplo.com';

-- Passo 6: Ver usuários bloqueados
SELECT 
    email,
    is_admin,
    is_blocked,
    plan,
    created_at
FROM users
WHERE is_blocked = true;

-- Passo 7: Ver todos os usuários com status de bloqueio
SELECT 
    email,
    is_admin,
    is_blocked,
    CASE 
        WHEN is_blocked THEN '🔒 Bloqueado'
        ELSE '✅ Ativo'
    END as status,
    plan
FROM users
ORDER BY is_blocked DESC, created_at DESC;

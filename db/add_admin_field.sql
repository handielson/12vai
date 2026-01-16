-- Adicionar campo is_admin à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN users.is_admin IS 'Indica se o usuário tem privilégios de administrador';

-- Criar um usuário admin de exemplo
-- Você pode executar isso depois de criar o usuário via interface:
-- UPDATE users SET is_admin = TRUE WHERE email = 'admin@vai.li';

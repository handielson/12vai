-- Adicionar campo custom_url_limit à tabela users
-- Permite que o admin defina um limite personalizado para cada usuário

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS custom_url_limit INTEGER DEFAULT NULL;

COMMENT ON COLUMN users.custom_url_limit IS 'Limite personalizado de URLs definido pelo admin. NULL = usar limite do plano';

-- Exemplos de uso:
-- UPDATE users SET custom_url_limit = 500 WHERE email = 'cliente-especial@example.com';
-- UPDATE users SET custom_url_limit = NULL WHERE email = 'cliente@example.com'; -- volta ao limite do plano

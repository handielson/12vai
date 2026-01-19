-- Migration 009: Adicionar campo password_hint e renomear password_hash
-- Adiciona dica de senha e renomeia campo para melhor semântica

-- Adicionar campo password_hint à tabela urls
ALTER TABLE urls 
ADD COLUMN IF NOT EXISTS password_hint TEXT;

COMMENT ON COLUMN urls.password_hint IS 'Dica opcional para lembrar a senha do link';

-- Renomear password_hash para password (mais semântico e armazenará texto plano)
-- Nota: Se a coluna já se chamar 'password', esta linha falhará silenciosamente
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'urls' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE urls RENAME COLUMN password_hash TO password;
    END IF;
END $$;

COMMENT ON COLUMN urls.password IS 'Senha de proteção do link (texto plano para UX)';

-- Verificar estrutura atualizada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'urls' 
    AND column_name IN ('password', 'password_hint', 'password_hash')
ORDER BY column_name;

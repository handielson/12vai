-- Migration 008: Adicionar proteção por senha aos planos
-- Adiciona campo allow_password_protection à tabela plans

ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS allow_password_protection BOOLEAN DEFAULT false;

COMMENT ON COLUMN plans.allow_password_protection IS 'Permite criar links protegidos por senha';

-- Configurar quais planos têm acesso à proteção por senha
-- CONFIGURAÇÃO: Pro, Business e White Label têm acesso
UPDATE plans 
SET allow_password_protection = true 
WHERE name IN ('pro', 'business', 'white_label');

-- Plano Free não tem acesso (incentiva upgrade)
UPDATE plans 
SET allow_password_protection = false 
WHERE name = 'free';

-- Verificar resultado
SELECT 
    name,
    allow_password_protection,
    allow_custom_slug,
    allow_premium_slug,
    allow_qr_code
FROM plans
ORDER BY 
    CASE name
        WHEN 'free' THEN 1
        WHEN 'pro' THEN 2
        WHEN 'business' THEN 3
        WHEN 'white_label' THEN 4
    END;

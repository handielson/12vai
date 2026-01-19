-- Script completo para configurar proteção por senha e corrigir terminologia

-- ========================================
-- 1. Adicionar proteção por senha aos planos
-- ========================================

ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS allow_password_protection BOOLEAN DEFAULT false;

COMMENT ON COLUMN plans.allow_password_protection IS 'Permite criar links protegidos por senha';

UPDATE plans 
SET allow_password_protection = true 
WHERE name IN ('pro', 'business', 'white_label');

UPDATE plans 
SET allow_password_protection = false 
WHERE name = 'free';

-- ========================================
-- 2. Adicionar campo password_hint às URLs
-- ========================================

ALTER TABLE urls 
ADD COLUMN IF NOT EXISTS password_hint TEXT;

COMMENT ON COLUMN urls.password_hint IS 'Dica opcional para lembrar a senha do link';

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

-- ========================================
-- 3. Adicionar proteção por senha ao plan_settings
-- ========================================

ALTER TABLE plan_settings
ADD COLUMN IF NOT EXISTS allow_password_protection BOOLEAN DEFAULT false;

COMMENT ON COLUMN plan_settings.allow_password_protection IS 'Permite criar links protegidos por senha';

UPDATE plan_settings
SET allow_password_protection = true
WHERE plan_name IN ('pro', 'business', 'white_label');

UPDATE plan_settings
SET allow_password_protection = false
WHERE plan_name = 'free';

-- ========================================
-- 4. Corrigir terminologia: Lesmas → Slugs
-- ========================================

-- Atualizar features que são JSONB arrays
UPDATE plan_settings
SET features = (
    SELECT jsonb_agg(
        CASE 
            WHEN value::text = '"Lesmas Personalizadas"' THEN '"Slugs Personalizados"'::jsonb
            WHEN value::text = '"Lesmas Premium"' THEN '"Slugs Premium"'::jsonb
            WHEN value::text = '"Lesmas personalizadas"' THEN '"Slugs personalizados"'::jsonb
            WHEN value::text = '"Lesmas premium"' THEN '"Slugs premium"'::jsonb
            ELSE value
        END
    )
    FROM jsonb_array_elements(features)
)
WHERE features::text LIKE '%Lesmas%';

-- ========================================
-- 5. Verificação
-- ========================================

-- Verificar planos
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

-- Verificar plan_settings
SELECT 
    plan_name,
    allow_password_protection,
    allow_custom_slugs,
    allow_premium_slugs,
    features
FROM plan_settings
ORDER BY monthly_price;

-- Verificar estrutura da tabela urls
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'urls' 
    AND column_name IN ('password', 'password_hint', 'password_hash')
ORDER BY column_name;

-- ================================================
-- SETUP COMPLETO: Admin Features - VAI.li SaaS
-- ================================================
-- Execute este SQL no Supabase SQL Editor para
-- habilitar todas as funcionalidades administrativas
-- ================================================

-- 1. Adicionar campo is_admin
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN users.is_admin IS 'Indica se o usuário tem permissões de administrador';

-- 2. Adicionar campo custom_url_limit
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS custom_url_limit INTEGER DEFAULT NULL;

COMMENT ON COLUMN users.custom_url_limit IS 'Limite personalizado de URLs definido pelo admin. NULL = usar limite do plano';

-- 3. Criar tabela de configurações de planos
CREATE TABLE IF NOT EXISTS plan_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name VARCHAR(50) UNIQUE NOT NULL,
  url_limit INTEGER,
  allow_custom_slugs BOOLEAN DEFAULT FALSE,
  allow_premium_slugs BOOLEAN DEFAULT FALSE,
  monthly_price DECIMAL(10,2) DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Inserir configurações iniciais dos planos
INSERT INTO plan_settings (plan_name, url_limit, allow_custom_slugs, allow_premium_slugs, monthly_price, features) VALUES
('free', 10, FALSE, FALSE, 0, '["Analytics básico", "QR Codes"]'::jsonb),
('pro', 100, TRUE, FALSE, 29.90, '["Analytics avançado", "Slugs personalizados", "QR Codes", "Suporte prioritário"]'::jsonb),
('business', NULL, TRUE, TRUE, 99.90, '["Tudo do Pro", "Slugs premium", "URLs ilimitadas", "API access", "White label"]'::jsonb)
ON CONFLICT (plan_name) DO NOTHING;

-- 5. Tornar o usuário business@vaili.test admin
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'business@vaili.test';

-- ================================================
-- VERIFICAÇÃO
-- ================================================

-- Verificar admins
SELECT email, is_admin, custom_url_limit 
FROM users 
WHERE is_admin = TRUE;

-- Verificar configurações de planos
SELECT * FROM plan_settings ORDER BY monthly_price;

-- ================================================
-- SUCESSO!
-- ================================================
-- Agora você pode:
-- 1. Acessar o Admin Panel
-- 2. Editar planos de usuários
-- 3. Definir limites personalizados
-- 4. Configurar métricas de planos
-- 5. Usar preview de planos
-- 6. Impersonar usuários
-- ================================================

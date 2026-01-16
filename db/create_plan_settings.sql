-- Criar tabela de configurações de planos
CREATE TABLE IF NOT EXISTS plan_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name VARCHAR(50) UNIQUE NOT NULL,
  url_limit INTEGER, -- NULL = ilimitado
  allow_custom_slugs BOOLEAN DEFAULT FALSE,
  allow_premium_slugs BOOLEAN DEFAULT FALSE,
  monthly_price DECIMAL(10,2) DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir configurações iniciais
INSERT INTO plan_settings (plan_name, url_limit, allow_custom_slugs, allow_premium_slugs, monthly_price, features) VALUES
('free', 10, FALSE, FALSE, 0, '["Analytics básico", "QR Codes"]'::jsonb),
('pro', 100, TRUE, FALSE, 29.90, '["Analytics avançado", "Slugs personalizados", "QR Codes", "Suporte prioritário"]'::jsonb),
('business', NULL, TRUE, TRUE, 99.90, '["Tudo do Pro", "Slugs premium", "URLs ilimitadas", "API access", "White label"]'::jsonb)
ON CONFLICT (plan_name) DO NOTHING;

-- Verificar dados
SELECT * FROM plan_settings ORDER BY monthly_price;

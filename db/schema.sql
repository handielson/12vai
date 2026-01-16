-- VAI.li Database Schema
-- Encurtador de URLs com Sistema de Monetizacao

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'white_label')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de planos
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  max_urls INTEGER,
  max_clicks_per_month INTEGER,
  allow_custom_slug BOOLEAN DEFAULT false,
  allow_premium_slug BOOLEAN DEFAULT false,
  allow_custom_domain BOOLEAN DEFAULT false,
  allow_analytics BOOLEAN DEFAULT true,
  allow_qr_code BOOLEAN DEFAULT false,
  price_monthly_usd DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO plans (name, max_urls, max_clicks_per_month, allow_custom_slug, allow_premium_slug, allow_custom_domain, allow_qr_code, price_monthly_usd)
VALUES 
  ('free', 10, 1000, false, false, false, false, 0),
  ('pro', 100, 50000, true, false, false, true, 29),
  ('business', NULL, NULL, true, true, false, true, 99),
  ('white_label', NULL, NULL, true, true, true, true, 299)
ON CONFLICT (name) DO NOTHING;

-- Tabela de URLs
CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_slug TEXT UNIQUE NOT NULL,
  prefix TEXT NOT NULL DEFAULT 'vai',
  title TEXT,
  description TEXT,
  is_premium BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
CREATE INDEX IF NOT EXISTS idx_urls_short_slug ON urls(short_slug);
CREATE INDEX IF NOT EXISTS idx_urls_active ON urls(active);
CREATE INDEX IF NOT EXISTS idx_urls_expires_at ON urls(expires_at) WHERE expires_at IS NOT NULL;

-- Tabela de cliques
CREATE TABLE IF NOT EXISTS clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_id UUID NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON clicks(url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks(country);
CREATE INDEX IF NOT EXISTS idx_clicks_device_type ON clicks(device_type);

-- Tabela de slugs reservados
CREATE TABLE IF NOT EXISTS reserved_slugs (
  slug TEXT PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO reserved_slugs (slug, reason)
VALUES 
  ('admin', 'Sistema'),
  ('api', 'Sistema'),
  ('auth', 'Sistema'),
  ('login', 'Sistema'),
  ('logout', 'Sistema'),
  ('dashboard', 'Sistema'),
  ('painel', 'Sistema'),
  ('docs', 'Sistema'),
  ('suporte', 'Sistema'),
  ('config', 'Sistema'),
  ('settings', 'Sistema'),
  ('billing', 'Sistema'),
  ('pricing', 'Sistema')
ON CONFLICT (slug) DO NOTHING;

-- Tabela de slugs premium
CREATE TABLE IF NOT EXISTS premium_slugs (
  slug TEXT PRIMARY KEY,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO premium_slugs (slug, category)
VALUES 
  ('pix', 'Pagamento'),
  ('oferta', 'Vendas'),
  ('promo', 'Vendas'),
  ('loja', 'Vendas'),
  ('site', 'Geral'),
  ('zap', 'Comunicacao'),
  ('whatsapp', 'Comunicacao'),
  ('catalogo', 'Vendas'),
  ('bio', 'Social'),
  ('cupom', 'Vendas'),
  ('desconto', 'Vendas'),
  ('pagar', 'Pagamento'),
  ('venda', 'Vendas'),
  ('comprar', 'Vendas'),
  ('link', 'Geral')
ON CONFLICT (slug) DO NOTHING;

-- Funcoes auxiliares
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urls_updated_at
  BEFORE UPDATE ON urls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION increment_url_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE urls SET clicks_count = clicks_count + 1 WHERE id = NEW.url_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_clicks_on_insert
  AFTER INSERT ON clicks
  FOR EACH ROW
  EXECUTE FUNCTION increment_url_clicks();

CREATE OR REPLACE FUNCTION get_clicks_by_device(user_id_param UUID)
RETURNS TABLE(device TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.device_type, 'Unknown') as device,
    COUNT(*) as count
  FROM clicks c
  JOIN urls u ON c.url_id = u.id
  WHERE u.user_id = user_id_param
  GROUP BY c.device_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_clicks_by_browser(user_id_param UUID)
RETURNS TABLE(browser TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.browser, 'Unknown') as browser,
    COUNT(*) as count
  FROM clicks c
  JOIN urls u ON c.url_id = u.id
  WHERE u.user_id = user_id_param
  GROUP BY c.browser
  ORDER BY count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_clicks_by_day(user_id_param UUID, days INTEGER DEFAULT 30)
RETURNS TABLE(date DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(c.created_at) as date,
    COUNT(*) as count
  FROM clicks c
  JOIN urls u ON c.url_id = u.id
  WHERE u.user_id = user_id_param
    AND c.created_at >= NOW() - (days || ' days')::INTERVAL
  GROUP BY DATE(c.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own urls"
  ON urls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create urls"
  ON urls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own urls"
  ON urls FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own urls"
  ON urls FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view clicks from own urls"
  ON clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM urls
      WHERE urls.id = clicks.url_id
      AND urls.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert clicks"
  ON clicks FOR INSERT
  WITH CHECK (true);

-- View de estatisticas
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id as user_id,
  u.email,
  u.plan,
  COUNT(DISTINCT urls.id) as total_urls,
  COUNT(DISTINCT CASE WHEN urls.active THEN urls.id END) as active_urls,
  COALESCE(SUM(urls.clicks_count), 0) as total_clicks,
  MAX(urls.created_at) as last_url_created
FROM users u
LEFT JOIN urls ON urls.user_id = u.id
GROUP BY u.id, u.email, u.plan;

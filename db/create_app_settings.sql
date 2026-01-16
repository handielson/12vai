-- Criar tabela de configurações da aplicação
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Inserir configuração de modo de manutenção
INSERT INTO app_settings (key, value) 
VALUES ('maintenance_mode', '{"enabled": false, "message": "Estamos em manutenção. Voltaremos em breve!"}')
ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ler configurações
CREATE POLICY "Anyone can read settings" ON app_settings
  FOR SELECT USING (true);

-- Policy: Apenas admins podem atualizar
CREATE POLICY "Only admins can update settings" ON app_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Comentários
COMMENT ON TABLE app_settings IS 'Configurações globais da aplicação';
COMMENT ON COLUMN app_settings.key IS 'Chave única da configuração';
COMMENT ON COLUMN app_settings.value IS 'Valor da configuração em formato JSON';
COMMENT ON COLUMN app_settings.updated_at IS 'Data da última atualização';
COMMENT ON COLUMN app_settings.updated_by IS 'ID do usuário que fez a última atualização';

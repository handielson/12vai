-- Adicionar campo de configuração de QR Code na tabela urls
ALTER TABLE urls 
ADD COLUMN IF NOT EXISTS qr_config JSONB DEFAULT NULL;

-- Comentário explicativo
COMMENT ON COLUMN urls.qr_config IS 'Configurações de personalização do QR Code (cores, logo, estilo)';

-- Exemplo de estrutura do JSON:
-- {
--   "foregroundColor": "#000000",
--   "backgroundColor": "#FFFFFF",
--   "logoUrl": "https://...",
--   "logoSize": 0.3,
--   "dotsStyle": "rounded",
--   "cornersStyle": "extra-rounded",
--   "margin": 10,
--   "size": 300
-- }

-- Verificar a estrutura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'urls' AND column_name = 'qr_config';

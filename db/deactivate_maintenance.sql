-- Desativar modo de manutenção
UPDATE app_settings 
SET value = '{"enabled": false, "message": "Estamos em manutenção. Voltaremos em breve!"}'
WHERE key = 'maintenance_mode';

-- Verificar se foi atualizado
SELECT * FROM app_settings WHERE key = 'maintenance_mode';

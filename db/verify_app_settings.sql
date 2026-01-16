-- Verificar se a tabela app_settings existe e tem dados
SELECT * FROM app_settings WHERE key = 'maintenance_mode';

-- Se não retornar nada, executar:
-- INSERT INTO app_settings (key, value) 
-- VALUES ('maintenance_mode', '{"enabled": false, "message": "Estamos em manutenção. Voltaremos em breve!"}');

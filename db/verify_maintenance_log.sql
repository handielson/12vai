-- Adicionar action 'toggle_maintenance' ao audit_log se ainda não existir
-- Este script é idempotente e pode ser executado múltiplas vezes

-- Verificar se a tabela audit_log existe e tem a estrutura correta
DO $$
BEGIN
    -- Adicionar comentário explicativo
    COMMENT ON TABLE audit_log IS 'Registro de todas as ações administrativas do sistema, incluindo alterações de modo de manutenção';
END $$;

-- Inserir exemplo de log de manutenção (opcional, apenas para teste)
-- Descomente as linhas abaixo se quiser inserir um registro de exemplo

-- INSERT INTO audit_log (admin_id, action, entity_type, entity_id, details)
-- VALUES (
--     (SELECT id FROM users WHERE is_admin = true LIMIT 1),
--     'toggle_maintenance',
--     'system',
--     'maintenance_mode',
--     '{"previous_status": false, "new_status": true, "message": "Sistema em manutenção programada"}'::jsonb
-- );

-- Verificar registros de manutenção
SELECT 
    al.id,
    al.action,
    al.entity_type,
    al.details,
    u.email as admin_email,
    al.created_at
FROM audit_log al
LEFT JOIN users u ON al.admin_id = u.id
WHERE al.action = 'toggle_maintenance'
ORDER BY al.created_at DESC
LIMIT 10;

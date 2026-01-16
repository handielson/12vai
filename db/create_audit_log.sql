-- =====================================================
-- CRIAR TABELA AUDIT_LOG
-- Registro de todas as ações administrativas do sistema
-- =====================================================

-- 1. Criar a tabela audit_log
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON public.audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);

-- 3. Adicionar comentários
COMMENT ON TABLE public.audit_log IS 'Registro de auditoria de todas as ações administrativas';
COMMENT ON COLUMN public.audit_log.admin_id IS 'ID do administrador que executou a ação';
COMMENT ON COLUMN public.audit_log.action IS 'Tipo de ação executada (edit_user_plan, toggle_maintenance, etc)';
COMMENT ON COLUMN public.audit_log.entity_type IS 'Tipo de entidade afetada (user, system, plan, etc)';
COMMENT ON COLUMN public.audit_log.entity_id IS 'ID da entidade afetada';
COMMENT ON COLUMN public.audit_log.details IS 'Detalhes adicionais da ação em formato JSON';

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de acesso
-- Apenas admins podem visualizar logs
CREATE POLICY "Admins podem visualizar audit logs"
    ON public.audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
    );

-- Apenas admins podem inserir logs
CREATE POLICY "Admins podem inserir audit logs"
    ON public.audit_log
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
    );

-- Ninguém pode atualizar ou deletar logs (imutabilidade)
CREATE POLICY "Audit logs são imutáveis"
    ON public.audit_log
    FOR UPDATE
    USING (false);

CREATE POLICY "Audit logs não podem ser deletados"
    ON public.audit_log
    FOR DELETE
    USING (false);

-- 6. Criar view para facilitar consultas com informações do admin
CREATE OR REPLACE VIEW public.audit_log_with_admin AS
SELECT 
    al.id,
    al.admin_id,
    u.email as admin_email,
    al.action,
    al.entity_type,
    al.entity_id,
    al.details,
    al.created_at
FROM public.audit_log al
LEFT JOIN public.users u ON al.admin_id = u.id;

-- 7. Conceder permissões na view
GRANT SELECT ON public.audit_log_with_admin TO authenticated;

-- 8. Verificar criação
SELECT 
    'audit_log' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as last_entry
FROM public.audit_log;

-- 9. Exemplo de uso (comentado)
-- INSERT INTO public.audit_log (admin_id, action, entity_type, entity_id, details)
-- VALUES (
--     auth.uid(),
--     'toggle_maintenance',
--     'system',
--     'maintenance_mode',
--     '{"previous_status": false, "new_status": true, "message": "Manutenção programada"}'::jsonb
-- );

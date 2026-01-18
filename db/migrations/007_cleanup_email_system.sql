-- =====================================================
-- LIMPAR SISTEMA DE EMAIL (se já existir)
-- =====================================================
-- Execute este script ANTES de rodar 007_create_email_system.sql
-- =====================================================

-- Remover políticas RLS
DROP POLICY IF EXISTS "Usuários veem suas próprias preferências" ON email_preferences;
DROP POLICY IF EXISTS "Usuários podem atualizar suas preferências" ON email_preferences;
DROP POLICY IF EXISTS "Sistema pode inserir preferências" ON email_preferences;
DROP POLICY IF EXISTS "Admins veem todas as preferências" ON email_preferences;
DROP POLICY IF EXISTS "Usuários veem seus próprios logs" ON email_logs;
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON email_logs;
DROP POLICY IF EXISTS "Admins veem todos os logs" ON email_logs;

-- Remover trigger
DROP TRIGGER IF EXISTS trigger_create_email_preferences ON auth.users;

-- Remover funções
DROP FUNCTION IF EXISTS create_default_email_preferences();
DROP FUNCTION IF EXISTS get_email_preferences(UUID);
DROP FUNCTION IF EXISTS update_email_preferences(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS can_send_email(UUID, TEXT);
DROP FUNCTION IF EXISTS log_email_sent(UUID, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS update_email_status(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_email_stats(UUID);

-- Remover tabelas
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_preferences CASCADE;

-- Remover ENUMs
DROP TYPE IF EXISTS email_type CASCADE;
DROP TYPE IF EXISTS email_status CASCADE;
DROP TYPE IF EXISTS report_frequency CASCADE;

-- Verificação
SELECT '✅ Sistema de email limpo com sucesso!' as status;

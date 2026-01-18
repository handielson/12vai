-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES POR EMAIL
-- =====================================================
-- Migration: 007_create_email_system.sql
-- Descrição: Sistema de preferências e logs de emails
-- =====================================================

-- =====================================================
-- ENUM: email_type
-- =====================================================
CREATE TYPE email_type AS ENUM (
    'welcome',
    'weekly_report',
    'limit_alert',
    'expiry_alert',
    'upgrade_confirmation',
    'click_alert'
);

-- =====================================================
-- ENUM: email_status
-- =====================================================
CREATE TYPE email_status AS ENUM (
    'sent',
    'delivered',
    'opened',
    'clicked',
    'failed',
    'bounced'
);

-- =====================================================
-- ENUM: report_frequency
-- =====================================================
CREATE TYPE report_frequency AS ENUM (
    'daily',
    'weekly',
    'monthly',
    'never'
);

-- =====================================================
-- TABELA: email_preferences
-- Preferências de notificações por usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Preferências por tipo
    welcome_emails BOOLEAN NOT NULL DEFAULT true,
    weekly_reports BOOLEAN NOT NULL DEFAULT true,
    click_alerts BOOLEAN NOT NULL DEFAULT false,
    limit_alerts BOOLEAN NOT NULL DEFAULT true,
    expiry_alerts BOOLEAN NOT NULL DEFAULT true,
    upgrade_confirmations BOOLEAN NOT NULL DEFAULT true,
    
    -- Frequência de relatórios
    report_frequency report_frequency NOT NULL DEFAULT 'weekly',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: um registro por usuário
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

-- =====================================================
-- TABELA: email_logs
-- Histórico de emails enviados
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Informações do email
    email_type email_type NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    
    -- Status e tracking
    status email_status NOT NULL DEFAULT 'sent',
    resend_id TEXT, -- ID do Resend para tracking
    
    -- Métricas
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB -- Dados adicionais (links, stats, etc)
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- =====================================================
-- FUNÇÃO: Criar preferências padrão para novo usuário
-- =====================================================
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO email_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Trigger para criar preferências ao criar usuário
CREATE TRIGGER trigger_create_email_preferences
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_email_preferences();

-- =====================================================
-- FUNÇÃO: Obter preferências de email do usuário
-- =====================================================
CREATE OR REPLACE FUNCTION get_email_preferences(p_user_id UUID)
RETURNS TABLE (
    welcome_emails BOOLEAN,
    weekly_reports BOOLEAN,
    click_alerts BOOLEAN,
    limit_alerts BOOLEAN,
    expiry_alerts BOOLEAN,
    upgrade_confirmations BOOLEAN,
    report_frequency TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ep.welcome_emails,
        ep.weekly_reports,
        ep.click_alerts,
        ep.limit_alerts,
        ep.expiry_alerts,
        ep.upgrade_confirmations,
        ep.report_frequency::TEXT
    FROM email_preferences ep
    WHERE ep.user_id = p_user_id;
    
    -- Se não existir, retornar defaults
    IF NOT FOUND THEN
        RETURN QUERY SELECT true, true, false, true, true, true, 'weekly'::TEXT;
    END IF;
END;
$$;

-- =====================================================
-- FUNÇÃO: Atualizar preferências de email
-- =====================================================
CREATE OR REPLACE FUNCTION update_email_preferences(
    p_user_id UUID,
    p_welcome_emails BOOLEAN DEFAULT NULL,
    p_weekly_reports BOOLEAN DEFAULT NULL,
    p_click_alerts BOOLEAN DEFAULT NULL,
    p_limit_alerts BOOLEAN DEFAULT NULL,
    p_expiry_alerts BOOLEAN DEFAULT NULL,
    p_upgrade_confirmations BOOLEAN DEFAULT NULL,
    p_report_frequency TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO email_preferences (
        user_id,
        welcome_emails,
        weekly_reports,
        click_alerts,
        limit_alerts,
        expiry_alerts,
        upgrade_confirmations,
        report_frequency
    ) VALUES (
        p_user_id,
        COALESCE(p_welcome_emails, true),
        COALESCE(p_weekly_reports, true),
        COALESCE(p_click_alerts, false),
        COALESCE(p_limit_alerts, true),
        COALESCE(p_expiry_alerts, true),
        COALESCE(p_upgrade_confirmations, true),
        COALESCE(p_report_frequency::report_frequency, 'weekly')
    )
    ON CONFLICT (user_id) DO UPDATE SET
        welcome_emails = COALESCE(p_welcome_emails, email_preferences.welcome_emails),
        weekly_reports = COALESCE(p_weekly_reports, email_preferences.weekly_reports),
        click_alerts = COALESCE(p_click_alerts, email_preferences.click_alerts),
        limit_alerts = COALESCE(p_limit_alerts, email_preferences.limit_alerts),
        expiry_alerts = COALESCE(p_expiry_alerts, email_preferences.expiry_alerts),
        upgrade_confirmations = COALESCE(p_upgrade_confirmations, email_preferences.upgrade_confirmations),
        report_frequency = COALESCE(p_report_frequency::report_frequency, email_preferences.report_frequency),
        updated_at = NOW();
    
    RETURN true;
END;
$$;

-- =====================================================
-- FUNÇÃO: Verificar se pode enviar email
-- =====================================================
CREATE OR REPLACE FUNCTION can_send_email(
    p_user_id UUID,
    p_email_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_preferences RECORD;
BEGIN
    SELECT * INTO v_preferences
    FROM email_preferences
    WHERE user_id = p_user_id;
    
    -- Se não tem preferências, permitir (defaults)
    IF NOT FOUND THEN
        RETURN true;
    END IF;
    
    -- Verificar preferência específica
    RETURN CASE p_email_type
        WHEN 'welcome' THEN v_preferences.welcome_emails
        WHEN 'weekly_report' THEN v_preferences.weekly_reports
        WHEN 'click_alert' THEN v_preferences.click_alerts
        WHEN 'limit_alert' THEN v_preferences.limit_alerts
        WHEN 'expiry_alert' THEN v_preferences.expiry_alerts
        WHEN 'upgrade_confirmation' THEN v_preferences.upgrade_confirmations
        ELSE true
    END;
END;
$$;

-- =====================================================
-- FUNÇÃO: Registrar envio de email
-- =====================================================
CREATE OR REPLACE FUNCTION log_email_sent(
    p_user_id UUID,
    p_email_type TEXT,
    p_recipient TEXT,
    p_subject TEXT,
    p_resend_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO email_logs (
        user_id,
        email_type,
        recipient,
        subject,
        resend_id,
        metadata,
        status
    ) VALUES (
        p_user_id,
        p_email_type::email_type,
        p_recipient,
        p_subject,
        p_resend_id,
        p_metadata,
        'sent'
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- =====================================================
-- FUNÇÃO: Atualizar status de email
-- =====================================================
CREATE OR REPLACE FUNCTION update_email_status(
    p_resend_id TEXT,
    p_status TEXT,
    p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE email_logs
    SET 
        status = p_status::email_status,
        error_message = p_error_message,
        delivered_at = CASE WHEN p_status = 'delivered' THEN NOW() ELSE delivered_at END,
        opened_at = CASE WHEN p_status = 'opened' THEN NOW() ELSE opened_at END,
        clicked_at = CASE WHEN p_status = 'clicked' THEN NOW() ELSE clicked_at END,
        failed_at = CASE WHEN p_status = 'failed' THEN NOW() ELSE failed_at END
    WHERE resend_id = p_resend_id;
    
    RETURN FOUND;
END;
$$;

-- =====================================================
-- FUNÇÃO: Obter estatísticas de emails
-- =====================================================
CREATE OR REPLACE FUNCTION get_email_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_sent BIGINT,
    total_delivered BIGINT,
    total_opened BIGINT,
    total_clicked BIGINT,
    total_failed BIGINT,
    open_rate NUMERIC,
    click_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(*) as sent,
            COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
            COUNT(*) FILTER (WHERE status = 'opened' OR opened_at IS NOT NULL) as opened,
            COUNT(*) FILTER (WHERE status = 'clicked' OR clicked_at IS NOT NULL) as clicked,
            COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM email_logs
        WHERE p_user_id IS NULL OR user_id = p_user_id
    )
    SELECT 
        sent,
        delivered,
        opened,
        clicked,
        failed,
        CASE WHEN delivered > 0 THEN ROUND((opened::NUMERIC / delivered) * 100, 2) ELSE 0 END,
        CASE WHEN opened > 0 THEN ROUND((clicked::NUMERIC / opened) * 100, 2) ELSE 0 END
    FROM stats;
END;
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policies para email_preferences
CREATE POLICY "Usuários veem suas próprias preferências"
    ON email_preferences FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas preferências"
    ON email_preferences FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Sistema pode inserir preferências"
    ON email_preferences FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins veem todas as preferências"
    ON email_preferences FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Policies para email_logs
CREATE POLICY "Usuários veem seus próprios logs"
    ON email_logs FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Sistema pode inserir logs"
    ON email_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins veem todos os logs"
    ON email_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT '✅ SISTEMA DE EMAIL CRIADO COM SUCESSO!' as status;
SELECT 'Tabelas: email_preferences, email_logs' as info;
SELECT 'Funções: get_email_preferences, update_email_preferences, can_send_email, log_email_sent, update_email_status, get_email_stats' as functions;

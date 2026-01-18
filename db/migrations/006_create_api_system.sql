-- =====================================================
-- SISTEMA DE API PÚBLICA - VaiEncurta
-- =====================================================
-- Migration: 006_create_api_system.sql
-- Descrição: Sistema completo de API com autenticação e rate limiting
-- =====================================================

-- =====================================================
-- TABELA: api_keys
-- Armazena chaves de API dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL, -- vai_live_ ou vai_test_
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT true,
    
    -- Índices
    CONSTRAINT idx_user_api_keys UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(active);

-- =====================================================
-- TABELA: api_requests
-- Rastreia requisições da API para analytics e rate limiting
-- =====================================================
CREATE TABLE IF NOT EXISTS api_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_requests_api_key_id ON api_requests(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_user_id ON api_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_created_at ON api_requests(created_at);

-- =====================================================
-- FUNÇÃO: Validar API Key
-- =====================================================
CREATE OR REPLACE FUNCTION validate_api_key(p_key_hash TEXT)
RETURNS TABLE (
    valid BOOLEAN,
    user_id UUID,
    api_key_id UUID,
    plan_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_key_record RECORD;
BEGIN
    -- Buscar chave ativa
    SELECT 
        ak.id,
        ak.user_id,
        ak.active,
        ak.expires_at,
        u.plan_type
    INTO v_key_record
    FROM api_keys ak
    JOIN users u ON u.id = ak.user_id
    WHERE ak.key_hash = p_key_hash
    AND ak.active = true;
    
    -- Verificar se encontrou
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;
    
    -- Verificar expiração
    IF v_key_record.expires_at IS NOT NULL AND v_key_record.expires_at < NOW() THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;
    
    -- Atualizar último uso
    UPDATE api_keys
    SET last_used_at = NOW()
    WHERE id = v_key_record.id;
    
    -- Retornar válido
    RETURN QUERY SELECT 
        true,
        v_key_record.user_id,
        v_key_record.id,
        v_key_record.plan_type;
END;
$$;

-- =====================================================
-- FUNÇÃO: Verificar Rate Limit
-- =====================================================
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_plan_type TEXT
)
RETURNS TABLE (
    allowed BOOLEAN,
    limit_per_hour INTEGER,
    current_count INTEGER,
    reset_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_limit INTEGER;
    v_count INTEGER;
    v_reset_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Definir limites por plano
    v_limit := CASE p_plan_type
        WHEN 'free' THEN 100
        WHEN 'pro' THEN 1000
        WHEN 'business' THEN 10000
        WHEN 'white_label' THEN 999999
        ELSE 100
    END;
    
    -- Calcular tempo de reset (próxima hora cheia)
    v_reset_time := date_trunc('hour', NOW()) + interval '1 hour';
    
    -- Contar requisições na última hora
    SELECT COUNT(*)
    INTO v_count
    FROM api_requests
    WHERE user_id = p_user_id
    AND created_at >= date_trunc('hour', NOW());
    
    -- Retornar resultado
    RETURN QUERY SELECT 
        (v_count < v_limit),
        v_limit,
        v_count::INTEGER,
        v_reset_time;
END;
$$;

-- =====================================================
-- FUNÇÃO: Registrar Requisição da API
-- =====================================================
CREATE OR REPLACE FUNCTION log_api_request(
    p_api_key_id UUID,
    p_user_id UUID,
    p_endpoint TEXT,
    p_method TEXT,
    p_status_code INTEGER,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_request_id UUID;
BEGIN
    INSERT INTO api_requests (
        api_key_id,
        user_id,
        endpoint,
        method,
        status_code,
        response_time_ms,
        ip_address,
        user_agent,
        error_message
    ) VALUES (
        p_api_key_id,
        p_user_id,
        p_endpoint,
        p_method,
        p_status_code,
        p_response_time_ms,
        p_ip_address,
        p_user_agent,
        p_error_message
    )
    RETURNING id INTO v_request_id;
    
    RETURN v_request_id;
END;
$$;

-- =====================================================
-- FUNÇÃO: Obter Estatísticas de API do Usuário
-- =====================================================
CREATE OR REPLACE FUNCTION get_api_stats(p_user_id UUID)
RETURNS TABLE (
    total_requests BIGINT,
    requests_today BIGINT,
    requests_this_week BIGINT,
    requests_this_month BIGINT,
    avg_response_time_ms NUMERIC,
    success_rate NUMERIC,
    most_used_endpoint TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today,
            COUNT(*) FILTER (WHERE created_at >= date_trunc('week', NOW())) as week,
            COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) as month,
            AVG(response_time_ms) as avg_time,
            COUNT(*) FILTER (WHERE status_code < 400)::NUMERIC / NULLIF(COUNT(*), 0) * 100 as success,
            MODE() WITHIN GROUP (ORDER BY endpoint) as top_endpoint
        FROM api_requests
        WHERE user_id = p_user_id
    )
    SELECT 
        total,
        today,
        week,
        month,
        ROUND(avg_time, 2),
        ROUND(success, 2),
        top_endpoint
    FROM stats;
END;
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Policies para api_keys
CREATE POLICY "Usuários veem suas próprias chaves"
    ON api_keys FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Usuários podem criar suas chaves"
    ON api_keys FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas chaves"
    ON api_keys FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar suas chaves"
    ON api_keys FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "Admins veem todas as chaves"
    ON api_keys FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Policies para api_requests
CREATE POLICY "Usuários veem suas próprias requisições"
    ON api_requests FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Sistema pode inserir requisições"
    ON api_requests FOR INSERT
    WITH CHECK (true); -- Permitir inserção via função

CREATE POLICY "Admins veem todas as requisições"
    ON api_requests FOR SELECT
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
SELECT '✅ SISTEMA DE API CRIADO COM SUCESSO!' as status;
SELECT 'Tabelas: api_keys, api_requests' as info;
SELECT 'Funções: validate_api_key, check_rate_limit, log_api_request, get_api_stats' as functions;

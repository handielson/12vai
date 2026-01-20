-- =====================================================
-- SISTEMA DE PAGAMENTOS - 12Vai
-- =====================================================
-- Migration: 012_create_payment_system.sql
-- Descrição: Sistema completo de assinaturas recorrentes via Stripe
-- =====================================================

-- =====================================================
-- TABELA: subscriptions
-- Armazena assinaturas ativas dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL CHECK (plan_name IN ('pro', 'business')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', 'incomplete_expired', 'unpaid')),
    
    -- IDs do Stripe
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    stripe_price_id TEXT NOT NULL,
    
    -- Informações de cobrança
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Garantir que usuário tem no máximo uma assinatura ativa
    CONSTRAINT unique_active_subscription UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- TABELA: payment_history
-- Registra histórico completo de transações
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- IDs do Stripe
    stripe_invoice_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    
    -- Informações de pagamento
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    status TEXT NOT NULL CHECK (status IN ('paid', 'failed', 'pending', 'refunded')),
    payment_method TEXT, -- 'card', 'pix', 'boleto'
    
    -- URLs úteis
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Informações adicionais
    failure_reason TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_invoice_id ON payment_history(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- =====================================================
-- ALTERAÇÃO: Adicionar stripe_customer_id à tabela users
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE users ADD COLUMN stripe_customer_id TEXT UNIQUE;
        CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
    END IF;
END $$;

-- =====================================================
-- FUNÇÃO: Sincronizar plano do usuário com assinatura
-- =====================================================
CREATE OR REPLACE FUNCTION sync_user_plan_from_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Quando assinatura fica ativa ou em trial, atualizar plano do usuário
    IF NEW.status IN ('active', 'trialing') THEN
        UPDATE users
        SET plan_type = NEW.plan_name
        WHERE id = NEW.user_id;
    
    -- Quando assinatura é cancelada/expira, reverter para free
    ELSIF NEW.status IN ('canceled', 'incomplete_expired', 'unpaid') THEN
        UPDATE users
        SET plan_type = 'free'
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para sincronização automática
DROP TRIGGER IF EXISTS trigger_sync_user_plan ON subscriptions;
CREATE TRIGGER trigger_sync_user_plan
    AFTER INSERT OR UPDATE OF status
    ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_plan_from_subscription();

-- =====================================================
-- FUNÇÃO: Atualizar timestamp de updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_subscription_timestamp ON subscriptions;
CREATE TRIGGER trigger_update_subscription_timestamp
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- =====================================================
-- FUNÇÃO: Obter assinatura ativa do usuário
-- =====================================================
CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    plan_name TEXT,
    status TEXT,
    stripe_subscription_id TEXT,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN,
    trial_end TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan_name,
        s.status,
        s.stripe_subscription_id,
        s.current_period_end,
        s.cancel_at_period_end,
        s.trial_end
    FROM subscriptions s
    WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing', 'past_due')
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$;

-- =====================================================
-- FUNÇÃO: Obter histórico de pagamentos do usuário
-- =====================================================
CREATE OR REPLACE FUNCTION get_payment_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    amount DECIMAL(10,2),
    currency TEXT,
    status TEXT,
    payment_method TEXT,
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    failure_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ph.id,
        ph.amount,
        ph.currency,
        ph.status,
        ph.payment_method,
        ph.invoice_pdf_url,
        ph.hosted_invoice_url,
        ph.paid_at,
        ph.created_at,
        ph.failure_reason
    FROM payment_history ph
    WHERE ph.user_id = p_user_id
    ORDER BY ph.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- =====================================================
-- FUNÇÃO: Obter estatísticas de pagamentos (Admin)
-- =====================================================
CREATE OR REPLACE FUNCTION get_payment_stats()
RETURNS TABLE (
    total_revenue DECIMAL(10,2),
    monthly_revenue DECIMAL(10,2),
    total_subscriptions BIGINT,
    active_subscriptions BIGINT,
    trialing_subscriptions BIGINT,
    canceled_subscriptions BIGINT,
    failed_payments BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ph.amount) FILTER (WHERE ph.status = 'paid'), 0) as total_revenue,
        COALESCE(SUM(ph.amount) FILTER (WHERE ph.status = 'paid' AND ph.created_at >= date_trunc('month', NOW())), 0) as monthly_revenue,
        COUNT(DISTINCT s.id) as total_subscriptions,
        COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') as active_subscriptions,
        COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'trialing') as trialing_subscriptions,
        COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'canceled') as canceled_subscriptions,
        COUNT(*) FILTER (WHERE ph.status = 'failed') as failed_payments
    FROM subscriptions s
    FULL OUTER JOIN payment_history ph ON true;
END;
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Policies para subscriptions
CREATE POLICY "Usuários veem suas próprias assinaturas"
    ON subscriptions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Sistema pode inserir assinaturas"
    ON subscriptions FOR INSERT
    WITH CHECK (true); -- Permitir inserção via service role

CREATE POLICY "Sistema pode atualizar assinaturas"
    ON subscriptions FOR UPDATE
    USING (true); -- Permitir atualização via service role

CREATE POLICY "Admins veem todas as assinaturas"
    ON subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Policies para payment_history
CREATE POLICY "Usuários veem seu próprio histórico"
    ON payment_history FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Sistema pode inserir pagamentos"
    ON payment_history FOR INSERT
    WITH CHECK (true); -- Permitir inserção via service role

CREATE POLICY "Admins veem todo histórico"
    ON payment_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- =====================================================
-- DADOS INICIAIS: Webhook events processados (idempotência)
-- =====================================================
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type ON stripe_webhook_events(event_type);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT '✅ SISTEMA DE PAGAMENTOS CRIADO COM SUCESSO!' as status;
SELECT 'Tabelas: subscriptions, payment_history, stripe_webhook_events' as tables;
SELECT 'Funções: sync_user_plan_from_subscription, get_active_subscription, get_payment_history, get_payment_stats' as functions;
SELECT 'Campo adicionado: users.stripe_customer_id' as user_field;

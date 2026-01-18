-- =====================================================
-- SISTEMA DE CUPONS - DATABASE SCHEMA
-- =====================================================
-- Criação de tabelas, funções e políticas RLS
-- para sistema completo de cupons de desconto
-- =====================================================

-- =====================================================
-- PARTE 1: CRIAR ENUM TYPES
-- =====================================================

-- Tipo de desconto
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'trial_extension');

-- Onde o cupom pode ser aplicado
CREATE TYPE applies_to AS ENUM ('upgrade', 'renewal', 'both');

-- Ação do usuário ao usar cupom
CREATE TYPE usage_action AS ENUM ('upgrade', 'renewal');

-- =====================================================
-- PARTE 2: CRIAR TABELAS
-- =====================================================

-- Tabela de cupons
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type discount_type NOT NULL,
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    applies_to applies_to NOT NULL DEFAULT 'both',
    applicable_plans TEXT[] DEFAULT NULL, -- NULL = todos os planos
    max_uses INTEGER DEFAULT NULL, -- NULL = ilimitado
    max_uses_per_user INTEGER DEFAULT 1,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de uso de cupons
CREATE TABLE IF NOT EXISTS public.coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    original_price NUMERIC NOT NULL,
    discount_amount NUMERIC NOT NULL,
    final_price NUMERIC NOT NULL,
    used_for usage_action NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PARTE 3: CRIAR ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_valid ON public.coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON public.coupon_usage(user_id);

-- =====================================================
-- PARTE 4: CRIAR FUNÇÕES DE VALIDAÇÃO
-- =====================================================

-- Função para validar cupom
CREATE OR REPLACE FUNCTION public.validate_coupon(
    p_code TEXT,
    p_user_id UUID,
    p_plan TEXT,
    p_action usage_action
)
RETURNS TABLE(
    valid BOOLEAN,
    message TEXT,
    coupon_id UUID,
    discount_type discount_type,
    discount_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_coupon RECORD;
    v_total_uses INTEGER;
    v_user_uses INTEGER;
BEGIN
    -- Buscar cupom
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE code = p_code;

    -- Cupom não existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Cupom não encontrado'::TEXT, NULL::UUID, NULL::discount_type, NULL::NUMERIC;
        RETURN;
    END IF;

    -- Cupom inativo
    IF NOT v_coupon.active THEN
        RETURN QUERY SELECT false, 'Cupom inativo'::TEXT, NULL::UUID, NULL::discount_type, NULL::NUMERIC;
        RETURN;
    END IF;

    -- Verificar validade
    IF v_coupon.valid_from > NOW() THEN
        RETURN QUERY SELECT false, 'Cupom ainda não está válido'::TEXT, NULL::UUID, NULL::discount_type, NULL::NUMERIC;
        RETURN;
    END IF;

    IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < NOW() THEN
        RETURN QUERY SELECT false, 'Cupom expirado'::TEXT, NULL::UUID, NULL::discount_type, NULL::NUMERIC;
        RETURN;
    END IF;

    -- Verificar se aplica à ação
    IF v_coupon.applies_to != 'both' AND v_coupon.applies_to::TEXT != p_action::TEXT THEN
        RETURN QUERY SELECT false, 'Cupom não aplicável a esta ação'::TEXT, NULL::UUID, NULL::discount_type, NULL::NUMERIC;
        RETURN;
    END IF;

    -- Verificar se aplica ao plano
    IF v_coupon.applicable_plans IS NOT NULL AND NOT (p_plan = ANY(v_coupon.applicable_plans)) THEN
        RETURN QUERY SELECT false, 'Cupom não aplicável a este plano'::TEXT, NULL::UUID, NULL::discount_type, NULL::NUMERIC;
        RETURN;
    END IF;

    -- Verificar limite total de usos
    IF v_coupon.max_uses IS NOT NULL THEN
        SELECT COUNT(*) INTO v_total_uses
        FROM public.coupon_usage
        WHERE coupon_id = v_coupon.id;

        IF v_total_uses >= v_coupon.max_uses THEN
            RETURN QUERY SELECT false, 'Cupom atingiu limite de usos'::TEXT, NULL::UUID, NULL::discount_type, NULL::NUMERIC;
            RETURN;
        END IF;
    END IF;

    -- Verificar limite de usos por usuário
    IF v_coupon.max_uses_per_user IS NOT NULL THEN
        SELECT COUNT(*) INTO v_user_uses
        FROM public.coupon_usage
        WHERE coupon_id = v_coupon.id
        AND user_id = p_user_id;

        IF v_user_uses >= v_coupon.max_uses_per_user THEN
            RETURN QUERY SELECT false, 'Você já usou este cupom o máximo de vezes permitido'::TEXT, NULL::UUID, NULL::discount_type, NULL::NUMERIC;
            RETURN;
        END IF;
    END IF;

    -- Cupom válido!
    RETURN QUERY SELECT 
        true, 
        'Cupom válido'::TEXT, 
        v_coupon.id, 
        v_coupon.discount_type, 
        v_coupon.discount_value;
END;
$$;

-- Função para calcular desconto
CREATE OR REPLACE FUNCTION public.calculate_discount(
    p_discount_type discount_type,
    p_discount_value NUMERIC,
    p_original_price NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
BEGIN
    CASE p_discount_type
        WHEN 'percentage' THEN
            RETURN ROUND(p_original_price * (p_discount_value / 100), 2);
        WHEN 'fixed_amount' THEN
            RETURN LEAST(p_discount_value, p_original_price);
        WHEN 'trial_extension' THEN
            RETURN 0; -- Trial extension não afeta preço
        ELSE
            RETURN 0;
    END CASE;
END;
$$;

-- Função para aplicar cupom
CREATE OR REPLACE FUNCTION public.apply_coupon(
    p_code TEXT,
    p_user_id UUID,
    p_plan TEXT,
    p_original_price NUMERIC,
    p_action usage_action
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    original_price NUMERIC,
    discount_amount NUMERIC,
    final_price NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_validation RECORD;
    v_discount NUMERIC;
    v_final NUMERIC;
BEGIN
    -- Validar cupom
    SELECT * INTO v_validation
    FROM public.validate_coupon(p_code, p_user_id, p_plan, p_action);

    IF NOT v_validation.valid THEN
        RETURN QUERY SELECT false, v_validation.message, p_original_price, 0::NUMERIC, p_original_price;
        RETURN;
    END IF;

    -- Calcular desconto
    v_discount := public.calculate_discount(
        v_validation.discount_type,
        v_validation.discount_value,
        p_original_price
    );

    v_final := GREATEST(p_original_price - v_discount, 0);

    -- Registrar uso
    INSERT INTO public.coupon_usage (
        coupon_id,
        user_id,
        plan,
        original_price,
        discount_amount,
        final_price,
        used_for
    ) VALUES (
        v_validation.coupon_id,
        p_user_id,
        p_plan,
        p_original_price,
        v_discount,
        v_final,
        p_action
    );

    RETURN QUERY SELECT true, 'Cupom aplicado com sucesso'::TEXT, p_original_price, v_discount, v_final;
END;
$$;

-- Função para obter estatísticas de cupom
CREATE OR REPLACE FUNCTION public.get_coupon_stats(p_coupon_id UUID)
RETURNS TABLE(
    total_uses BIGINT,
    total_discount NUMERIC,
    total_revenue NUMERIC,
    unique_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_uses,
        COALESCE(SUM(discount_amount), 0) as total_discount,
        COALESCE(SUM(final_price), 0) as total_revenue,
        COUNT(DISTINCT user_id)::BIGINT as unique_users
    FROM public.coupon_usage
    WHERE coupon_id = p_coupon_id;
END;
$$;

-- =====================================================
-- PARTE 5: TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PARTE 6: RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para COUPONS
-- Todos podem visualizar cupons ativos
CREATE POLICY "Anyone can view active coupons"
    ON public.coupons FOR SELECT
    USING (active = true);

-- Apenas admins podem gerenciar cupons
CREATE POLICY "Admins can manage coupons"
    ON public.coupons FOR ALL
    USING (public.is_current_user_admin())
    WITH CHECK (public.is_current_user_admin());

-- Políticas para COUPON_USAGE
-- Usuários podem ver seu próprio histórico
CREATE POLICY "Users can view own usage"
    ON public.coupon_usage FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

-- Admins podem ver todo histórico
CREATE POLICY "Admins can view all usage"
    ON public.coupon_usage FOR SELECT
    USING (public.is_current_user_admin());

-- Apenas usuários autenticados podem inserir uso (via função apply_coupon)
CREATE POLICY "Authenticated users can insert usage"
    ON public.coupon_usage FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT '✅ SCHEMA DE CUPONS CRIADO' as status;

-- Listar tabelas criadas
SELECT 
    'Tabelas criadas' as item,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('coupons', 'coupon_usage');

-- Listar funções criadas
SELECT 
    'Funções criadas' as item,
    proname as function_name
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname IN ('validate_coupon', 'calculate_discount', 'apply_coupon', 'get_coupon_stats');

-- =====================================================
-- ✅ CONCLUÍDO!
-- =====================================================

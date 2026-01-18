-- =====================================================
-- CORREÇÕES DE SEGURANÇA - SISTEMA DE CUPONS
-- =====================================================
-- Corrige 2 problemas detectados pelo Supabase Linter
-- =====================================================

-- 1. Adicionar search_path à função calculate_discount
DROP FUNCTION IF EXISTS public.calculate_discount(discount_type, NUMERIC, NUMERIC);

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
            RETURN 0;
        ELSE
            RETURN 0;
    END CASE;
END;
$$;

-- 2. Corrigir política RLS excessivamente permissiva
DROP POLICY IF EXISTS "System can insert usage" ON public.coupon_usage;

CREATE POLICY "Authenticated users can insert usage"
    ON public.coupon_usage FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Verificação
SELECT '✅ CORREÇÕES APLICADAS' as status;

SELECT 
    'Função corrigida' as item,
    proname as nome,
    'search_path configurado' as status
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname = 'calculate_discount';

SELECT 
    'Política corrigida' as item,
    policyname as nome,
    'Validação de user_id adicionada' as status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'coupon_usage'
    AND cmd = 'INSERT';

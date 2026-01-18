-- =====================================================
-- VERIFICAÇÃO DO SISTEMA DE CUPONS
-- =====================================================
-- Execute este script para verificar se tudo está instalado
-- =====================================================

-- 1. Verificar tabelas
SELECT 
    'Tabelas' as tipo,
    tablename as nome,
    'Existe' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('coupons', 'coupon_usage');

-- 2. Verificar tipos ENUM
SELECT 
    'ENUM Types' as tipo,
    t.typname as nome,
    'Existe' as status
FROM pg_type t
WHERE t.typnamespace = 'public'::regnamespace
AND t.typname IN ('discount_type', 'applies_to', 'usage_action');

-- 3. Verificar funções
SELECT 
    'Funções' as tipo,
    proname as nome,
    'Existe' as status
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND proname IN ('validate_coupon', 'apply_coupon', 'calculate_discount', 'get_coupon_stats');

-- 4. Verificar políticas RLS
SELECT 
    'RLS Policies' as tipo,
    tablename || '.' || policyname as nome,
    cmd as operacao
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('coupons', 'coupon_usage')
ORDER BY tablename, policyname;

-- 5. Verificar RLS habilitado
SELECT 
    'RLS Status' as tipo,
    tablename as nome,
    CASE WHEN rowsecurity THEN 'Habilitado' ELSE 'Desabilitado' END as status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
AND t.tablename IN ('coupons', 'coupon_usage');

-- 6. Contar cupons existentes
SELECT 
    'Dados' as tipo,
    'Total de cupons' as nome,
    COUNT(*)::text as status
FROM coupons;

SELECT 
    'Dados' as tipo,
    'Total de usos' as nome,
    COUNT(*)::text as status
FROM coupon_usage;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Se tudo estiver correto, você deve ver:
-- - 2 tabelas (coupons, coupon_usage)
-- - 3 tipos ENUM (discount_type, applies_to, usage_action)
-- - 4 funções (validate_coupon, apply_coupon, calculate_discount, get_coupon_stats)
-- - Várias políticas RLS
-- - RLS habilitado em ambas as tabelas
-- =====================================================

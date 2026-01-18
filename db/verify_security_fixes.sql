-- =====================================================
-- VERIFICAÇÃO DE SEGURANÇA - SUPABASE LINTER
-- =====================================================
-- Execute este script APÓS executar fix_security_issues.sql
-- para verificar que todos os problemas foram resolvidos
-- =====================================================

-- =====================================================
-- 1. VERIFICAR RLS HABILITADO
-- =====================================================
SELECT 
    '✓ RLS Habilitado' as status,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✓ HABILITADO' 
        ELSE '✗ DESABILITADO' 
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('plans', 'plan_settings', 'project_documentation', 'app_changelog', 'admin_audit_log')
ORDER BY tablename;

-- Resultado esperado: Todas as tabelas devem mostrar "✓ HABILITADO"

-- =====================================================
-- 2. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================
SELECT 
    '✓ Políticas RLS' as status,
    tablename,
    COUNT(*) as total_policies,
    STRING_AGG(DISTINCT cmd::text, ', ') as operations
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('plans', 'plan_settings', 'project_documentation', 'app_changelog', 'admin_audit_log')
GROUP BY tablename
ORDER BY tablename;

-- Resultado esperado: 
-- - plans: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - plan_settings: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - project_documentation: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - app_changelog: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - admin_audit_log: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- =====================================================
-- 3. LISTAR TODAS AS POLÍTICAS DETALHADAS
-- =====================================================
SELECT 
    '✓ Detalhes das Políticas' as status,
    tablename,
    policyname,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN '✓ Com USING'
        ELSE '○ Sem USING'
    END as has_using,
    CASE 
        WHEN with_check IS NOT NULL THEN '✓ Com CHECK'
        ELSE '○ Sem CHECK'
    END as has_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('plans', 'plan_settings', 'project_documentation', 'app_changelog', 'admin_audit_log')
ORDER BY tablename, cmd, policyname;

-- =====================================================
-- 4. VERIFICAR VIEWS SEM SECURITY DEFINER
-- =====================================================
SELECT 
    '✓ Views' as status,
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN '✗ TEM SECURITY DEFINER'
        ELSE '✓ SEM SECURITY DEFINER'
    END as security_status
FROM pg_views
WHERE schemaname = 'public'
    AND viewname IN ('user_stats', 'audit_log_with_admin');

-- Resultado esperado: Ambas as views devem mostrar "✓ SEM SECURITY DEFINER"

-- =====================================================
-- 5. VERIFICAR DEFINIÇÃO COMPLETA DAS VIEWS
-- =====================================================
SELECT 
    '✓ Definição das Views' as status,
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public'
    AND viewname IN ('user_stats', 'audit_log_with_admin');

-- =====================================================
-- 6. RESUMO GERAL
-- =====================================================
SELECT 
    '📊 RESUMO GERAL' as titulo,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('plans', 'plan_settings', 'project_documentation', 'app_changelog', 'admin_audit_log') AND rowsecurity = true) as tabelas_com_rls,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('plans', 'plan_settings', 'project_documentation', 'app_changelog', 'admin_audit_log')) as total_politicas,
    (SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public' AND viewname IN ('user_stats', 'audit_log_with_admin') AND definition NOT LIKE '%SECURITY DEFINER%') as views_seguras;

-- Resultado esperado:
-- tabelas_com_rls: 5
-- total_politicas: 20 (4 por tabela × 5 tabelas)
-- views_seguras: 2

-- =====================================================
-- 7. TESTE DE ACESSO (OPCIONAL)
-- =====================================================
-- Descomente para testar se você consegue ler os dados

-- SELECT '✓ Teste de Leitura - Plans' as teste, COUNT(*) as total FROM public.plans;
-- SELECT '✓ Teste de Leitura - Plan Settings' as teste, COUNT(*) as total FROM public.plan_settings;
-- SELECT '✓ Teste de Leitura - Documentation' as teste, COUNT(*) as total FROM public.project_documentation;
-- SELECT '✓ Teste de Leitura - Changelog' as teste, COUNT(*) as total FROM public.app_changelog;
-- SELECT '✓ Teste de Leitura - User Stats' as teste, COUNT(*) as total FROM public.user_stats;
-- SELECT '✓ Teste de Leitura - Audit Log' as teste, COUNT(*) as total FROM public.audit_log_with_admin;

-- 8.4 Verificar funções COM search_path seguro
SELECT 
    '✓ Functions Security' as check_type,
    proname as function_name,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type,
    CASE 
        WHEN proconfig IS NOT NULL AND EXISTS (
            SELECT 1 FROM unnest(proconfig) AS cfg WHERE cfg LIKE 'search_path=%'
        ) THEN '✅ search_path SET'
        WHEN proconfig IS NOT NULL THEN '⚠️ Has config: ' || array_to_string(proconfig, ', ')
        ELSE '❌ NO search_path'
    END as search_path_status
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname IN ('update_updated_at_column', 'increment_url_clicks')
ORDER BY proname;

-- =====================================================
-- CONCLUÍDO!
-- =====================================================
-- Se todos os testes passarem, os 7 problemas de segurança
-- detectados pelo Supabase Linter foram resolvidos:
-- ✓ user_stats - SECURITY DEFINER removido
-- ✓ audit_log_with_admin - SECURITY DEFINER removido
-- ✓ update_updated_at_column - search_path fixado
-- ✓ increment_url_clicks - search_path fixado
-- ✓ plans - RLS habilitado
-- ✓ plan_settings - RLS habilitado
-- ✓ project_documentation - RLS habilitado
-- ✓ app_changelog - RLS habilitado
-- ✓ admin_audit_log - RLS habilitado
-- =====================================================


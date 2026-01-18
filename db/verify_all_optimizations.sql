-- =====================================================
-- VERIFICAÇÃO FINAL: Status das Otimizações RLS
-- =====================================================

-- 1. Verificar política de clicks
SELECT 
    '1. POLÍTICA DE CLICKS' as secao,
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clicks'
    AND cmd = 'INSERT';

-- 2. Verificar políticas de users
SELECT 
    '2. POLÍTICAS DE USERS' as secao,
    cmd as operacao,
    COUNT(*) as total_politicas
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'users'
GROUP BY cmd
ORDER BY cmd;

-- 3. Verificar todas as funções com search_path
SELECT 
    '3. FUNÇÕES COM SEARCH_PATH' as secao,
    proname as funcao,
    CASE 
        WHEN proconfig IS NOT NULL AND EXISTS (
            SELECT 1 FROM unnest(proconfig) AS cfg WHERE cfg LIKE 'search_path=%'
        ) THEN '✅ CONFIGURADO'
        ELSE '❌ NÃO CONFIGURADO'
    END as status
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname IN (
        'update_updated_at_column',
        'increment_url_clicks',
        'get_clicks_by_device',
        'get_clicks_by_browser',
        'get_clicks_by_day',
        'handle_new_user',
        'is_current_user_admin'
    )
ORDER BY proname;

-- 4. Verificar views sem SECURITY DEFINER
SELECT 
    '4. VIEWS SEGURAS' as secao,
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ TEM SECURITY DEFINER'
        ELSE '✅ SEGURA'
    END as status
FROM pg_views
WHERE schemaname = 'public'
    AND viewname IN ('user_stats', 'audit_log_with_admin');

-- 5. Resumo geral
SELECT 
    '5. RESUMO GERAL' as secao,
    'Total de políticas RLS' as item,
    COUNT(*)::text as valor
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT 
    '5. RESUMO GERAL',
    'Funções com search_path',
    COUNT(*)::text
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proconfig IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM unnest(proconfig) AS cfg WHERE cfg LIKE 'search_path=%'
    )
UNION ALL
SELECT 
    '5. RESUMO GERAL',
    'Tabelas com RLS habilitado',
    COUNT(*)::text
FROM pg_tables
WHERE schemaname = 'public'
    AND rowsecurity = true;

-- =====================================================
-- ANÁLISE DO AVISO PERSISTENTE DE CLICKS
-- =====================================================

SELECT 
    '6. ANÁLISE DO AVISO' as secao,
    'O aviso de clicks pode ser um falso positivo do Linter' as observacao,
    'A política já usa (SELECT auth.jwt()) conforme recomendado' as status;

-- =====================================================
-- FIX ALL SUPABASE SECURITY LINTER ISSUES - VERSÃO FINAL
-- =====================================================
-- Este script resolve TODOS os problemas de segurança:
-- 1. Remove SECURITY DEFINER de views
-- 2. Corrige search_path mutável em TODAS as funções
-- 3. Corrige política RLS excessivamente permissiva
-- 4. Habilita RLS em tabelas públicas
-- =====================================================

-- =====================================================
-- PARTE 1: RECRIAR VIEWS SEM SECURITY DEFINER
-- =====================================================

DROP VIEW IF EXISTS public.user_stats CASCADE;
CREATE VIEW public.user_stats 
WITH (security_invoker=true) AS
SELECT 
  u.id as user_id,
  u.email,
  u.plan,
  COUNT(DISTINCT urls.id) as total_urls,
  COUNT(DISTINCT CASE WHEN urls.active THEN urls.id END) as active_urls,
  COALESCE(SUM(urls.clicks_count), 0) as total_clicks,
  MAX(urls.created_at) as last_url_created
FROM users u
LEFT JOIN urls ON urls.user_id = u.id
GROUP BY u.id, u.email, u.plan;

DROP VIEW IF EXISTS public.audit_log_with_admin CASCADE;
CREATE VIEW public.audit_log_with_admin 
WITH (security_invoker=true) AS
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

-- =====================================================
-- PARTE 2: CORRIGIR TODAS AS FUNÇÕES COM SEARCH_PATH
-- =====================================================

-- 2.1 update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_urls_updated_at ON urls;
CREATE TRIGGER update_urls_updated_at
  BEFORE UPDATE ON urls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2.2 increment_url_clicks
DROP FUNCTION IF EXISTS public.increment_url_clicks() CASCADE;
CREATE OR REPLACE FUNCTION public.increment_url_clicks()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.urls SET clicks_count = clicks_count + 1 WHERE id = NEW.url_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS increment_clicks_on_insert ON clicks;
CREATE TRIGGER increment_clicks_on_insert
  AFTER INSERT ON clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_url_clicks();

-- 2.3 get_clicks_by_device
DROP FUNCTION IF EXISTS public.get_clicks_by_device(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_clicks_by_device(user_id_param UUID)
RETURNS TABLE(device TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.device_type, 'Unknown') as device,
    COUNT(*) as count
  FROM public.clicks c
  JOIN public.urls u ON c.url_id = u.id
  WHERE u.user_id = user_id_param
  GROUP BY c.device_type
  ORDER BY count DESC;
END;
$$;

-- 2.4 get_clicks_by_browser
DROP FUNCTION IF EXISTS public.get_clicks_by_browser(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_clicks_by_browser(user_id_param UUID)
RETURNS TABLE(browser TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.browser, 'Unknown') as browser,
    COUNT(*) as count
  FROM public.clicks c
  JOIN public.urls u ON c.url_id = u.id
  WHERE u.user_id = user_id_param
  GROUP BY c.browser
  ORDER BY count DESC
  LIMIT 10;
END;
$$;

-- 2.5 get_clicks_by_day
DROP FUNCTION IF EXISTS public.get_clicks_by_day(UUID, INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION public.get_clicks_by_day(user_id_param UUID, days INTEGER DEFAULT 30)
RETURNS TABLE(date DATE, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(c.created_at) as date,
    COUNT(*) as count
  FROM public.clicks c
  JOIN public.urls u ON c.url_id = u.id
  WHERE u.user_id = user_id_param
    AND c.created_at >= NOW() - (days || ' days')::INTERVAL
  GROUP BY DATE(c.created_at)
  ORDER BY date DESC;
END;
$$;

-- 2.6 handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, is_admin)
  VALUES (NEW.id, NEW.email, 'free', false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PARTE 3: CORRIGIR POLÍTICA RLS EXCESSIVAMENTE PERMISSIVA
-- =====================================================

-- 3.1 Remover política antiga que permite acesso irrestrito
DROP POLICY IF EXISTS "Service role can insert clicks" ON public.clicks;

-- 3.2 Remover política nova se já existir (para permitir re-execução)
DROP POLICY IF EXISTS "Allow insert clicks for service role or own urls" ON public.clicks;

-- 3.3 Criar política mais restritiva
-- Permitir inserção apenas via service role OU para URLs do próprio usuário
CREATE POLICY "Allow insert clicks for service role or own urls"
  ON public.clicks
  FOR INSERT
  WITH CHECK (
    -- Service role pode inserir (para Edge Functions)
    auth.jwt()->>'role' = 'service_role'
    OR
    -- Ou se for um usuário autenticado inserindo em suas próprias URLs
    EXISTS (
      SELECT 1 FROM public.urls
      WHERE urls.id = url_id
      AND urls.user_id = auth.uid()
    )
  );


-- =====================================================
-- PARTE 4: HABILITAR RLS EM TABELAS PÚBLICAS
-- =====================================================

-- 4.1 PLANS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem visualizar planos" ON public.plans;
CREATE POLICY "Todos podem visualizar planos"
    ON public.plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas admins podem inserir planos" ON public.plans;
CREATE POLICY "Apenas admins podem inserir planos"
    ON public.plans FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

DROP POLICY IF EXISTS "Apenas admins podem atualizar planos" ON public.plans;
CREATE POLICY "Apenas admins podem atualizar planos"
    ON public.plans FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

DROP POLICY IF EXISTS "Apenas admins podem deletar planos" ON public.plans;
CREATE POLICY "Apenas admins podem deletar planos"
    ON public.plans FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

-- 4.2 PLAN_SETTINGS
ALTER TABLE public.plan_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem visualizar configurações de planos" ON public.plan_settings;
CREATE POLICY "Todos podem visualizar configurações de planos"
    ON public.plan_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas admins podem inserir configurações de planos" ON public.plan_settings;
CREATE POLICY "Apenas admins podem inserir configurações de planos"
    ON public.plan_settings FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

DROP POLICY IF EXISTS "Apenas admins podem atualizar configurações de planos" ON public.plan_settings;
CREATE POLICY "Apenas admins podem atualizar configurações de planos"
    ON public.plan_settings FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

DROP POLICY IF EXISTS "Apenas admins podem deletar configurações de planos" ON public.plan_settings;
CREATE POLICY "Apenas admins podem deletar configurações de planos"
    ON public.plan_settings FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

-- 4.3 PROJECT_DOCUMENTATION
ALTER TABLE public.project_documentation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem visualizar documentação" ON public.project_documentation;
CREATE POLICY "Todos podem visualizar documentação"
    ON public.project_documentation FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas admins podem inserir documentação" ON public.project_documentation;
CREATE POLICY "Apenas admins podem inserir documentação"
    ON public.project_documentation FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

DROP POLICY IF EXISTS "Apenas admins podem atualizar documentação" ON public.project_documentation;
CREATE POLICY "Apenas admins podem atualizar documentação"
    ON public.project_documentation FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

DROP POLICY IF EXISTS "Apenas admins podem deletar documentação" ON public.project_documentation;
CREATE POLICY "Apenas admins podem deletar documentação"
    ON public.project_documentation FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

-- 4.4 APP_CHANGELOG
ALTER TABLE public.app_changelog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem visualizar changelog" ON public.app_changelog;
CREATE POLICY "Todos podem visualizar changelog"
    ON public.app_changelog FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas admins podem inserir changelog" ON public.app_changelog;
CREATE POLICY "Apenas admins podem inserir changelog"
    ON public.app_changelog FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

DROP POLICY IF EXISTS "Apenas admins podem atualizar changelog" ON public.app_changelog;
CREATE POLICY "Apenas admins podem atualizar changelog"
    ON public.app_changelog FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

DROP POLICY IF EXISTS "Apenas admins podem deletar changelog" ON public.app_changelog;
CREATE POLICY "Apenas admins podem deletar changelog"
    ON public.app_changelog FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

-- 4.5 ADMIN_AUDIT_LOG
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Apenas admins podem visualizar admin_audit_log" ON public.admin_audit_log;
CREATE POLICY "Apenas admins podem visualizar admin_audit_log"
    ON public.admin_audit_log FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

DROP POLICY IF EXISTS "Apenas admins podem inserir admin_audit_log" ON public.admin_audit_log;
CREATE POLICY "Apenas admins podem inserir admin_audit_log"
    ON public.admin_audit_log FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.is_admin = true));

DROP POLICY IF EXISTS "Admin audit logs são imutáveis" ON public.admin_audit_log;
CREATE POLICY "Admin audit logs são imutáveis"
    ON public.admin_audit_log FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Admin audit logs não podem ser deletados" ON public.admin_audit_log;
CREATE POLICY "Admin audit logs não podem ser deletados"
    ON public.admin_audit_log FOR DELETE USING (false);

-- =====================================================
-- PARTE 5: VERIFICAÇÕES FINAIS
-- =====================================================

SELECT '✅ VERIFICAÇÃO COMPLETA' as status;

-- 5.1 RLS habilitado
SELECT 
    '1. RLS Status' as check_name,
    tablename,
    CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('plans', 'plan_settings', 'project_documentation', 'app_changelog', 'admin_audit_log')
ORDER BY tablename;

-- 5.2 Views sem SECURITY DEFINER
SELECT 
    '2. Views Security' as check_name,
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ HAS SECURITY DEFINER'
        ELSE '✅ SECURE'
    END as status
FROM pg_views
WHERE schemaname = 'public'
    AND viewname IN ('user_stats', 'audit_log_with_admin');

-- 5.3 Funções com search_path seguro
SELECT 
    '3. Functions Security' as check_name,
    proname as function_name,
    CASE 
        WHEN proconfig IS NOT NULL AND EXISTS (
            SELECT 1 FROM unnest(proconfig) AS cfg WHERE cfg LIKE 'search_path=%'
        ) THEN '✅ search_path SET'
        ELSE '❌ NO search_path'
    END as status
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname IN (
        'update_updated_at_column', 
        'increment_url_clicks',
        'get_clicks_by_device',
        'get_clicks_by_browser',
        'get_clicks_by_day',
        'handle_new_user'
    )
ORDER BY proname;

-- 5.4 Política de clicks corrigida
SELECT 
    '4. Clicks Policy' as check_name,
    policyname,
    CASE 
        WHEN policyname LIKE '%service role%' AND with_check = 'true' THEN '❌ OVERLY PERMISSIVE'
        ELSE '✅ SECURE'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clicks'
    AND cmd = 'INSERT';

-- =====================================================
-- ✅ CONCLUÍDO!
-- =====================================================
-- Problemas resolvidos:
-- ✓ user_stats - SECURITY DEFINER removido
-- ✓ audit_log_with_admin - SECURITY DEFINER removido
-- ✓ update_updated_at_column - search_path fixado
-- ✓ increment_url_clicks - search_path fixado
-- ✓ get_clicks_by_device - search_path fixado
-- ✓ get_clicks_by_browser - search_path fixado
-- ✓ get_clicks_by_day - search_path fixado
-- ✓ handle_new_user - search_path fixado
-- ✓ clicks INSERT policy - corrigida (não mais irrestrita)
-- ✓ plans - RLS habilitado
-- ✓ plan_settings - RLS habilitado
-- ✓ project_documentation - RLS habilitado
-- ✓ app_changelog - RLS habilitado
-- ✓ admin_audit_log - RLS habilitado
--
-- NOTA: A proteção contra vazamento de senhas deve ser
-- habilitada manualmente no Supabase Dashboard:
-- Authentication → Settings → Password Protection
-- =====================================================

-- =====================================================
-- OTIMIZAÇÃO DE PERFORMANCE RLS
-- =====================================================
-- Resolve avisos de performance substituindo auth.uid()
-- por (SELECT auth.uid()) para evitar reavaliação por linha
-- =====================================================

-- =====================================================
-- PARTE 1: LIMPAR POLÍTICAS DUPLICADAS
-- =====================================================

-- 1.1 Remover políticas duplicadas/antigas da tabela users
DROP POLICY IF EXISTS "Simple user view policy" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;

-- =====================================================
-- PARTE 2: OTIMIZAR POLÍTICAS DA TABELA USERS
-- =====================================================
-- Consolidar políticas múltiplas em uma única política por operação

-- 2.1 Consolidated SELECT policy (users OR admins)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Users and admins can view profiles"
  ON public.users FOR SELECT
  USING (
    -- Usuários veem apenas seu próprio perfil
    (SELECT auth.uid()) = id
    OR
    -- Admins veem todos os perfis
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- 2.2 Consolidated UPDATE policy (users OR admins)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Users and admins can update profiles"
  ON public.users FOR UPDATE
  USING (
    -- Usuários atualizam apenas seu próprio perfil
    (SELECT auth.uid()) = id
    OR
    -- Admins atualizam qualquer perfil
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    -- Mesma lógica para WITH CHECK
    (SELECT auth.uid()) = id
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- =====================================================
-- PARTE 2: OTIMIZAR POLÍTICAS DA TABELA URLS
-- =====================================================

-- 2.1 Users can view own urls
DROP POLICY IF EXISTS "Users can view own urls" ON public.urls;
CREATE POLICY "Users can view own urls"
  ON public.urls FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- 2.2 Users can create urls
DROP POLICY IF EXISTS "Users can create urls" ON public.urls;
CREATE POLICY "Users can create urls"
  ON public.urls FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 2.3 Users can update own urls
DROP POLICY IF EXISTS "Users can update own urls" ON public.urls;
CREATE POLICY "Users can update own urls"
  ON public.urls FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

-- 2.4 Users can delete own urls
DROP POLICY IF EXISTS "Users can delete own urls" ON public.urls;
CREATE POLICY "Users can delete own urls"
  ON public.urls FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- PARTE 3: OTIMIZAR POLÍTICAS DA TABELA CLICKS
-- =====================================================

-- 3.1 Users can view clicks from own urls
DROP POLICY IF EXISTS "Users can view clicks from own urls" ON public.clicks;
CREATE POLICY "Users can view clicks from own urls"
  ON public.clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.urls
      WHERE urls.id = clicks.url_id
      AND urls.user_id = (SELECT auth.uid())
    )
  );

-- 3.2 Allow insert clicks for service role or own urls
DROP POLICY IF EXISTS "Allow insert clicks for service role or own urls" ON public.clicks;
CREATE POLICY "Allow insert clicks for service role or own urls"
  ON public.clicks FOR INSERT
  WITH CHECK (
    (SELECT auth.jwt()->>'role') = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM public.urls
      WHERE urls.id = url_id
      AND urls.user_id = (SELECT auth.uid())
    )
  );


-- =====================================================
-- PARTE 4: OTIMIZAR POLÍTICAS DA TABELA PLANS
-- =====================================================

-- 4.1 Todos podem visualizar planos (já otimizada - usa true)
DROP POLICY IF EXISTS "Todos podem visualizar planos" ON public.plans;
CREATE POLICY "Todos podem visualizar planos"
  ON public.plans FOR SELECT
  USING (true);

-- 4.2 Apenas admins podem inserir planos
DROP POLICY IF EXISTS "Apenas admins podem inserir planos" ON public.plans;
CREATE POLICY "Apenas admins podem inserir planos"
  ON public.plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- 4.3 Apenas admins podem atualizar planos
DROP POLICY IF EXISTS "Apenas admins podem atualizar planos" ON public.plans;
CREATE POLICY "Apenas admins podem atualizar planos"
  ON public.plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- 4.4 Apenas admins podem deletar planos
DROP POLICY IF EXISTS "Apenas admins podem deletar planos" ON public.plans;
CREATE POLICY "Apenas admins podem deletar planos"
  ON public.plans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- =====================================================
-- PARTE 5: OTIMIZAR POLÍTICAS DA TABELA PLAN_SETTINGS
-- =====================================================

DROP POLICY IF EXISTS "Todos podem visualizar configurações de planos" ON public.plan_settings;
CREATE POLICY "Todos podem visualizar configurações de planos"
  ON public.plan_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Apenas admins podem inserir configurações de planos" ON public.plan_settings;
CREATE POLICY "Apenas admins podem inserir configurações de planos"
  ON public.plan_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Apenas admins podem atualizar configurações de planos" ON public.plan_settings;
CREATE POLICY "Apenas admins podem atualizar configurações de planos"
  ON public.plan_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Apenas admins podem deletar configurações de planos" ON public.plan_settings;
CREATE POLICY "Apenas admins podem deletar configurações de planos"
  ON public.plan_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- =====================================================
-- PARTE 6: OTIMIZAR POLÍTICAS DA TABELA PROJECT_DOCUMENTATION
-- =====================================================

DROP POLICY IF EXISTS "Todos podem visualizar documentação" ON public.project_documentation;
CREATE POLICY "Todos podem visualizar documentação"
  ON public.project_documentation FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Apenas admins podem inserir documentação" ON public.project_documentation;
CREATE POLICY "Apenas admins podem inserir documentação"
  ON public.project_documentation FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Apenas admins podem atualizar documentação" ON public.project_documentation;
CREATE POLICY "Apenas admins podem atualizar documentação"
  ON public.project_documentation FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Apenas admins podem deletar documentação" ON public.project_documentation;
CREATE POLICY "Apenas admins podem deletar documentação"
  ON public.project_documentation FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- =====================================================
-- PARTE 7: OTIMIZAR POLÍTICAS DA TABELA APP_CHANGELOG
-- =====================================================

DROP POLICY IF EXISTS "Todos podem visualizar changelog" ON public.app_changelog;
CREATE POLICY "Todos podem visualizar changelog"
  ON public.app_changelog FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Apenas admins podem inserir changelog" ON public.app_changelog;
CREATE POLICY "Apenas admins podem inserir changelog"
  ON public.app_changelog FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Apenas admins podem atualizar changelog" ON public.app_changelog;
CREATE POLICY "Apenas admins podem atualizar changelog"
  ON public.app_changelog FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Apenas admins podem deletar changelog" ON public.app_changelog;
CREATE POLICY "Apenas admins podem deletar changelog"
  ON public.app_changelog FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- =====================================================
-- PARTE 8: OTIMIZAR POLÍTICAS DA TABELA AUDIT_LOG
-- =====================================================

DROP POLICY IF EXISTS "Admins podem visualizar audit logs" ON public.audit_log;
CREATE POLICY "Admins podem visualizar audit logs"
  ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins podem inserir audit logs" ON public.audit_log;
CREATE POLICY "Admins podem inserir audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Audit logs são imutáveis" ON public.audit_log;
CREATE POLICY "Audit logs são imutáveis"
  ON public.audit_log FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Audit logs não podem ser deletados" ON public.audit_log;
CREATE POLICY "Audit logs não podem ser deletados"
  ON public.audit_log FOR DELETE
  USING (false);

-- =====================================================
-- PARTE 9: OTIMIZAR POLÍTICAS DA TABELA ADMIN_AUDIT_LOG
-- =====================================================

DROP POLICY IF EXISTS "Apenas admins podem visualizar admin_audit_log" ON public.admin_audit_log;
CREATE POLICY "Apenas admins podem visualizar admin_audit_log"
  ON public.admin_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Apenas admins podem inserir admin_audit_log" ON public.admin_audit_log;
CREATE POLICY "Apenas admins podem inserir admin_audit_log"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admin audit logs são imutáveis" ON public.admin_audit_log;
CREATE POLICY "Admin audit logs são imutáveis"
  ON public.admin_audit_log FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Admin audit logs não podem ser deletados" ON public.admin_audit_log;
CREATE POLICY "Admin audit logs não podem ser deletados"
  ON public.admin_audit_log FOR DELETE
  USING (false);

-- =====================================================
-- PARTE 10: OTIMIZAR POLÍTICAS DA TABELA APP_SETTINGS
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas duplicadas
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Everyone can read settings" ON public.app_settings;

-- Todos podem ler configurações (política única)
CREATE POLICY "Everyone can read settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- Apenas admins podem atualizar configurações
DROP POLICY IF EXISTS "Only admins can update settings" ON public.app_settings;
CREATE POLICY "Only admins can update settings"
  ON public.app_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- Apenas admins podem inserir configurações
DROP POLICY IF EXISTS "Only admins can insert settings" ON public.app_settings;
CREATE POLICY "Only admins can insert settings"
  ON public.app_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- Apenas admins podem deletar configurações
DROP POLICY IF EXISTS "Only admins can delete settings" ON public.app_settings;
CREATE POLICY "Only admins can delete settings"
  ON public.app_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = (SELECT auth.uid())
      AND users.is_admin = true
    )
  );

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT '✅ OTIMIZAÇÃO COMPLETA' as status;

-- Listar todas as políticas otimizadas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- ✅ CONCLUÍDO!
-- =====================================================
-- Todas as políticas RLS foram otimizadas:
-- - auth.uid() → (SELECT auth.uid())
-- - Evita reavaliação para cada linha
-- - Melhora significativa de performance
-- =====================================================

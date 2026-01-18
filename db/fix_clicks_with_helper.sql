-- =====================================================
-- SOLUÇÃO ALTERNATIVA: Função Helper para Role
-- =====================================================
-- O Supabase pode não reconhecer (SELECT auth.jwt())
-- Vamos criar uma função helper que retorna a role
-- =====================================================

-- PASSO 1: Criar função helper para obter role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    ''
  );
$$;

-- PASSO 2: Remover política antiga
DROP POLICY IF EXISTS "Allow insert clicks for service role or own urls" ON public.clicks;

-- PASSO 3: Criar política usando a função helper
CREATE POLICY "Allow insert clicks for service role or own urls"
  ON public.clicks FOR INSERT
  WITH CHECK (
    -- Usar função helper ao invés de auth.jwt()
    public.get_current_user_role() = 'service_role'
    OR
    -- Usuário autenticado inserindo em suas próprias URLs
    EXISTS (
      SELECT 1 FROM public.urls
      WHERE urls.id = url_id
      AND urls.user_id = (SELECT auth.uid())
    )
  );

-- PASSO 4: Verificar
SELECT 
    '✅ VERIFICAÇÃO' as status,
    policyname,
    'Política criada com função helper' as resultado
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clicks'
    AND cmd = 'INSERT';

-- =====================================================
-- Esta abordagem usa uma função STABLE que o Postgres
-- avalia apenas uma vez por query, resolvendo o aviso
-- =====================================================

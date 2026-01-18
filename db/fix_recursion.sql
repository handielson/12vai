-- =====================================================
-- CORREÇÃO: Recursão Infinita em Políticas RLS
-- =====================================================
-- O problema: políticas de users verificam is_admin
-- consultando a própria tabela users, criando loop
-- Solução: Usar políticas mais simples sem recursão
-- =====================================================

-- PASSO 1: Remover políticas problemáticas da tabela users
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users and admins can update profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;

-- PASSO 2: Criar políticas SEM recursão
-- Usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Users can manage own profile"
  ON public.users
  FOR ALL
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- PASSO 3: Criar função helper para verificar admin SEM recursão
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- Buscar is_admin diretamente sem usar política RLS
  SELECT is_admin INTO admin_status
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(admin_status, false);
END;
$$;

-- PASSO 4: Política para admins (usando função helper)
CREATE POLICY "Admins can manage all profiles"
  ON public.users
  FOR ALL
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- PASSO 5: Atualizar política de clicks para usar a função helper
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

-- PASSO 6: Verificar políticas criadas
SELECT 
    '✅ POLÍTICAS CRIADAS' as status,
    tablename,
    policyname,
    cmd as operacao
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('users', 'clicks')
ORDER BY tablename, policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- - 2 políticas em users (sem recursão)
-- - 1 política em clicks (otimizada)
-- =====================================================

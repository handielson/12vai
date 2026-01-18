-- =====================================================
-- CORREÇÃO FINAL: Políticas Consolidadas sem Recursão
-- =====================================================
-- Problema: FOR ALL cria múltiplas políticas permissivas
-- Solução: Uma política consolidada POR OPERAÇÃO
-- =====================================================

-- PASSO 1: Remover TODAS as políticas da tabela users
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users and admins can update profiles" ON public.users;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;

-- PASSO 2: Criar função helper para admin (sem recursão)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(admin_status, false);
END;
$$;

-- PASSO 3: Criar UMA política consolidada por operação

-- 3.1 SELECT: usuários veem próprio perfil OU admins veem todos
CREATE POLICY "Consolidated SELECT policy"
  ON public.users FOR SELECT
  USING (
    (SELECT auth.uid()) = id
    OR
    public.is_current_user_admin()
  );

-- 3.2 UPDATE: usuários atualizam próprio perfil OU admins atualizam todos
CREATE POLICY "Consolidated UPDATE policy"
  ON public.users FOR UPDATE
  USING (
    (SELECT auth.uid()) = id
    OR
    public.is_current_user_admin()
  )
  WITH CHECK (
    (SELECT auth.uid()) = id
    OR
    public.is_current_user_admin()
  );

-- 3.3 INSERT: apenas admins podem criar usuários
CREATE POLICY "Admins only INSERT policy"
  ON public.users FOR INSERT
  WITH CHECK (public.is_current_user_admin());

-- 3.4 DELETE: apenas admins podem deletar usuários
CREATE POLICY "Admins only DELETE policy"
  ON public.users FOR DELETE
  USING (public.is_current_user_admin());

-- PASSO 4: Verificar políticas criadas
SELECT 
    '✅ POLÍTICAS CRIADAS' as status,
    policyname,
    cmd as operacao
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'users'
ORDER BY cmd, policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- - 1 política para DELETE
-- - 1 política para INSERT  
-- - 1 política para SELECT
-- - 1 política para UPDATE
-- Total: 4 políticas (uma por operação)
-- =====================================================

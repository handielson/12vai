-- =====================================================
-- CORRIGIR RLS PARA ADMINS VEREM TODOS OS USUÁRIOS
-- =====================================================

-- O problema: As políticas RLS atuais permitem que usuários
-- vejam apenas seu próprio registro. Admins precisam ver TODOS.

-- Passo 1: Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can select own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Passo 2: Criar nova política para usuários comuns
-- Usuários comuns podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Passo 3: Criar política para ADMINS verem TODOS os usuários
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Passo 4: Manter política de UPDATE (usuários podem atualizar próprio perfil)
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Passo 5: Permitir que ADMINS atualizem qualquer usuário
DROP POLICY IF EXISTS "Admins can update any user" ON users;
CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Passo 6: Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- TESTE: Verificar se admin consegue ver todos
-- =====================================================
-- Execute como admin e deve ver TODOS os usuários:
-- SELECT email, is_admin, plan FROM users ORDER BY created_at DESC;

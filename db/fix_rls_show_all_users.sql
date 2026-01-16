-- =====================================================
-- CORRIGIR POLÍTICA RLS - MOSTRAR TODOS OS USUÁRIOS
-- =====================================================

-- O problema: A política atual só mostra usuários admin
-- Solução: Admins devem ver TODOS os usuários (admin ou não)

-- Passo 1: Remover política problemática
DROP POLICY IF EXISTS "Allow users to view profiles" ON users;

-- Passo 2: Criar política correta
-- Se você é admin, vê TODOS os usuários
-- Se não é admin, vê apenas seu próprio perfil
CREATE POLICY "Users can view profiles based on role"
  ON users FOR SELECT
  USING (
    -- Condição 1: Você está vendo seu próprio perfil
    auth.uid() = id
    OR
    -- Condição 2: Você é admin (pode ver QUALQUER usuário)
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.is_admin = true
    )
  );

-- Passo 3: Verificar políticas
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN 'Leitura'
        WHEN cmd = 'UPDATE' THEN 'Atualização'
        WHEN cmd = 'INSERT' THEN 'Inserção'
        WHEN cmd = 'DELETE' THEN 'Exclusão'
    END as tipo
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- Passo 4: Testar - deve mostrar TODOS os usuários
SELECT email, is_admin, plan 
FROM users 
ORDER BY is_admin DESC, created_at DESC;

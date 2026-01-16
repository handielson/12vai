-- =====================================================
-- VERIFICAR E CORRIGIR CAMPO custom_url_limit
-- =====================================================

-- Passo 1: Verificar se a coluna existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'custom_url_limit';

-- Passo 2: Se não existir, criar a coluna
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS custom_url_limit INTEGER;

-- Passo 3: Verificar políticas de UPDATE
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'UPDATE';

-- Passo 4: Garantir que admins podem fazer UPDATE
DROP POLICY IF EXISTS "Admins can update users" ON users;

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    -- Admin pode atualizar qualquer usuário
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
    OR
    -- Usuário pode atualizar próprio perfil
    auth.uid() = id
  );

-- Passo 5: Testar UPDATE (substitua o ID)
-- UPDATE users 
-- SET custom_url_limit = 100 
-- WHERE email = 'handielson@gmail.com';

-- Passo 6: Verificar
SELECT email, plan, custom_url_limit, is_admin 
FROM users 
ORDER BY created_at DESC;

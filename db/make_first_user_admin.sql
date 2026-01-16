-- =====================================================
-- CRIAR USUÁRIO ADMIN DE TESTE
-- =====================================================

-- ATENÇÃO: Este script cria um usuário diretamente na tabela users
-- Mas para fazer login, você AINDA PRECISA cadastrar via interface

-- Passo 1: Verificar se já existe algum usuário
SELECT email, is_admin FROM users LIMIT 10;

-- Passo 2: Se não houver usuários, você precisa:
-- 1. Acessar http://localhost:3000
-- 2. Clicar em "Criar conta" / "Registrar"
-- 3. Cadastrar com qualquer email/senha
-- 4. Depois executar o comando abaixo para tornar admin

-- Passo 3: Tornar o primeiro usuário admin
UPDATE users 
SET is_admin = true 
WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);

-- Verificar
SELECT email, is_admin, created_at FROM users WHERE is_admin = true;

-- =====================================================
-- ALTERNATIVA: Tornar TODOS os usuários admin (CUIDADO!)
-- =====================================================
-- Só use isso em desenvolvimento/teste
-- UPDATE users SET is_admin = true;

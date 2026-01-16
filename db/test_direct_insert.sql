-- Script de teste para verificar se a inserção de original_url funciona diretamente no banco
-- Execute este script no SQL Editor do Supabase para testar

-- IMPORTANTE: Substitua 'YOUR_USER_ID_HERE' pelo ID real de um usuário existente
-- Você pode obter um user_id executando: SELECT id FROM auth.users LIMIT 1;

-- Teste 1: Inserção direta com todos os campos
INSERT INTO urls (
  user_id,
  original_url,
  short_slug,
  prefix,
  title,
  is_premium,
  active
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- Substitua pelo ID real
  'https://example-test-direct.com',
  'test-direct-insert',
  'vai',
  'Direct Insert Test',
  false,
  true
) RETURNING *;

-- Teste 2: Verificar se a URL foi criada corretamente
SELECT 
  id,
  user_id,
  original_url,
  short_slug,
  title,
  created_at
FROM urls
WHERE short_slug = 'test-direct-insert';

-- Teste 3: Verificar se há alguma constraint ou trigger modificando original_url
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'urls'::regclass
  AND conname LIKE '%original%';

-- Teste 4: Verificar triggers na tabela urls
SELECT 
  tgname AS trigger_name,
  tgtype AS trigger_type,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'urls'::regclass;

-- Teste 5: Verificar o tipo de dados da coluna original_url
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'urls'
  AND column_name = 'original_url';

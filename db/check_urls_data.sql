-- Script para verificar os dados da tabela urls
-- Execute este script no SQL Editor do Supabase para verificar se original_url está sendo salvo

-- Verificar as últimas 10 URLs criadas
SELECT 
  id,
  user_id,
  original_url,
  short_slug,
  title,
  is_premium,
  active,
  clicks_count,
  created_at
FROM urls
ORDER BY created_at DESC
LIMIT 10;

-- Verificar se há URLs com original_url NULL ou vazio
SELECT 
  COUNT(*) as total_urls,
  COUNT(CASE WHEN original_url IS NULL THEN 1 END) as urls_with_null_original,
  COUNT(CASE WHEN original_url = '' THEN 1 END) as urls_with_empty_original
FROM urls;

-- Verificar a URL específica criada no teste (testdebug)
SELECT 
  id,
  user_id,
  original_url,
  short_slug,
  title,
  created_at
FROM urls
WHERE short_slug = 'testdebug'
ORDER BY created_at DESC
LIMIT 1;

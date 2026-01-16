-- ================================================
-- Marcar Item #2 do Roadmap como Completo
-- ================================================
-- Filtros e Busca de Usuários implementado!
-- ================================================

UPDATE project_documentation
SET content = jsonb_set(
  content,
  '{1,done}',
  'true'::jsonb
)
WHERE section = 'roadmap'
AND content->1->>'id' = 'user-filters';

-- Verificar atualização
SELECT 
  content->0->>'title' as item_1,
  content->0->>'done' as item_1_completo,
  content->1->>'title' as item_2,
  content->1->>'done' as item_2_completo
FROM project_documentation
WHERE section = 'roadmap';

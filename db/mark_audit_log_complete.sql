-- ================================================
-- Marcar Item #1 do Roadmap como Completo
-- ================================================
-- Log de Auditoria implementado com sucesso!
-- ================================================

UPDATE project_documentation
SET content = jsonb_set(
  content,
  '{0,done}',
  'true'::jsonb
)
WHERE section = 'roadmap'
AND content->0->>'id' = 'audit-log';

-- Verificar atualização
SELECT 
  content->0->>'title' as item,
  content->0->>'done' as completo
FROM project_documentation
WHERE section = 'roadmap';

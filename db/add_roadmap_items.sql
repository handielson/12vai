-- ================================================
-- Adicionar 2 Novos Itens ao Roadmap
-- ================================================
-- Atualiza a documentação com novos itens
-- ================================================

-- Buscar roadmap atual
SELECT content FROM project_documentation WHERE section = 'roadmap';

-- Adicionar 2 novos itens ao roadmap
UPDATE project_documentation
SET content = content || '[
  {"id": "export-data", "title": "Exportar Dados", "done": false, "description": "Exportar usuários e URLs para CSV/Excel"},
  {"id": "bulk-actions", "title": "Ações em Massa", "done": false, "description": "Editar múltiplos usuários simultaneamente"}
]'::jsonb
WHERE section = 'roadmap';

-- Verificar atualização
SELECT 
  section,
  jsonb_array_length(content) as total_items,
  content->-2->>'title' as penultimo_item,
  content->-1->>'title' as ultimo_item
FROM project_documentation
WHERE section = 'roadmap';

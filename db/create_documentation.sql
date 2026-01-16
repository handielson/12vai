-- ================================================
-- TABELA: Documentação do Projeto
-- ================================================
-- Armazena features implementadas, roadmap e notas
-- ================================================

CREATE TABLE IF NOT EXISTS project_documentation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section VARCHAR(50) NOT NULL, -- 'features', 'roadmap', 'notes'
  content JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dados iniciais: Features Implementadas
INSERT INTO project_documentation (section, content) VALUES
('features', '[
  {"id": "admin-panel", "title": "Painel Administrativo", "done": true, "description": "Dashboard com estatísticas e gestão"},
  {"id": "user-management", "title": "Gestão de Usuários", "done": true, "description": "Editar planos e limites"},
  {"id": "plan-preview", "title": "Preview de Planos", "done": true, "description": "Simular experiência de diferentes planos"},
  {"id": "plan-settings", "title": "Configurações de Planos", "done": true, "description": "Editar métricas de cada plano"},
  {"id": "impersonation", "title": "Impersonation (Logar como)", "done": true, "description": "Login como outro usuário"},
  {"id": "dynamic-titles", "title": "Títulos Dinâmicos", "done": true, "description": "Título da aba muda conforme página"}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Dados iniciais: Roadmap (Próximos Passos)
INSERT INTO project_documentation (section, content) VALUES
('roadmap', '[
  {"id": "audit-log", "title": "Log de Auditoria", "done": false, "description": "Registrar ações de admins"},
  {"id": "user-filters", "title": "Filtros e Busca de Usuários", "done": false, "description": "Buscar por email, plano, data"},
  {"id": "analytics-charts", "title": "Gráficos de Analytics", "done": false, "description": "Visualização de dados"},
  {"id": "feature-management", "title": "Gestão de Recursos dos Planos", "done": false, "description": "Editar lista de features"},
  {"id": "promotions", "title": "Sistema de Promoções", "done": false, "description": "Cupons e descontos"},
  {"id": "notifications", "title": "Notificações por Email", "done": false, "description": "Avisos e alertas"},
  {"id": "api-public", "title": "API Pública", "done": false, "description": "Endpoints para integração"},
  {"id": "white-label", "title": "White Label", "done": false, "description": "Personalização de marca"}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Dados iniciais: Notas
INSERT INTO project_documentation (section, content) VALUES
('notes', '{"text": "## Notas do Projeto\n\n### Cache do Vite\nSe alterações não aparecerem, limpar cache:\n```\nRemove-Item -Path node_modules\\.vite -Recurse -Force\nnpm run dev\n```\n\n### Credenciais Admin\nEmail: business@vaili.test\nSenha: 123456"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Verificar dados
SELECT section, content FROM project_documentation ORDER BY section;

-- ================================================
-- TABELA: Changelog do Aplicativo
-- ================================================
-- Armazena histórico de versões e mudanças
-- ================================================

CREATE TABLE IF NOT EXISTS app_changelog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version VARCHAR(20) NOT NULL UNIQUE,
  release_date DATE NOT NULL,
  changes JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para buscar versões
CREATE INDEX IF NOT EXISTS idx_changelog_version ON app_changelog(version);
CREATE INDEX IF NOT EXISTS idx_changelog_date ON app_changelog(release_date DESC);

-- Versão 1.0.0 - Lançamento Inicial
INSERT INTO app_changelog (version, release_date, changes) VALUES
('1.0.0', '2026-01-13', '{
  "new": [
    "Painel Administrativo completo",
    "Gestão de Usuários com edição de planos",
    "Configurações de Planos dinâmicas",
    "Preview de Planos para testar experiência",
    "Impersonation - Logar como outro usuário",
    "Sistema de encurtamento de URLs",
    "Analytics em tempo real com gráficos",
    "QR Codes para links encurtados"
  ]
}'::jsonb);

-- Versão 1.1.0 - Log de Auditoria e Documentação
INSERT INTO app_changelog (version, release_date, changes) VALUES
('1.1.0', '2026-01-14', '{
  "new": [
    "Log de Auditoria - Rastreie todas as ações administrativas",
    "Painel de Documentação - Acompanhe features implementadas e roadmap",
    "Aba Auditoria no Admin Panel com timeline",
    "Sistema de numeração do roadmap para fácil referência",
    "Filtros de ações no log de auditoria"
  ],
  "improved": [
    "Títulos dinâmicos das páginas do navegador",
    "Performance do Admin Dashboard",
    "Interface de edição de usuários com rastreamento",
    "Organização das abas do Admin Panel"
  ],
  "fixed": [
    "Bug de cache do Vite em nomes de abas",
    "Persistência de configurações de planos",
    "Duplicatas na tabela de documentação"
  ]
}'::jsonb);

-- Verificar dados
SELECT version, release_date, 
       jsonb_array_length(changes->'new') as novidades,
       jsonb_array_length(changes->'improved') as melhorias,
       jsonb_array_length(changes->'fixed') as correcoes
FROM app_changelog
ORDER BY release_date DESC;

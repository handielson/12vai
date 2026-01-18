-- Popular painel de documentação com sugestões de melhorias
-- Execute este script no Supabase SQL Editor

-- Limpar dados antigos do roadmap
DELETE FROM project_documentation WHERE section = 'roadmap';

-- Inserir sugestões de melhorias no roadmap
INSERT INTO project_documentation (section, content, updated_at)
VALUES (
    'roadmap',
    '[
        {
            "id": "roadmap-1",
            "title": "📧 Templates React Email",
            "description": "📊 Impacto: Alto | ⏱️ Tempo: 8-12h | 💰 Custo: R$ 0 (grátis)\n✅ Benefícios: Emails responsivos, fácil manutenção, preview em tempo real\n💡 ROI: Melhora deliverability e engajamento (+30% open rate)",
            "done": false
        },
        {
            "id": "roadmap-2",
            "title": "🎨 Dark Mode Completo",
            "description": "📊 Impacto: Médio | ⏱️ Tempo: 12-16h | 💰 Custo: R$ 0 (grátis)\n✅ Benefícios: UX moderna, reduz fadiga ocular, preferência de 60% dos usuários\n💡 ROI: Aumenta tempo de sessão e satisfação do usuário",
            "done": false
        },
        {
            "id": "roadmap-3",
            "title": "📊 Geolocalização de Cliques",
            "description": "📊 Impacto: Alto | ⏱️ Tempo: 16-20h | 💰 Custo: R$ 280/mês (MaxMind GeoIP2)\n✅ Benefícios: Insights valiosos, segmentação geográfica, otimização de campanhas\n💡 ROI: Feature premium que justifica upgrade (+20% conversão Pro→Business)",
            "done": false
        },
        {
            "id": "roadmap-4",
            "title": "📧 Painel de Preferências de Email",
            "description": "📊 Impacto: Alto | ⏱️ Tempo: 6-8h | 💰 Custo: R$ 0 (grátis)\n✅ Benefícios: Compliance LGPD/GDPR, reduz spam reports, melhora reputação\n💡 ROI: Essencial para escalabilidade e conformidade legal",
            "done": false
        },
        {
            "id": "roadmap-5",
            "title": "📧 Triggers Automáticos",
            "description": "📊 Impacto: Alto | ⏱️ Tempo: 8-10h | 💰 Custo: R$ 0 (incluído Resend)\n✅ Benefícios: Onboarding automático, engajamento sem esforço, nurturing\n💡 ROI: Aumenta ativação de novos usuários (+40% retention)",
            "done": false
        },
        {
            "id": "roadmap-6",
            "title": "📧 Relatórios Semanais",
            "description": "📊 Impacto: Médio | ⏱️ Tempo: 10-12h | 💰 Custo: R$ 0 (incluído Resend)\n✅ Benefícios: Mantém usuários engajados, mostra valor do produto, reduz churn\n💡 ROI: Reduz cancelamentos em ~15%, aumenta upsell",
            "done": false
        },
        {
            "id": "roadmap-7",
            "title": "⏰ Cron Jobs Vercel",
            "description": "📊 Impacto: Alto | ⏱️ Tempo: 4-6h | 💰 Custo: R$ 0 (incluído Vercel)\n✅ Benefícios: Automações essenciais, escalabilidade, confiabilidade\n💡 ROI: Infraestrutura base para features automáticas",
            "done": false
        },
        {
            "id": "roadmap-8",
            "title": "📊 Exportar Relatórios",
            "description": "📊 Impacto: Médio | ⏱️ Tempo: 6-8h | 💰 Custo: R$ 0 (grátis)\n✅ Benefícios: Análise externa, compartilhamento com equipe, compliance\n💡 ROI: Feature esperada em planos Business+, facilita vendas B2B",
            "done": false
        },
        {
            "id": "roadmap-9",
            "title": "💳 Integração de Pagamento",
            "description": "📊 Impacto: CRÍTICO | ⏱️ Tempo: 24-32h | 💰 Custo: 4.99% + R$ 0,49 por transação (Stripe BR)\n✅ Benefícios: MONETIZAÇÃO, receita recorrente, crescimento sustentável\n💡 ROI: Essencial para viabilidade do negócio - prioridade #1",
            "done": false
        },
        {
            "id": "roadmap-10",
            "title": "💰 Sistema de Checkout",
            "description": "📊 Impacto: CRÍTICO | ⏱️ Tempo: 16-20h | 💰 Custo: R$ 0 (grátis, usa Stripe)\n✅ Benefícios: Conversão otimizada, aplicação de cupons, upsell\n💡 ROI: Cada 1% de melhoria = +R$ 500-2000 MRR, essencial para crescimento",
            "done": false
        },
        {
            "id": "roadmap-11",
            "title": "🔄 Gerenciamento de Assinaturas",
            "description": "📊 Impacto: Alto | ⏱️ Tempo: 12-16h | 💰 Custo: R$ 0 (incluído Stripe)\n✅ Benefícios: Self-service reduz suporte, flexibilidade aumenta satisfação\n💡 ROI: Reduz churn em 20%, permite upgrade/downgrade sem atrito",
            "done": false
        },
        {
            "id": "roadmap-12",
            "title": "🧾 Sistema de Faturas",
            "description": "📊 Impacto: Médio | ⏱️ Tempo: 8-12h | 💰 Custo: R$ 0 (Stripe gera automaticamente)\n✅ Benefícios: Compliance fiscal, profissionalismo, vendas B2B\n💡 ROI: Obrigatório para empresas, facilita vendas corporativas",
            "done": false
        },
        {
            "id": "roadmap-13",
            "title": "⏰ Links Expiráveis",
            "description": "📊 Impacto: Alto | ⏱️ Tempo: 8-10h | 💰 Custo: R$ 0 (grátis)\n✅ Benefícios: Campanhas temporárias, segurança, controle de acesso\n💡 ROI: Feature premium diferenciadora, comum em planos Business+",
            "done": false
        },
        {
            "id": "roadmap-14",
            "title": "🔒 Proteção por Senha",
            "description": "📊 Impacto: Médio | ⏱️ Tempo: 6-8h | 💰 Custo: R$ 0 (grátis)\n✅ Benefícios: Conteúdo exclusivo, segurança, casos de uso premium\n💡 ROI: Diferencial competitivo, atrai clientes corporativos",
            "done": false
        },
        {
            "id": "roadmap-15",
            "title": "📊 A/B Testing",
            "description": "📊 Impacto: Alto | ⏱️ Tempo: 20-24h | 💰 Custo: R$ 0 (grátis, lógica própria)\n✅ Benefícios: Otimização de conversão, insights valiosos, ROI mensurável\n💡 ROI: Clientes pagam premium por esta feature, aumenta LTV em 30%",
            "done": false
        }
    ]'::jsonb,
    NOW()
);

-- Verificar inserção
SELECT 
    section, 
    jsonb_array_length(content) as total_items,
    updated_at
FROM project_documentation
WHERE section = 'roadmap';


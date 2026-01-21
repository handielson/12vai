-- ============================================
-- Migration: Email Templates System
-- ============================================

-- Tabela de templates de email
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    subject VARCHAR(200) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Histórico de versões dos templates
CREATE TABLE IF NOT EXISTS email_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    change_notes TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(active);
CREATE INDEX IF NOT EXISTS idx_email_template_versions_template ON email_template_versions(template_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_email_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_template_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_template_updated_at();

-- Função para criar versão ao atualizar template
CREATE OR REPLACE FUNCTION create_email_template_version()
RETURNS TRIGGER AS $$
DECLARE
    v_version_number INTEGER;
BEGIN
    -- Obter próximo número de versão
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO v_version_number
    FROM email_template_versions
    WHERE template_id = NEW.id;

    -- Criar versão
    INSERT INTO email_template_versions (
        template_id,
        subject,
        html_content,
        text_content,
        version_number,
        created_by
    ) VALUES (
        NEW.id,
        NEW.subject,
        NEW.html_content,
        NEW.text_content,
        v_version_number,
        NEW.updated_by
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_email_template_version
    AFTER UPDATE ON email_templates
    FOR EACH ROW
    WHEN (OLD.html_content IS DISTINCT FROM NEW.html_content 
          OR OLD.subject IS DISTINCT FROM NEW.subject)
    EXECUTE FUNCTION create_email_template_version();

-- ============================================
-- Inserir Templates Padrão
-- ============================================

-- 1. Email de Boas-vindas
INSERT INTO email_templates (type, name, description, subject, html_content, text_content, variables)
VALUES (
    'welcome',
    'Email de Boas-vindas',
    'Enviado quando um novo usuário se registra',
    'Bem-vindo ao 12Vai, {user_name}! 🎉',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px 20px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 32px;">🎉 Bem-vindo ao 12Vai!</h1>
        </div>
        <div class="content">
            <p style="font-size: 18px;">Olá <strong>{user_name}</strong>,</p>
            <p>Estamos muito felizes em ter você conosco! O 12Vai é a maneira mais fácil de criar, gerenciar e rastrear links encurtados.</p>
            
            <div class="features">
                <h3 style="color: #667eea; margin-top: 0;">🚀 Primeiros Passos:</h3>
                <div class="feature-item">✨ Crie seu primeiro link encurtado</div>
                <div class="feature-item">🎨 Personalize com slug customizado</div>
                <div class="feature-item">📊 Acompanhe cliques em tempo real</div>
                <div class="feature-item">📱 Gere QR Codes personalizados</div>
            </div>
            
            <div style="text-align: center;">
                <a href="{dashboard_link}" class="button">Acessar Meu Painel</a>
            </div>
            
            <p style="margin-top: 30px;">Se precisar de ajuda, nossa equipe está sempre disponível em <a href="mailto:{support_email}" style="color: #667eea;">{support_email}</a></p>
        </div>
        <div class="footer">
            <p>© {current_year} 12Vai. Todos os direitos reservados.</p>
            <p><a href="{settings_link}" style="color: #667eea;">Gerenciar Preferências de Email</a></p>
        </div>
    </div>
</body>
</html>',
    'Olá {user_name},

Bem-vindo ao 12Vai! Estamos muito felizes em ter você conosco.

Primeiros Passos:
- Crie seu primeiro link encurtado
- Personalize com slug customizado
- Acompanhe cliques em tempo real
- Gere QR Codes personalizados

Acesse seu painel: {dashboard_link}

Precisa de ajuda? Entre em contato: {support_email}

© {current_year} 12Vai',
    '["user_name", "user_email", "dashboard_link", "settings_link", "support_email", "current_year"]'::jsonb
)
ON CONFLICT (type) DO NOTHING;

-- 2. Confirmação de Pagamento
INSERT INTO email_templates (type, name, description, subject, html_content, variables)
VALUES (
    'payment_success',
    'Confirmação de Pagamento',
    'Enviado quando um pagamento é confirmado',
    'Pagamento Confirmado - {plan_name} 💳',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .invoice-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Pagamento Confirmado!</h1>
        </div>
        <div class="content">
            <p>Olá <strong>{user_name}</strong>,</p>
            <p>Seu pagamento foi processado com sucesso!</p>
            
            <div class="invoice-box">
                <h3>Detalhes da Assinatura</h3>
                <p><strong>Plano:</strong> {plan_name}</p>
                <p><strong>Valor:</strong> R$ {amount}</p>
                <p><strong>Próxima cobrança:</strong> {next_billing_date}</p>
            </div>
            
            <a href="{invoice_link}" class="button">Ver Fatura</a>
            
            <p>Obrigado por escolher o 12Vai!</p>
        </div>
    </div>
</body>
</html>',
    '["user_name", "plan_name", "amount", "next_billing_date", "invoice_link"]'::jsonb
)
ON CONFLICT (type) DO NOTHING;

-- 3. Falha de Pagamento
INSERT INTO email_templates (type, name, description, subject, html_content, variables)
VALUES (
    'payment_failed',
    'Falha de Pagamento',
    'Enviado quando um pagamento falha',
    'Problema com seu Pagamento - 12Vai ⚠️',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Problema com Pagamento</h1>
        </div>
        <div class="content">
            <p>Olá <strong>{user_name}</strong>,</p>
            <p>Não conseguimos processar o pagamento da sua assinatura <strong>{plan_name}</strong>.</p>
            <p>Por favor, atualize seu método de pagamento para continuar aproveitando todos os recursos.</p>
            
            <a href="{update_payment_link}" class="button">Atualizar Pagamento</a>
            
            <p>Se precisar de ajuda, entre em contato: {support_email}</p>
        </div>
    </div>
</body>
</html>',
    '["user_name", "plan_name", "update_payment_link", "support_email"]'::jsonb
)
ON CONFLICT (type) DO NOTHING;

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template_versions ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar templates
CREATE POLICY email_templates_admin_all
    ON email_templates
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
    );

CREATE POLICY email_template_versions_admin_all
    ON email_template_versions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
    );

-- Comentários
COMMENT ON TABLE email_templates IS 'Templates de email editáveis pelo admin';
COMMENT ON TABLE email_template_versions IS 'Histórico de versões dos templates';
COMMENT ON COLUMN email_templates.variables IS 'Lista de variáveis disponíveis no template (JSON array)';

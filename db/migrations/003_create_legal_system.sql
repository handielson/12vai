-- =====================================================
-- SISTEMA DE ACEITE DE TERMOS - VaiEncurta
-- =====================================================
-- Migration: 003_create_legal_system.sql
-- Descrição: Sistema completo de termos editáveis com aceite de usuários
-- =====================================================

-- Criar ENUM para tipos de documento
CREATE TYPE document_type AS ENUM ('terms', 'privacy', 'cookies');

-- =====================================================
-- TABELA: legal_documents
-- Armazena os documentos legais editáveis
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type document_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown
    version INTEGER NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: user_acceptances
-- Registra aceites dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS user_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES legal_documents(id),
    document_type document_type NOT NULL,
    document_version INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT idx_user_document UNIQUE (user_id, document_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_legal_documents_type_active ON legal_documents(type, active);

-- Garantir apenas um documento ativo por tipo (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_document 
    ON legal_documents(type) 
    WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_user_acceptances_user_id ON user_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_acceptances_document_id ON user_acceptances(document_id);

-- =====================================================
-- TRIGGER: Atualizar updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_legal_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_legal_documents_updated_at
    BEFORE UPDATE ON legal_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_legal_documents_updated_at();

-- =====================================================
-- FUNÇÃO: Buscar documentos ativos
-- =====================================================
CREATE OR REPLACE FUNCTION get_active_documents()
RETURNS TABLE (
    id UUID,
    type document_type,
    title TEXT,
    content TEXT,
    version INTEGER
) 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ld.id,
        ld.type,
        ld.title,
        ld.content,
        ld.version
    FROM public.legal_documents ld
    WHERE ld.active = true
    ORDER BY ld.type;
END;
$$;

-- =====================================================
-- FUNÇÃO: Verificar se usuário aceitou versão atual
-- =====================================================
CREATE OR REPLACE FUNCTION check_user_acceptance(p_user_id UUID)
RETURNS TABLE (
    needs_acceptance BOOLEAN,
    pending_documents TEXT[]
)
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
    v_pending TEXT[];
BEGIN
    -- Buscar documentos ativos que o usuário não aceitou
    SELECT ARRAY_AGG(ld.type::TEXT)
    INTO v_pending
    FROM public.legal_documents ld
    WHERE ld.active = true
    AND NOT EXISTS (
        SELECT 1 
        FROM public.user_acceptances ua
        WHERE ua.user_id = p_user_id
        AND ua.document_id = ld.id
        AND ua.document_version = ld.version
    );
    
    RETURN QUERY SELECT 
        (v_pending IS NOT NULL AND array_length(v_pending, 1) > 0),
        COALESCE(v_pending, ARRAY[]::TEXT[]);
END;
$$;

-- =====================================================
-- FUNÇÃO: Registrar aceite do usuário
-- =====================================================
CREATE OR REPLACE FUNCTION record_acceptance(
    p_user_id UUID,
    p_document_id UUID,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
    v_document_type document_type;
    v_document_version INTEGER;
BEGIN
    -- Buscar informações do documento
    SELECT type, version
    INTO v_document_type, v_document_version
    FROM public.legal_documents
    WHERE id = p_document_id AND active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Documento não encontrado ou inativo';
    END IF;
    
    -- Inserir ou atualizar aceite
    INSERT INTO public.user_acceptances (
        user_id,
        document_id,
        document_type,
        document_version,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_document_id,
        v_document_type,
        v_document_version,
        p_ip_address,
        p_user_agent
    )
    ON CONFLICT (user_id, document_id)
    DO UPDATE SET
        document_version = v_document_version,
        ip_address = p_ip_address,
        user_agent = p_user_agent,
        accepted_at = NOW();
    
    RETURN true;
END;
$$;

-- =====================================================
-- FUNÇÃO: Publicar nova versão (Admin)
-- =====================================================
CREATE OR REPLACE FUNCTION publish_new_version(
    p_document_id UUID,
    p_admin_user_id UUID
)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_version INTEGER;
    v_document_type document_type;
    v_is_admin BOOLEAN;
BEGIN
    -- Verificar se usuário é admin
    SELECT is_admin INTO v_is_admin
    FROM public.users
    WHERE id = p_admin_user_id;
    
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Apenas administradores podem publicar novas versões';
    END IF;
    
    -- Desativar versão atual
    UPDATE public.legal_documents
    SET active = false
    WHERE type = (SELECT type FROM public.legal_documents WHERE id = p_document_id)
    AND active = true;
    
    -- Incrementar versão e ativar
    UPDATE public.legal_documents
    SET 
        version = version + 1,
        active = true,
        updated_at = NOW()
    WHERE id = p_document_id
    RETURNING version, type INTO v_new_version, v_document_type;
    
    RETURN v_new_version;
END;
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_acceptances ENABLE ROW LEVEL SECURITY;

-- Policies para legal_documents
CREATE POLICY "Todos podem ver documentos ativos"
    ON legal_documents FOR SELECT
    USING (active = true);

CREATE POLICY "Admins podem inserir documentos"
    ON legal_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = (SELECT auth.uid())
            AND is_admin = true
        )
    );

CREATE POLICY "Admins podem atualizar documentos"
    ON legal_documents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = (SELECT auth.uid())
            AND is_admin = true
        )
    );

-- Policies para user_acceptances
CREATE POLICY "Usuários veem seus próprios aceites"
    ON user_acceptances FOR SELECT
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins veem todos os aceites"
    ON user_acceptances FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = (SELECT auth.uid())
            AND is_admin = true
        )
    );

CREATE POLICY "Usuários podem registrar aceite"
    ON user_acceptances FOR INSERT
    WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- INSERIR TERMOS INICIAIS
-- =====================================================

-- Termos de Uso
INSERT INTO legal_documents (type, title, content, version, active, created_by)
VALUES (
    'terms',
    'Termos de Uso - VaiEncurta',
    '# Termos de Uso - VaiEncurta

**Última atualização:** ' || TO_CHAR(NOW(), 'DD/MM/YYYY') || '

Bem-vindo ao **VaiEncurta** (12vai.com). Ao utilizar nossos serviços, você concorda com estes Termos de Uso.

## 1. Aceitação dos Termos
Ao acessar e usar o VaiEncurta, você aceita e concorda em cumprir estes Termos de Uso e nossa Política de Privacidade.

## 2. Descrição do Serviço
O VaiEncurta é uma plataforma SaaS de encurtamento de URLs.

## 3. Uso Aceitável
Você pode criar links para conteúdo legal e legítimo. É proibido criar links para conteúdo ilegal, fraudulento ou malicioso.

Para termos completos, acesse: https://12vai.com/termos',
    1,
    true,
    NULL
);

-- Política de Privacidade
INSERT INTO legal_documents (type, title, content, version, active, created_by)
VALUES (
    'privacy',
    'Política de Privacidade - VaiEncurta',
    '# Política de Privacidade - VaiEncurta

**Última atualização:** ' || TO_CHAR(NOW(), 'DD/MM/YYYY') || '

Esta Política de Privacidade descreve como o VaiEncurta coleta, usa e protege suas informações pessoais.

## 1. Informações que Coletamos
Coletamos informações de conta, dados de uso e informações de pagamento.

## 2. Como Usamos Suas Informações
Usamos seus dados para fornecer o serviço, melhorar a plataforma e garantir segurança.

## 3. Seus Direitos (LGPD)
Você tem direito a acessar, corrigir, excluir e portar seus dados conforme a LGPD.

Para política completa, acesse: https://12vai.com/privacidade',
    1,
    true,
    NULL
);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT '✅ SISTEMA DE TERMOS CRIADO COM SUCESSO!' as status;
SELECT 'Tabelas: legal_documents, user_acceptances' as info;
SELECT 'Funções: get_active_documents, check_user_acceptance, record_acceptance, publish_new_version' as functions;

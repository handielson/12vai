-- =====================================================
-- ATUALIZAR POLÍTICA DE PRIVACIDADE COM CONTEÚDO COMPLETO
-- =====================================================

UPDATE legal_documents
SET content = '# Política de Privacidade - VaiEncurta

**Última atualização:** 18 de Janeiro de 2026  
**Versão:** 1.0

Esta Política de Privacidade descreve como o **VaiEncurta** (12vai.com) coleta, usa e protege suas informações pessoais, em conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)**.

---

## 1. Informações que Coletamos

### 1.1 Informações de Conta
- Nome completo
- Endereço de e-mail
- Senha (armazenada com criptografia bcrypt)
- Plano contratado e histórico de upgrades
- Data de criação e último acesso

### 1.2 Informações de Uso
- URLs criadas e seus destinos
- Cliques em links (data, hora, localização aproximada por IP)
- Dispositivo e navegador usado (User-Agent)
- Endereço IP de origem
- Referrer (de onde veio o clique)
- País e cidade aproximada (via geolocalização de IP)

### 1.3 Informações de Pagamento
- Dados de cartão de crédito (processados e armazenados por Stripe/PayPal, não por nós)
- Histórico de transações e faturas
- Método de pagamento preferido
- Informações fiscais (CPF/CNPJ quando fornecido)

### 1.4 Cookies e Tecnologias Similares
- Cookies de sessão para autenticação (essenciais)
- Cookies de preferências do usuário
- Cookies de analytics (Google Analytics - anônimo)
- Local Storage para cache de dados

---

## 2. Base Legal para Tratamento (LGPD)

Tratamos seus dados pessoais com base nas seguintes hipóteses legais:

- **Execução de contrato:** Para fornecer o serviço contratado
- **Consentimento:** Para envio de newsletters e comunicações de marketing
- **Legítimo interesse:** Para prevenir fraudes e melhorar o serviço
- **Obrigação legal:** Para cumprimento de obrigações fiscais e legais
- **Proteção ao crédito:** Para processar pagamentos e cobranças

---

## 3. Como Usamos Suas Informações

### 3.1 Fornecer o Serviço
- Criar e gerenciar sua conta
- Processar criação e redirecionamento de links
- Gerar relatórios de analytics e estatísticas
- Enviar notificações importantes sobre sua conta
- Processar upgrades e downgrades de plano

### 3.2 Melhorar o Serviço
- Analisar padrões de uso para otimizar performance
- Identificar e corrigir bugs e problemas técnicos
- Desenvolver novos recursos baseados em feedback
- Realizar testes A/B para melhorias de UX
- Otimizar infraestrutura e custos

### 3.3 Comunicação
- Enviar atualizações importantes do serviço
- Notificar sobre mudanças nos termos e políticas
- Responder a solicitações de suporte
- Enviar newsletters (com opt-out disponível)
- Informar sobre novos recursos e promoções

### 3.4 Segurança e Conformidade
- Prevenir fraudes, abusos e atividades maliciosas
- Proteger contra ataques cibernéticos
- Cumprir obrigações legais e regulatórias
- Responder a solicitações de autoridades competentes
- Manter logs de auditoria para segurança

---

## 4. Compartilhamento de Informações

### 4.1 NÃO Vendemos Seus Dados
**Nunca** vendemos, alugamos ou comercializamos suas informações pessoais para terceiros.

### 4.2 Compartilhamento Necessário

Compartilhamos dados apenas quando estritamente necessário:

**Processadores de Pagamento:**
- Stripe e PayPal (dados de pagamento)
- Apenas informações necessárias para processar transações
- Cobertos por contratos de confidencialidade

**Provedores de Infraestrutura:**
- Supabase (banco de dados) - Certificado SOC 2 Type II
- Vercel (hospedagem) - Certificado ISO 27001
- Dados criptografados em trânsito (TLS 1.3) e em repouso (AES-256)

**Autoridades Legais:**
- Quando exigido por lei ou ordem judicial
- Para proteger nossos direitos legais
- Em investigações de fraude ou crimes
- Mediante requisição formal de autoridades competentes

### 4.3 Nunca Compartilhamos
- Listas de e-mails para marketing de terceiros
- Dados de analytics individualizados
- Informações de navegação detalhadas
- Dados pessoais para fins publicitários

---

## 5. Seus Direitos (LGPD)

Conforme a **Lei Geral de Proteção de Dados (LGPD)**, você tem os seguintes direitos:

### 5.1 Confirmação e Acesso (Art. 18, I e II)
- Confirmar se tratamos seus dados pessoais
- Acessar todos os dados que temos sobre você
- Receber cópia completa em formato legível

### 5.2 Correção (Art. 18, III)
- Corrigir dados incompletos, inexatos ou desatualizados
- Atualizar informações de perfil a qualquer momento

### 5.3 Anonimização, Bloqueio ou Eliminação (Art. 18, IV)
- Solicitar anonimização de dados desnecessários
- Bloquear dados excessivos ou tratados em desconformidade
- Solicitar eliminação completa de dados (direito ao esquecimento)

### 5.4 Portabilidade (Art. 18, V)
- Exportar seus dados em formato estruturado (JSON/CSV)
- Transferir dados para outro fornecedor de serviço

### 5.5 Eliminação de Dados Tratados com Consentimento (Art. 18, VI)
- Excluir dados tratados com base em consentimento
- Revogar consentimento a qualquer momento

### 5.6 Informação sobre Compartilhamento (Art. 18, VII)
- Saber com quem compartilhamos seus dados
- Receber lista de entidades públicas e privadas

### 5.7 Informação sobre Não Consentimento (Art. 18, VIII)
- Ser informado sobre consequências de não fornecer consentimento

### 5.8 Revogação do Consentimento (Art. 18, IX)
- Revogar consentimento a qualquer momento
- Cancelar newsletters e comunicações de marketing

**Para exercer seus direitos:**  
📧 E-mail: privacidade@12vai.com  
⏱️ Prazo de resposta: Até 15 dias úteis (conforme LGPD Art. 18, §3º)

---

## 6. Segurança de Dados

### 6.1 Medidas Técnicas
- **Criptografia:** SSL/TLS 1.3 em todas as conexões
- **Senhas:** Hash bcrypt com salt único
- **Firewall:** Proteção contra ataques DDoS e invasões
- **Backups:** Diários, criptografados e geograficamente distribuídos
- **Monitoramento:** 24/7 para detecção de anomalias
- **Atualizações:** Patches de segurança aplicados regularmente

### 6.2 Medidas Organizacionais
- Acesso restrito a dados pessoais (princípio do menor privilégio)
- Treinamento regular de equipe em privacidade e segurança
- Auditorias de segurança periódicas (internas e externas)
- Política de resposta a incidentes documentada
- Contratos de confidencialidade com todos os colaboradores

### 6.3 Retenção de Dados
- **Dados de conta:** Enquanto conta estiver ativa
- **Dados de uso:** 24 meses para analytics
- **Dados de pagamento:** 5 anos (obrigação fiscal - Lei 8.137/90)
- **Logs de acesso:** 6 meses (Marco Civil da Internet - Lei 12.965/14)
- **Após exclusão:** 30 dias em backup, depois eliminação permanente

---

## 7. Cookies e Rastreamento

### 7.1 Tipos de Cookies Utilizados

**Cookies Essenciais (Não podem ser desabilitados):**
- Autenticação de sessão
- Preferências de idioma e tema
- Segurança e prevenção de fraudes

**Cookies de Analytics (Podem ser desabilitados):**
- Google Analytics (modo anônimo, sem PII)
- Rastreamento de uso para melhorias
- Métricas de performance

**Cookies de Marketing (Não utilizamos):**
- Não fazemos remarketing
- Não rastreamos entre sites
- Não vendemos dados para anunciantes

### 7.2 Como Controlar Cookies
- Configurações do navegador (Chrome, Firefox, Safari, Edge)
- Ferramentas de opt-out do Google Analytics
- Modo anônimo/privado do navegador
- Extensões de bloqueio de cookies

---

## 8. Transferência Internacional de Dados

- **Servidores Primários:** Brasil (São Paulo - AWS)
- **Backup Secundário:** EUA (Virgínia - AWS)
- **Conformidade:** Cláusulas contratuais padrão (SCC)
- **Certificações:** SOC 2, ISO 27001, GDPR compliance
- **Garantias:** Mesmo nível de proteção em todos os locais

---

## 9. Privacidade de Menores

- Serviço **não destinado** a menores de 18 anos
- Não coletamos **intencionalmente** dados de menores
- Se identificado, excluímos imediatamente
- Pais/responsáveis podem solicitar exclusão: suporte@12vai.com

---

## 10. Mudanças nesta Política

- Podemos atualizar esta política periodicamente
- Notificaremos sobre mudanças **significativas** por e-mail
- Versão atual sempre disponível em: **12vai.com/privacidade**
- Uso continuado após mudanças constitui aceitação
- Mudanças entram em vigor **7 dias** após notificação

---

## 11. Encarregado de Dados (DPO)

Conforme LGPD Art. 41, nosso Encarregado de Proteção de Dados é:

**Nome:** Equipe de Privacidade VaiEncurta  
**E-mail:** privacidade@12vai.com  
**Função:** Aceitar reclamações, prestar esclarecimentos e adotar providências

**Horário de Atendimento:** Segunda a Sexta, 9h às 18h (Brasília)  
**Prazo de Resposta:** Até 15 dias úteis

---

## 12. Autoridade de Proteção de Dados

Se não estivermos respondendo adequadamente às suas solicitações, você pode contatar:

**ANPD - Autoridade Nacional de Proteção de Dados**  
🌐 Site: https://www.gov.br/anpd  
📧 E-mail: atendimento@anpd.gov.br  
📞 Telefone: 0800-940-2004

---

## 13. Contato

**Suporte Geral:**
- E-mail: suporte@12vai.com
- Site: https://12vai.com
- Horário: Segunda a Sexta, 9h às 18h

**Privacidade e Dados:**
- E-mail: privacidade@12vai.com
- Resposta em até 15 dias úteis

---

**Ao usar o VaiEncurta, você concorda com esta Política de Privacidade.**

**Versão 1.0 - Vigente desde 18 de Janeiro de 2026**

---

© 2026 VaiEncurta. Todos os direitos reservados.'
WHERE type = 'privacy' AND active = true;

-- Verificar atualização
SELECT 'Política de Privacidade atualizada!' as status,
       LENGTH(content) as tamanho_caracteres,
       version as versao
FROM legal_documents 
WHERE type = 'privacy' AND active = true;

-- Verificar ambos os documentos
SELECT 
    type as tipo,
    title as titulo,
    version as versao,
    LENGTH(content) as tamanho,
    active as ativo
FROM legal_documents
WHERE active = true
ORDER BY type;

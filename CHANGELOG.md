# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.7.0] - 2026-01-18

### 📧 Sistema de Notificações por Email

#### Adicionado
- Sistema completo de notificações por email com Resend
- Integração serverless via Vercel Functions
- Preferências de email por usuário
- Templates HTML para emails transacionais
- Painel de testes no admin
- Logging completo de envios
- DNS configurado para domínio verificado

#### Database
- Tabela `email_preferences` para preferências do usuário
- Tabela `email_logs` para histórico de envios
- ENUMs: `email_type`, `email_status`, `report_frequency`
- Funções SQL: `get_email_preferences`, `update_email_preferences`, `can_send_email`, `log_email_sent`, `update_email_status`, `get_email_stats`
- RLS policies para segurança de dados

#### Frontend
- Componente `EmailTestPanel.tsx` para admin
- Interface de teste com verificação de configuração
- Botões para testar welcome email e limit alert
- Feedback visual de sucesso/erro
- Integração na aba "Email" do AdminPortal

#### Backend
- Serviço `emailService.ts` completo
- Cliente Resend configurado em `lib/resend.ts`
- Serverless function `api/send-email.ts`
- Templates HTML para WelcomeEmail e LimitAlert
- Verificação de preferências antes de enviar
- Logging automático de todos os envios

#### Infraestrutura
- Variáveis de ambiente configuradas na Vercel
- DNS records adicionados (DKIM, SPF, DMARC)
- Domínio 12vai.com configurado no Resend
- Serverless function deployada

#### Tipos de Email
- **Welcome Email** - Boas-vindas para novos usuários
- **Limit Alert** - Alerta ao atingir 80% do plano
- **Weekly Report** - Relatórios semanais (planejado)
- **Expiry Alert** - Alertas de expiração (planejado)

#### Próximos Passos
- [ ] Migrar templates para React Email
- [ ] Implementar relatórios semanais automáticos
- [ ] Configurar Vercel Cron Jobs
- [ ] Painel de preferências para usuários
- [ ] Triggers automáticos (welcome, upgrade, etc)

### 🔧 Melhorias Gerais
- Versão atualizada para 1.7.0
- Documentação completa do sistema de emails
- Guias de configuração DNS

---

## [1.6.0] - 2026-01-18

### 🔌 Sistema de API Pública

#### Adicionado
- Sistema completo de API REST para integração externa
- Autenticação via API Key com hash SHA-256
- Rate limiting baseado em plano do usuário
- Endpoints CRUD completos para URLs
- Endpoint de estatísticas de cliques
- Endpoint de informações do usuário
- Painel admin para gerenciamento de API keys
- Documentação completa da API com exemplos

#### Database
- Tabela `api_keys` para armazenar chaves de API
- Tabela `api_requests` para logging e analytics
- Funções SQL: `validate_api_key`, `check_rate_limit`, `log_api_request`, `get_api_stats`
- RLS policies para segurança de dados

#### Frontend
- Componente `ApiKeysPanel.tsx` para admin
- Criar, listar e revogar API keys
- Estatísticas de uso em tempo real
- Modal de criação com aviso de segurança
- Integração na aba "API" do AdminPortal

#### Backend
- Serviço `apiKeyService.ts` completo
- Geração segura de chaves (vai_live_xxx / vai_test_xxx)
- Validação de chaves com cache
- Rate limiting por hora
- Logging detalhado de requisições

#### Documentação
- `API_DOCUMENTATION.md` completa
- Exemplos em cURL, JavaScript, Python, PHP
- Guia de autenticação e rate limiting
- Boas práticas de segurança
- Códigos de erro documentados

#### Rate Limits por Plano
- Free: 100 requisições/hora
- Pro: 1.000 requisições/hora
- Business: 10.000 requisições/hora
- White Label: Ilimitado

### 🔧 Melhorias Gerais
- Versão atualizada para 1.6.0
- Cache busting via atualização de versão

---

## [1.5.0] - 2026-01-18

### 🎫 Sistema de Cupons e Promoções

#### Adicionado
- Sistema completo de cupons com tipos: percentual, valor fixo e extensão de trial
- Interface admin para criação e gerenciamento de cupons
- Campo de cupom no checkout com validação em tempo real
- Estatísticas de uso de cupons no painel admin
- Limites configuráveis: total de usos e por usuário
- Restrição de cupons por plano específico
- Aplicabilidade: upgrade, renovação ou ambos

#### Database
- Tabela `coupons` com todos os campos necessários
- Tabela `coupon_usage` para rastreamento
- Funções SQL: `validate_coupon`, `apply_coupon`, `calculate_discount`, `get_coupon_stats`
- RLS policies completas para segurança

#### Frontend
- Componente `CouponManagement.tsx` para admin
- Componente `CouponField.tsx` para checkout
- Integração na aba "Cupons" do AdminPortal

### 📜 Sistema de Aceite de Termos

#### Adicionado
- Sistema completo de termos editáveis pelo admin
- Modal de aceite obrigatório para usuários
- Controle de versão automático de documentos
- Editor Markdown integrado no painel admin
- Registro de aceites com IP e timestamp
- Termos de Uso completos (13 seções, ~8.500 caracteres)
- Política de Privacidade completa (13 seções, ~10.000 caracteres)
- Conformidade total com LGPD (Lei 13.709/2018)

#### Database
- Tabela `legal_documents` para armazenar termos editáveis
- Tabela `user_acceptances` para registro de aceites
- Funções SQL: `get_active_documents`, `check_user_acceptance`, `record_acceptance`, `publish_new_version`
- RLS policies para controle de acesso

#### Frontend
- Componente `TermsAcceptanceModal.tsx` para usuários
- Componente `LegalDocumentsPanel.tsx` editável para admin
- Integração automática no App.tsx
- Verificação de aceite no login

#### Backend
- Serviço `termsService.ts` com CRUD completo
- Verificação automática de aceite
- Registro com IP e User-Agent para auditoria

#### Legal
- Termos de Uso conformes com CDC e Marco Civil
- Política de Privacidade conforme LGPD
- Todos os direitos do titular implementados (Art. 18 LGPD)
- Base legal documentada para cada tratamento
- Informações sobre DPO e ANPD

### 🔧 Melhorias Gerais
- Versão do app atualizada para 1.5.0
- Copyright atualizado para 2026
- Versão visível no rodapé (admin e usuário)
- Cache busting via atualização de versão

### 📚 Documentação
- README.md atualizado com novos sistemas
- CHANGELOG.md completo criado
- Guias de implementação e troubleshooting
- Scripts de verificação SQL

---

## [2.0.0] - 2026-01-15

### ✨ Produção
- Deploy inicial em produção
- Domínio 12vai.com configurado
- Vercel CI/CD ativo

---

**Formato baseado em [Keep a Changelog](https://keepachangelog.com/)**

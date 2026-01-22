# 🚀 VaiEncurta - Encurtador de URLs SaaS

<div align="center">

**Plataforma completa de encurtamento de URLs com foco em conversão e analytics**

[Produção](https://12vai.com) • [Documentação](#-funcionalidades) • [Setup](#-setup)

</div>

---

## 📋 Sobre o Projeto

VaiEncurta é um encurtador de URLs SaaS desenvolvido com React 19 e Supabase, focado em conversão e analytics para negócios. O sistema utiliza o domínio ultra-curto **12vai.com** para máxima brevidade nos links.

### 🎯 Diferenciais

- ✅ **Domínio Ultra-Curto** - `12vai.com/slug` para links extremamente compactos
- ✅ **Slugs Premium** - Termos como `/pix`, `/oferta`, `/desconto`
- ✅ **Redirecionamento Instantâneo** - Infraestrutura otimizada
- ✅ **Analytics de Venda** - Rastreie qual anúncio trouxe o cliente
- ✅ **Planos Diferenciados** - Free, Pro, Business, White Label

---

## 🌐 Produção

**URL Principal:** https://12vai.com  
**Status:** ✅ **100% Operacional**

### Credenciais de Teste

| Email | Senha | Plano | Recursos |
|-------|-------|-------|----------|
| `business@vaili.test` | `123456` | Business | Ilimitado, slugs premium |

---

## ✨ Funcionalidades

### 🔗 Gerenciamento de URLs

- [x] **Criar URLs Encurtadas** - Interface intuitiva com validação em tempo real
- [x] **Slugs Personalizados** - Defina seu próprio slug (planos Pro+)
- [x] **Slugs Premium** - Acesso a termos premium (planos Business+)
- [x] **Proteção por Senha** - Links protegidos com senha e dica opcional (planos Pro+)
- [x] **Listar URLs** - Visualize todas suas URLs com busca
- [x] **Deletar URLs** - Remova URLs com confirmação de segurança
- [x] **Redirecionamento Automático** - Redireciona para URL original instantaneamente

### 👥 Sistema de Usuários

- [x] **Autenticação Completa** - Login, registro e recuperação de senha
- [x] **Planos Diferenciados** - 4 níveis de acesso
  - **Free** - 10 URLs, 1.000 cliques/mês
  - **Pro** - 100 URLs, 50.000 cliques/mês, slugs personalizados
  - **Business** - URLs ilimitadas, slugs premium
  - **White Label** - Domínios customizados

### 📊 Dashboard e Analytics

- [x] **Visão Geral** - Total de cliques, links ativos, CTR
- [x] **Gráficos** - Cliques por dia, dispositivos, navegadores
- [x] **Estatísticas em Tempo Real** - Atualização automática

### 🎨 Interface

- [x] **Design Moderno** - UI/UX premium com Tailwind CSS
- [x] **Responsivo** - Funciona em desktop, tablet e mobile
- [x] **Estados Vazios** - Mensagens amigáveis quando não há dados
- [x] **Loading States** - Feedback visual em todas as ações
- [x] **Modais de Confirmação** - Previne ações acidentais

### 🎫 Sistema de Cupons e Promoções (v1.5.0)

- [x] **Criação de Cupons** - Interface admin completa
- [x] **Tipos de Desconto** - Percentual, valor fixo ou extensão de trial
- [x] **Aplicabilidade** - Upgrade, renovação ou ambos
- [x] **Limites Flexíveis** - Total de usos e por usuário
- [x] **Restrição de Planos** - Cupons específicos para cada plano
- [x] **Validação em Tempo Real** - Campo de cupom no checkout
- [x] **Estatísticas** - Dashboard com métricas de uso
- [x] **Gerenciamento** - Ativar/desativar cupons dinamicamente

### 📜 Sistema de Aceite de Termos (v1.5.0)

- [x] **Termos Editáveis** - Admin pode editar Termos de Uso e Política de Privacidade
- [x] **Controle de Versão** - Sistema de versionamento automático
- [x] **Modal de Aceite** - Usuários devem aceitar termos ao se registrar
- [x] **Reaceite Automático** - Modal reaparece quando termos são atualizados
- [x] **Registro de Aceites** - Histórico completo com IP e timestamp
- [x] **Conformidade LGPD** - Termos completos em conformidade com lei brasileira
- [x] **Editor Markdown** - Interface admin para edição de documentos
- [x] **Auditoria** - Rastreamento completo de aceites por usuário

### 🔌 API Pública (v1.6.0)

- [x] **Autenticação via API Key** - Chaves únicas por usuário
- [x] **Rate Limiting** - Limites por plano (100-10.000 req/hora)
- [x] **Endpoints REST** - CRUD completo de URLs
- [x] **Estatísticas** - Analytics de cliques via API
- [x] **Painel Admin** - Gerenciar chaves, ver uso e estatísticas
- [x] **Documentação Completa** - Exemplos em cURL, JS, Python, PHP
- [x] **Segurança** - Hash SHA-256, validação, logging
- [x] **Múltiplas Chaves** - Ambientes separados (live/test)

### 📧 Sistema de Notificações por Email (v1.7.0)

- [x] **Integração Resend** - Envio profissional de emails transacionais
- [x] **Serverless API** - Endpoint seguro para envio via Vercel Functions
- [x] **Preferências de Email** - Usuários controlam quais emails receber
- [x] **Templates HTML** - Emails de boas-vindas e alertas de limite
- [x] **Logging Completo** - Histórico de todos os envios
- [x] **Painel de Testes** - Interface admin para testar envios
- [x] **Domínio Verificado** - DNS configurado para melhor deliverability
- [ ] **Templates React Email** - Migração para componentes React
- [ ] **Relatórios Semanais** - Estatísticas automáticas por email
- [ ] **Cron Jobs** - Envios agendados via Vercel Cron

### 🔒 Proteção por Senha (v1.8.0)

- [x] **Links Protegidos** - Adicione senha a qualquer link encurtado
- [x] **Dica de Senha** - Campo opcional para ajudar usuários a lembrar
- [x] **Modal Elegante** - Interface premium para entrada de senha
- [x] **Validação em Tempo Real** - Feedback imediato de senha incorreta
- [x] **Cache de Sessão** - Senha validada não é pedida novamente na mesma sessão
- [x] **Restrição por Plano** - Disponível para Pro, Business e White Label
- [x] **Indicador Visual** - Ícone 🔒 na lista de URLs protegidas
- [x] **Configuração Admin** - Controle quais planos podem usar a feature
- [x] **Texto Plano** - Senha armazenada em texto plano para melhor UX

**Como usar:**
1. Criar novo link → Marcar "🔒 Proteger com senha"
2. Definir senha (mín. 4 caracteres) e dica opcional
3. Visitantes precisarão digitar a senha antes de acessar
4. Senha validada fica em cache durante a sessão

### 🔧 Modo de Manutenção

- [x] **Toggle Admin** - Botão no painel administrativo para ativar/desativar
- [x] **Página de Manutenção** - Design profissional com branding VaiEncurta
- [x] **Bypass para Admin** - Administradores continuam acessando durante manutenção
- [x] **Persistência** - Estado salvo no Supabase
- [x] **Confirmação** - Dialog antes de ativar/desativar

**Como usar:**
1. Login como admin → Painel Administrativo
2. Clique em "🟢 Ativar Manutenção" (botão verde)
3. Site bloqueado para visitantes, admin continua acessando
4. Para desativar: clique em "🔴 Desativar Manutenção" (botão vermelho)

### 🎯 Painel Administrativo (v1.9.0)

- [x] **Navegação por URL** - Acesso direto a abas via URL (`/admin/coupons`, `/admin/users`)
- [x] **Títulos Dinâmicos** - Título da aba do navegador atualiza automaticamente
- [x] **Interface Limpa** - Removido elementos duplicados e redundantes
- [x] **Gestão de Usuários** - Lista completa com filtros e ações
- [x] **Impersonação** - Admin pode fazer login como qualquer usuário
- [x] **Auditoria** - Histórico completo de ações administrativas

### ✨ Melhorias de UX (v1.9.0)

- [x] **Modal de Sucesso** - Aparece após criar link com opções de ação
  - Copiar link (com feedback visual "Copiado!")
  - Ver todos os links
  - Criar outro link
- [x] **Links Corrigidos** - Exibição completa `12vai.com/slug` em vez de `12vai/slug`
- [x] **Feedback Visual** - Estados de loading e sucesso aprimorados
- [x] **Animações Suaves** - Transições e modais com animações elegantes

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Deploy:** Vercel
- **Domínio:** 12vai.com (GoDaddy)

---

## 📦 Setup Local

### Pré-requisitos

- Node.js 18+
- Conta no Supabase

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://zgwzeacycfmdqyyppeiu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnd3plYWN5Y2ZtZHF5eXBwZWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTgwNDMsImV4cCI6MjA4MzgzNDA0M30.rY5kfQa8ZELsEXw0m-HeFegkhZ8_vAibxvmHpBoty0k
```

### 3. Configurar Banco de Dados

Execute os scripts SQL na ordem:

1. [`db/schema.sql`](db/schema.sql) - Cria tabelas e políticas RLS
2. [`db/final_setup.sql`](db/final_setup.sql) - Cria usuários de teste
3. [`db/migrations/001_create_coupons.sql`](db/migrations/001_create_coupons.sql) - Sistema de cupons
4. [`db/migrations/002_fix_coupon_security.sql`](db/migrations/002_fix_coupon_security.sql) - Correções de segurança
5. [`db/migrations/003_create_legal_system.sql`](db/migrations/003_create_legal_system.sql) - Sistema de termos
6. [`db/migrations/004_update_terms_content.sql`](db/migrations/004_update_terms_content.sql) - Termos de Uso completos
7. [`db/migrations/005_update_privacy_content.sql`](db/migrations/005_update_privacy_content.sql) - Política de Privacidade
8. [`db/migrations/006_create_api_system.sql`](db/migrations/006_create_api_system.sql) - Sistema de API Pública
9. [`db/migrations/007_create_email_system.sql`](db/migrations/007_create_email_system.sql) - Sistema de Notificações
10. [`db/migrations/008_add_password_protection_to_plans.sql`](db/migrations/008_add_password_protection_to_plans.sql) - Proteção por Senha (Plans)
11. [`db/migrations/009_add_password_hint.sql`](db/migrations/009_add_password_hint.sql) - Campo password_hint
12. [`db/migrations/010_fix_lesmas_to_slugs.sql`](db/migrations/010_fix_lesmas_to_slugs.sql) - Correção de terminologia

**OU execute o script completo:**
- [`db/migrations/EXECUTE_ALL_PASSWORD_MIGRATIONS.sql`](db/migrations/EXECUTE_ALL_PASSWORD_MIGRATIONS.sql) - Todas as migrations de senha

### 4. Rodar Localmente

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

Acesse: `http://localhost:5173` (dev) ou `http://localhost:4173` (preview)

---

## 🚀 Deploy em Produção

### Vercel

O projeto está configurado para deploy automático no Vercel.

#### Variáveis de Ambiente (Vercel)

Configure no Vercel Dashboard → Settings → Environment Variables:

```env
VITE_SUPABASE_URL=https://zgwzeacycfmdqyyppeiu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnd3plYWN5Y2ZtZHF5eXBwZWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTgwNDMsImV4cCI6MjA4MzgzNDA0M30.rY5kfQa8ZELsEXw0m-HeFegkhZ8_vAibxvmHpBoty0k
```

**Importante:** Marque as variáveis para **Production**, **Preview** e **Development**.

#### Deploy Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy para produção
npx vercel --prod
```

### Configuração de Domínio

1. **GoDaddy:** Configure nameservers do Vercel
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

2. **Vercel Dashboard:** Adicione o domínio `12vai.com`

3. **Aguarde propagação DNS** (até 48h)

---

## 🔢 Gerenciamento de Versão

### Sistema Unificado (v1.14.0+)

A partir da versão 1.14.0, o sistema usa **uma única fonte da verdade** para a versão:

**Arquivo Principal:** `package.json`

```json
{
  "version": "1.14.0"
}
```

**Como Funciona:**

1. `src/version.ts` lê automaticamente do `package.json`:
   ```typescript
   import packageJson from '../package.json';
   export const APP_VERSION = packageJson.version;
   ```

2. Todos os componentes importam de `src/version.ts`:
   ```typescript
   import { APP_VERSION } from '../src/version';
   ```

3. A versão aparece automaticamente em:
   - Rodapé do site (usuário)
   - Rodapé do admin
   - Sidebar do painel
   - Modal "O que há de novo"

**Para Atualizar a Versão:**

1. Edite apenas `package.json`:
   ```json
   "version": "1.15.0"
   ```

2. Commit e push:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to 1.15.0"
   git push
   ```

3. A versão será atualizada automaticamente em todo o sistema após o deploy!

**Arquivos Afetados Automaticamente:**
- `components/Admin/AdminPortal.tsx` - Footer do admin
- `components/Layout.tsx` - Sidebar do usuário
- `App.tsx` - Footer da landing page
- `components/WhatsNewModal.tsx` - Modal de novidades

---

## 📚 Documentação Técnica

### Estrutura do Projeto

```
├── components/          # Componentes React
│   ├── Auth/           # Login, Registro, Recuperação
│   ├── Admin/          # Painel administrativo
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── UrlCreator.tsx  # Criador de URLs
│   ├── UrlList.tsx     # Lista de URLs
│   └── RedirectHandler.tsx # Redirecionamento
├── services/           # Lógica de negócio
│   └── urlService.ts   # CRUD de URLs
├── contexts/           # Context API
│   └── AuthContext.tsx # Autenticação
├── db/                 # Scripts SQL
│   ├── schema.sql      # Schema do banco
│   └── final_setup.sql # Setup de usuários
├── vercel.json         # Configuração Vercel
└── types.ts            # TypeScript types
```

### Fluxo de Redirecionamento

```mermaid
graph LR
    A[Usuário acessa 12vai.com/slug] --> B[RedirectHandler]
    B --> C[Busca URL no banco]
    C --> D{URL existe?}
    D -->|Sim| E[Redireciona para original_url]
    D -->|Não| F[Mostra 404]
```

### Segurança

- **Row Level Security (RLS)** - Usuários só acessam suas próprias URLs
- **Validação de Slugs** - Verifica slugs reservados e premium
- **Verificação de Plano** - Valida recursos por plano
- **Autenticação JWT** - Tokens seguros via Supabase
- **Headers de Segurança** - X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

---

## 🧪 Testes

### Testar Criação de URL

1. Acesse https://12vai.com
2. Faça login com `business@vaili.test` / `123456`
3. Crie uma URL com slug personalizado
4. Verifique que foi criada com sucesso

### Testar Redirecionamento

1. Acesse `https://12vai.com/slug-criado`
2. Verifique que redireciona para URL original

### Testar Exclusão

1. Vá em "Meus Links"
2. Clique no ícone de lixeira
3. Confirme exclusão
4. Verifique que URL foi removida

---

## 📝 Changelog

Veja o [CHANGELOG.md](CHANGELOG.md) completo para detalhes de todas as versões.

### v1.14.0 (22/01/2026) - Correções Críticas e Otimizações

- 🐛 **Correção da Tela Branca**
  - Substituído `.single()` por `.maybeSingle()` em 12 locais críticos
  - Eliminação total de erros PGRST116
  - Site carrega perfeitamente no primeiro acesso
- 🐛 **Checkout Funcionando**
  - Corrigido erro "Erro ao criar sessão de checkout"
  - Usuários podem assinar planos sem problemas
- 🐛 **Funções Serverless Corrigidas**
  - Removido imports externos de funções Vercel
  - Billing portal 100% operacional
- 🐛 **Stripe Test/Live Mode**
  - Limpado customer IDs de teste do banco
  - Compatibilidade total com Live Mode
- ⚡ **Performance RLS Otimizada**
  - 32 políticas RLS otimizadas
  - Queries muito mais rápidas em tabelas grandes
  - `auth.uid()` → `(select auth.uid())`
- 🔒 **Segurança Aprimorada**
  - 8 funções SQL com `SET search_path = public`
  - Prevenção de vulnerabilidades de injeção de schema
- 🔧 **Sistema de Versão Unificado**
  - Versão agora vem de um único lugar: `package.json`
  - Atualização automática em todo o sistema
  - Sem mais versões hardcoded

### v1.9.0 (20/01/2026) - Melhorias Admin e UX

- ✅ **Painel Admin aprimorado**
  - Navegação por URL (`/admin/users`, `/admin/coupons`, etc.)
  - Títulos dinâmicos nas abas do navegador
  - Interface limpa sem elementos duplicados
  - Lista de usuários totalmente funcional
- ✅ **Modal de sucesso após criar link**
  - Exibe link criado em destaque
  - Botão copiar com feedback visual
  - Navegação rápida para página de links
  - Opção de criar outro link
- ✅ **Correção de exibição de links**
  - Links mostram domínio completo: `12vai.com/slug`
  - Função copiar inclui URL completa: `https://12vai.com/slug`
- ✅ **Melhorias gerais de UX**
  - Animações suaves em modais
  - Feedback visual aprimorado
  - Suporte a dark mode em novos componentes

### v1.8.0 (19/01/2026) - Proteção por Senha

- ✅ **Sistema completo de proteção por senha para links**
- ✅ **Modal elegante de entrada de senha**
- ✅ **Dica de senha opcional**
- ✅ **Cache de validação via sessionStorage**
- ✅ **Restrição por plano (Pro, Business, White Label)**
- ✅ **Indicador visual 🔒 na lista de URLs**
- ✅ **Configuração admin por plano**
- ✅ **Correção de terminologia: Lesmas → Slugs**

### v1.6.0 (18/01/2026) - API Pública

- ✅ **Sistema completo de API REST**
- ✅ **Autenticação via API Key**
- ✅ **Rate limiting por plano**
- ✅ **Endpoints CRUD de URLs**
- ✅ **Estatísticas via API**
- ✅ **Painel admin de gerenciamento**
- ✅ **Documentação completa com exemplos**

### v1.5.0 (18/01/2026) - Sistema de Cupons e Termos

- ✅ **Sistema completo de cupons e promoções**
- ✅ **Sistema de aceite de termos editáveis**
- ✅ **Interface admin de gerenciamento**
- ✅ **Validação em tempo real no checkout**
- ✅ **Estatísticas de uso**
- ✅ **Termos juridicamente conformes (LGPD)**
- ✅ **Modal de aceite para usuários**
- ✅ **Controle de versão de documentos**

### v2.0.0 (15/01/2026) - Produção

- ✅ **Rebranding para VaiEncurta**
- ✅ **Domínio 12vai.com em produção**
- ✅ **Deploy bem-sucedido no Vercel**
- ✅ **Credenciais Supabase corrigidas**
- ✅ **Configuração DNS completa**
- ✅ **Painel administrativo completo**
- ✅ **Sistema de auditoria**
- ✅ **Filtros e busca avançada**

### v1.0.0

- ✅ Sistema de autenticação completo
- ✅ CRUD de URLs com validação
- ✅ Redirecionamento automático
- ✅ Dashboard com analytics
- ✅ Planos diferenciados
- ✅ Slugs premium

---

## 🔧 Troubleshooting

### Erro "Invalid API key"

Verifique se as credenciais do Supabase estão corretas:
- URL: `https://zgwzeacycfmdqyyppeiu.supabase.co`
- Projeto ID: `zgwzeacycfmdqyyppeiu` (com **q**, não **o**)

### Build falhando no Vercel

1. Verifique se as variáveis de ambiente estão configuradas
2. Certifique-se que `vite.config.ts` tem as definições corretas
3. Limpe o cache: Settings → General → Clear Cache

### Domínio não carregando

1. Verifique propagação DNS: https://dnschecker.org
2. Confirme nameservers no GoDaddy
3. Valide domínio no Vercel Dashboard

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 🙏 Agradecimentos

- **Supabase** - Backend as a Service
- **Vercel** - Hospedagem e Deploy
- **Tailwind CSS** - Framework CSS
- **Lucide** - Ícones
- **GoDaddy** - Registro de domínio

---

<div align="center">

**Feito com ❤️ para aumentar suas conversões**

[⬆ Voltar ao topo](#-vaiencurta---encurtador-de-urls-saas)

</div>

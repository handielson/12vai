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

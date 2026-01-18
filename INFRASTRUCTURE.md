# 🏗️ Infraestrutura do VaiEncurta - Documentação

## 📋 Visão Geral

Este documento centraliza todas as informações sobre a infraestrutura do projeto VaiEncurta (12vai.com).

---

## 🌐 DNS e Domínio

### Informações do Domínio
- **Domínio:** 12vai.com
- **Registrado em:** GoDaddy
- **Nameservers:** Vercel DNS
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`

### ⚠️ IMPORTANTE: Gerenciamento DNS

**O DNS do domínio 12vai.com é gerenciado pela VERCEL, não pelo GoDaddy!**

**Para adicionar/editar registros DNS:**
1. Acesse: https://vercel.com/dashboard
2. Navegue até: Configurações → Domínios
3. Selecione: `12vai.com`
4. Clique em: "Editar"
5. Role até: "DNS Records"

**❌ NÃO tente editar DNS no GoDaddy** - os registros lá estão bloqueados porque os nameservers apontam para a Vercel.

### Registros DNS Atuais

#### Email (Resend)
- **DKIM:** `resend._domainkey` (TXT) - Verificação de domínio
- **SPF MX:** `send` (MX) - Mail server
- **SPF TXT:** `send` (TXT) - Política de envio
- **DMARC:** `_dmarc` (TXT) - Política de autenticação

#### Aplicação
- **ALIAS:** `*` → `cname.vercel-dns.com`
- **ALIAS:** `@` → `cname.vercel-dns.com`
- **CAA:** Proteção contra emissão não autorizada de certificados

---

## 🚀 Hospedagem e Deploy

### Vercel
- **Projeto:** linksnap-saas-encurtador-de-urls-de-alta-performance
- **Domínio Principal:** https://12vai.com
- **Domínio Vercel:** https://linksnap-saas-encurtador-de-urls-de.vercel.app
- **Branch:** main
- **Auto Deploy:** ✅ Ativo

### Ambientes
- **Production:** https://12vai.com
- **Preview:** Branches não-main
- **Development:** localhost:3000 / localhost:3001

---

## 🗄️ Banco de Dados

### Supabase
- **Projeto:** VaiEncurta
- **URL:** https://[project-id].supabase.co
- **Região:** us-east-1
- **Plano:** Free (500MB, 50k usuários)

### Tabelas Principais
- `users` - Usuários e planos
- `urls` - Links encurtados
- `clicks` - Rastreamento de cliques
- `coupons` - Sistema de cupons
- `api_keys` - Chaves de API
- `email_preferences` - Preferências de email
- `email_logs` - Histórico de emails

---

## 📧 Sistema de Email

### Resend
- **Domínio Verificado:** 12vai.com
- **API Key:** Configurada nas env vars da Vercel
- **Remetente:** noreply@12vai.com
- **Plano:** Free (3.000 emails/mês)

### Configuração DNS
Todos os registros DNS para email estão na **Vercel**, não no GoDaddy:
- DKIM: `resend._domainkey.12vai.com`
- SPF: `send.12vai.com`
- DMARC: `_dmarc.12vai.com`

### Serverless Function
- **Endpoint:** `/api/send-email`
- **Método:** POST
- **Hospedado:** Vercel Functions
- **Runtime:** Node.js

---

## 🔐 Variáveis de Ambiente

### Vercel (Produção)
Configuradas em: https://vercel.com/dashboard → Settings → Environment Variables

**Supabase:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Resend:**
- `VITE_RESEND_API_KEY`
- `VITE_RESEND_FROM_EMAIL`
- `VITE_APP_URL`

**Aplicação:**
- `VITE_APP_VERSION` (1.7.0)

### Local (.env.local)
Mesmo formato, valores de desenvolvimento.

---

## 🔧 Ferramentas e Serviços

### Desenvolvimento
- **Vite** - Build tool
- **React 19** - Framework
- **TypeScript** - Linguagem
- **Tailwind CSS** - Estilização

### Produção
- **Vercel** - Hosting e serverless
- **Supabase** - Database e auth
- **Resend** - Email transacional

### Monitoramento
- **Vercel Analytics** - Métricas de uso
- **Supabase Dashboard** - Logs de database
- **Resend Dashboard** - Logs de email

---

## 📞 Suporte e Acesso

### Dashboards
- **Vercel:** https://vercel.com/dashboard
- **Supabase:** https://supabase.com/dashboard
- **Resend:** https://resend.com/dashboard
- **GoDaddy:** https://dcc.godaddy.com (apenas domínio)

### Repositório
- **GitHub:** https://github.com/handielson/12vai
- **Branch principal:** main

---

## 🚨 Troubleshooting Comum

### DNS não atualiza
- ✅ Verificar se está editando na **Vercel**, não no GoDaddy
- ✅ Aguardar propagação (5min - 48h)
- ✅ Limpar cache DNS: `ipconfig /flushdns` (Windows)

### Email não envia
- ✅ Verificar domínio no Resend: https://resend.com/domains
- ✅ Confirmar DNS propagado: https://dnschecker.org
- ✅ Verificar env vars na Vercel
- ✅ Checar logs no Resend Dashboard

### Deploy falha
- ✅ Verificar build local: `npm run build`
- ✅ Checar logs na Vercel
- ✅ Confirmar env vars configuradas
- ✅ Verificar sintaxe JSX/TypeScript

---

## 📝 Notas Importantes

1. **DNS está na Vercel** - Sempre edite registros DNS lá, não no GoDaddy
2. **Nameservers não podem ser alterados** - Mudar para GoDaddy quebraria o site
3. **Propagação DNS leva tempo** - Aguarde até 48h para mudanças
4. **Env vars precisam redeploy** - Após alterar, faça redeploy manual
5. **Domínio verificado no Resend** - Necessário para enviar emails

---

## 🔄 Última Atualização

**Data:** 2026-01-18  
**Versão:** 1.7.0  
**Atualizado por:** Sistema de Email implementado

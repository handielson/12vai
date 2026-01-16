# 🚀 Guia de Deploy - VaiEncurta

## ✅ Status Atual

**Data:** 15/01/2026  
**Status:** ✅ **PRODUÇÃO FUNCIONANDO 100%**  
**URL:** https://12vai.com

---

## 🔑 Credenciais de Produção

### Supabase

```env
VITE_SUPABASE_URL=https://zgwzeacycfmdqyyppeiu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnd3plYWN5Y2ZtZHF5eXBwZWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTgwNDMsImV4cCI6MjA4MzgzNDA0M30.rY5kfQa8ZELsEXw0m-HeFegkhZ8_vAibxvmHpBoty0k
```

**⚠️ IMPORTANTE:** O Project ID é `zgwzeacycfmdqyyppeiu` (com **q**, não **o**)

### Admin do Sistema

- **Email:** `business@vaili.test`
- **Senha:** `123456`

---

## 📋 Checklist de Deploy

### 1. Preparação Local

- [x] Criar arquivo `.env.production` com credenciais corretas
- [x] Testar build local: `npm run build`
- [x] Testar preview: `npm run preview`
- [x] Verificar login e criação de links

### 2. Configuração Vercel

- [x] Criar projeto no Vercel
- [x] Conectar repositório Git
- [x] Configurar variáveis de ambiente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [x] Marcar para **Production**, **Preview** e **Development**

### 3. Configuração de Domínio

#### GoDaddy (12vai.com)

- [x] Acessar DNS Management
- [x] Configurar Nameservers:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`
- [x] Aguardar propagação (até 48h)

#### Vercel

- [x] Settings → Domains
- [x] Adicionar `12vai.com`
- [x] Adicionar `www.12vai.com`
- [x] Aguardar validação SSL

### 4. Deploy

```bash
# Via Vercel CLI
npx vercel --prod

# Ou via Git Push (deploy automático)
git push origin main
```

### 5. Validação Pós-Deploy

- [x] Acessar https://12vai.com
- [x] Testar login
- [x] Criar link de teste
- [x] Verificar redirecionamento
- [x] Checar console do navegador (sem erros)

---

## 🔧 Configuração do vercel.json

```json
{
    "headers": [
        {
            "source": "/(.*)",
            "headers": [
                {
                    "key": "X-Content-Type-Options",
                    "value": "nosniff"
                },
                {
                    "key": "X-Frame-Options",
                    "value": "DENY"
                },
                {
                    "key": "X-XSS-Protection",
                    "value": "1; mode=block"
                }
            ]
        }
    ]
}
```

**Nota:** Removemos todos os redirects para evitar loops de redirecionamento.

---

## 🐛 Problemas Comuns e Soluções

### 1. Erro "ERR_NAME_NOT_RESOLVED"

**Causa:** URL do Supabase incorreta (typo no Project ID)

**Solução:**
- Verificar se a URL é `zgwzeacycfmdqyyppeiu` (com **q**)
- Atualizar `.env.production` e variáveis do Vercel
- Fazer redeploy

### 2. Erro "Invalid API key"

**Causa:** ANON_KEY desatualizada ou incorreta

**Solução:**
- Obter chave correta do Supabase Dashboard → Settings → API
- Atualizar variáveis de ambiente
- Fazer redeploy

### 3. Erro "ERR_TOO_MANY_REDIRECTS"

**Causa:** Regras de redirect conflitantes no `vercel.json`

**Solução:**
- Simplificar `vercel.json` removendo redirects
- Manter apenas headers de segurança
- Fazer redeploy

### 4. CORS Errors

**Causa:** Recursos externos bloqueados

**Solução:**
- Verificar se Tailwind CSS está carregando via CDN
- Adicionar headers CORS se necessário
- Usar recursos locais quando possível

---

## 📊 URLs de Produção

| Tipo | URL | Status |
|------|-----|--------|
| **Principal** | https://12vai.com | ✅ Funcionando |
| **WWW** | https://www.12vai.com | ✅ Funcionando |
| **Vercel** | https://linksnap-saas-encurtador-de-urls-de-alta-performance-c88g75add.vercel.app | ✅ Funcionando |

---

## 🔄 Processo de Redeploy

### Quando fazer redeploy?

- Após atualizar variáveis de ambiente
- Após mudanças no código
- Após correção de bugs
- Após atualização de dependências

### Como fazer redeploy?

```bash
# Método 1: Via CLI (forçar rebuild)
npx vercel --prod --force

# Método 2: Via Dashboard
# Vercel Dashboard → Deployments → Redeploy

# Método 3: Via Git (automático)
git push origin main
```

---

## 📝 Histórico de Deploys

### Deploy v2.0.0 (15/01/2026)

**Mudanças:**
- ✅ Corrigido typo nas credenciais Supabase
- ✅ Simplificado `vercel.json`
- ✅ Resolvido problema de CORS
- ✅ Domínio `12vai.com` funcionando

**Comandos executados:**
```bash
npm run build
npx vercel --prod --force
```

**Resultado:** ✅ Sucesso total

### Deploy v2.1.0 (15/01/2026 02:47) - Modo de Manutenção

**Mudanças:**
- ✅ Implementado modo de manutenção com toggle admin
- ✅ Criada tabela `app_settings` no Supabase
- ✅ Componente `MaintenancePage.tsx` com design profissional
- ✅ Botão verde/vermelho no painel administrativo
- ✅ Bypass automático para administradores

**Comandos executados:**
```bash
npm run build
npx vercel --prod
```

**Resultado:** ✅ Modo de manutenção 100% funcional em produção

**Como usar:**
1. Login como admin → Painel Administrativo
2. Botão no header: "🟢 Ativar Manutenção" (verde) ou "🔴 Desativar Manutenção" (vermelho)
3. Confirmar ação no dialog
4. Site bloqueado para visitantes / Admin continua acessando

**Status atual:** 🔴 Site em modo de manutenção

---

## 🎯 Próximos Passos (Opcional)

### Melhorias de Performance

- [ ] Implementar cache de redirecionamentos
- [ ] Otimizar imagens
- [ ] Adicionar Service Worker
- [ ] Implementar lazy loading

### Funcionalidades Futuras

- [ ] QR Code para links
- [ ] Analytics avançado
- [ ] API pública
- [ ] Integração com redes sociais

### Infraestrutura

- [ ] Configurar CDN
- [ ] Implementar rate limiting
- [ ] Adicionar monitoramento (Sentry)
- [ ] Configurar backups automáticos

---

## 📞 Suporte

**Documentação:** [README.md](../README.md)  
**Walkthrough:** [successful_deployment.md](C:/Users/Nitro/.gemini/antigravity/brain/fd443318-313b-45cc-8ac9-e72320f537ca/successful_deployment.md)

---

**Última atualização:** 15/01/2026 02:47

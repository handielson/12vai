# 📦 Deploy Manual da Edge Function

## Opção 1: Via Supabase Dashboard (Recomendado)

### Passo 1: Acessar Edge Functions

1. Ir para https://supabase.com/dashboard/project/zgwzeacycfmdqyyppeiu/functions
2. Clicar em **"New Edge Function"**
3. Nome: `redirect`

### Passo 2: Copiar Código

Copiar o conteúdo dos arquivos:

**index.ts:**
```typescript
[Ver arquivo: supabase/functions/redirect/index.ts]
```

**analytics.ts:**
```typescript
[Ver arquivo: supabase/functions/redirect/analytics.ts]
```

### Passo 3: Deploy

1. Colar o código de `index.ts` no editor
2. Adicionar `analytics.ts` como arquivo adicional
3. Clicar em **"Deploy"**

### Passo 4: Testar

URL da function:
```
https://zgwzeacycfmdqyyppeiu.supabase.co/functions/v1/redirect/{slug}
```

Teste:
```bash
curl -L https://zgwzeacycfmdqyyppeiu.supabase.co/functions/v1/redirect/google
```

---

## Opção 2: Via Supabase CLI (Alternativa)

### Instalar CLI

```bash
# Windows (via npm)
npm install -g supabase

# Ou via Scoop
scoop install supabase
```

### Deploy

```bash
# Login
supabase login

# Link projeto
supabase link --project-ref zgwzeacycfmdqyyppeiu

# Deploy
supabase functions deploy redirect
```

---

## Configuração de Domínio (Futuro)

### Opção A: Subdomínio

```
CNAME go.vaiencurta.com.br -> zgwzeacycfmdqyyppeiu.supabase.co
```

URLs: `go.vaiencurta.com.br/{slug}`

### Opção B: Domínio Raiz (via Vercel)

Criar `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/:slug",
      "destination": "https://zgwzeacycfmdqyyppeiu.supabase.co/functions/v1/redirect/:slug"
    }
  ]
}
```

URLs: `vaiencurta.com.br/{slug}`

---

## Testes

### 1. Criar URL de Teste

No dashboard da aplicação:
- URL: `https://google.com`
- Slug: `google`

### 2. Testar Redirect

```bash
curl -I https://zgwzeacycfmdqyyppeiu.supabase.co/functions/v1/redirect/google
```

Deve retornar:
```
HTTP/2 301
location: https://google.com
```

### 3. Verificar Click Tracking

```sql
SELECT * FROM clicks ORDER BY created_at DESC LIMIT 5;
```

Deve mostrar o clique registrado com:
- `url_id`
- `device_type`
- `browser`
- `os`
- `ip_address`

---

## Troubleshooting

### Erro: "Link not found"
- Verificar se URL existe no banco
- Verificar se `active = true`
- Verificar slug exato (case-sensitive)

### Erro: "Internal server error"
- Verificar logs no Supabase Dashboard
- Verificar se variáveis de ambiente estão configuradas

### Click não registrado
- Verificar se trigger `increment_url_clicks` existe
- Verificar permissões RLS na tabela `clicks`

---

**Status:** Edge Function criada, aguardando deploy manual

# 🚀 Redirect Edge Function

## Descrição

Edge Function do Supabase que redireciona URLs encurtadas e registra analytics de cliques.

## Estrutura

```
redirect/
├── index.ts        # Lógica principal de redirect
├── analytics.ts    # Captura de analytics
└── deno.json       # Configuração Deno
```

## Deploy

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login no Supabase

```bash
supabase login
```

### 3. Link com o Projeto

```bash
supabase link --project-ref zgwzeacycfmdqyyppeiu
```

### 4. Deploy da Function

```bash
supabase functions deploy redirect
```

## Testar Localmente

### 1. Servir localmente

```bash
supabase functions serve redirect --env-file .env.local
```

### 2. Testar redirect

```bash
curl -L http://localhost:54321/functions/v1/redirect/google
```

## URL da Function

Após deploy:
```
https://zgwzeacycfmdqyyppeiu.supabase.co/functions/v1/redirect/{slug}
```

## Variáveis de Ambiente

As seguintes variáveis são configuradas automaticamente pelo Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Funcionalidades

- ✅ Redirect 301 para URL original
- ✅ Validação de slug
- ✅ Verificação de link ativo
- ✅ Verificação de expiração
- ✅ Captura de analytics:
  - User Agent (device, browser, OS)
  - Referer
  - IP address
  - UTM parameters
- ✅ Incremento automático de contador de cliques
- ✅ CORS habilitado

## Próximos Passos

- [ ] Adicionar rate limiting
- [ ] Implementar cache para URLs populares
- [ ] Adicionar suporte a password protection
- [ ] Integrar geolocalização (ipapi.co)

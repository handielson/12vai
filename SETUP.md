# 🚀 VAI.li - Guia de Setup Rápido

## ✅ Fase 1 Completa!

Você já tem:
- ✅ Dependências npm instaladas
- ✅ Cliente Supabase configurado (`src/lib/supabase.ts`)
- ✅ Schema SQL completo (`db/schema.sql`)
- ✅ Template de variáveis de ambiente (`.env.local.example`)

---

## 📝 Próximos Passos

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha:
   - **Name**: `vaili-production` (ou nome de sua preferência)
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
4. Clique em "Create new project" e aguarde ~2 minutos

### 2. Obter Credenciais do Supabase

Após o projeto ser criado:

1. No menu lateral, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie as seguintes informações:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (chave longa começando com `eyJ...`)

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
   ```bash
   Copy-Item .env.local.example .env.local
   ```

2. Abra `.env.local` e substitua os valores:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto-aqui.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

### 4. Executar Schema SQL

1. No Supabase Dashboard, vá em **SQL Editor** (menu lateral)
2. Clique em "New Query"
3. Copie TODO o conteúdo do arquivo `db/schema.sql`
4. Cole no editor SQL
5. Clique em "Run" (ou pressione Ctrl+Enter)
6. Aguarde a execução (deve aparecer "Success. No rows returned")

**O que foi criado:**
- ✅ 6 tabelas: `users`, `plans`, `urls`, `clicks`, `reserved_slugs`, `premium_slugs`
- ✅ Índices para performance
- ✅ Triggers automáticos (atualizar `updated_at`, incrementar `clicks_count`)
- ✅ Funções de analytics (`get_clicks_by_device`, `get_clicks_by_browser`, `get_clicks_by_day`)
- ✅ Row Level Security (RLS) policies
- ✅ View de estatísticas (`user_stats`)

### 5. Testar Aplicação Localmente

```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🔍 Verificar se Está Tudo Funcionando

### Verificar Tabelas no Supabase

1. No Supabase Dashboard, vá em **Table Editor**
2. Você deve ver as tabelas:
   - `users`
   - `plans` (com 4 planos já inseridos)
   - `urls`
   - `clicks`
   - `reserved_slugs` (com 13 termos reservados)
   - `premium_slugs` (com 15 termos premium)

### Verificar Planos

1. Clique na tabela `plans`
2. Você deve ver 4 linhas:
   - **free**: 10 URLs, 1.000 cliques/mês, $0
   - **pro**: 100 URLs, 50.000 cliques/mês, $29
   - **business**: Ilimitado, $99
   - **white_label**: Ilimitado + domínio customizado, $299

---

## ⚠️ Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe
- Confirme que as variáveis começam com `VITE_`
- Reinicie o servidor dev (`npm run dev`)

### Erro ao executar schema.sql
- Verifique se copiou TODO o conteúdo do arquivo
- Certifique-se de que está usando o SQL Editor do Supabase
- Se der erro de "already exists", está tudo certo (tabelas já criadas)

### Aplicação não conecta ao Supabase
- Verifique se a URL e a chave estão corretas
- Confirme que o projeto Supabase está ativo (não pausado)
- Abra o Console do navegador (F12) para ver erros

---

## 📊 Estrutura do Banco de Dados

```
users (perfis e planos)
  └── urls (links encurtados)
       └── clicks (analytics de cada clique)

plans (configurações de planos)

reserved_slugs (termos bloqueados)
premium_slugs (termos que exigem plano Business)
```

---

## 🎯 Próxima Fase

Após completar o setup acima, você estará pronto para:

**Fase 3: Implementar Autenticação Real**
- Substituir mock login por Supabase Auth
- Criar formulários de registro
- Implementar recuperação de senha

---

## 📚 Recursos Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status:** ✅ Fase 1 Completa - Pronto para configurar Supabase

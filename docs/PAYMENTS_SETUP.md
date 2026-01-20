# 💳 Sistema de Pagamentos - Guia de Configuração

## 📋 Pré-requisitos

1. Conta no Stripe ([criar conta](https://dashboard.stripe.com/register))
2. Banco de dados Supabase configurado
3. Projeto 12Vai rodando localmente

---

## 🚀 Passo 1: Executar Migration do Banco de Dados

```bash
# Conectar ao Supabase e executar a migration
psql $DATABASE_URL -f db/migrations/012_create_payment_system.sql
```

**Verificação**: Acesse o Supabase Dashboard → Database → Tables e confirme que as tabelas `subscriptions`, `payment_history` e `stripe_webhook_events` foram criadas.

---

## 🔑 Passo 2: Configurar Stripe (Modo Test)

### 2.1 Obter Chaves de API

1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. Ative o **modo de teste** (toggle no canto superior direito)
3. Vá em **Developers** → **API keys**
4. Copie:
   - **Publishable key** (começa com `pk_test_`)
   - **Secret key** (começa com `sk_test_`)

### 2.2 Criar Produtos e Preços

#### Plano Pro

1. Vá em **Products** → **Add product**
2. Preencha:
   - **Name**: `12Vai Pro`
   - **Description**: `Plano Pro com recursos premium`
3. Adicione dois preços:
   
   **Preço Mensal**:
   - **Price**: `R$ 29,90`
   - **Billing period**: `Monthly`
   - **Currency**: `BRL`
   - Copie o **Price ID** (ex: `price_1ABC...`)
   
   **Preço Anual**:
   - **Price**: `R$ 299,00`
   - **Billing period**: `Yearly`
   - **Currency**: `BRL`
   - Copie o **Price ID** (ex: `price_1XYZ...`)

#### Plano Business

Repita o processo acima com:
- **Name**: `12Vai Business`
- **Preço Mensal**: `R$ 79,90`
- **Preço Anual**: `R$ 799,00`

### 2.3 Configurar Billing Portal

1. Vá em **Settings** → **Billing** → **Customer portal**
2. Clique em **Activate test link**
3. Configure:
   - ✅ **Invoice history**
   - ✅ **Update payment method**
   - ✅ **Cancel subscription**
   - ✅ **Update subscription** (para upgrade/downgrade)
4. Salve as configurações

---

## 🔧 Passo 3: Configurar Variáveis de Ambiente

Edite o arquivo `.env.local`:

```env
# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICA_AQUI
STRIPE_WEBHOOK_SECRET=whsec_SERA_CONFIGURADO_NO_PASSO_4

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_1ABC...
STRIPE_PRICE_PRO_YEARLY=price_1XYZ...
STRIPE_PRICE_BUSINESS_MONTHLY=price_1DEF...
STRIPE_PRICE_BUSINESS_YEARLY=price_1GHI...

# App URL
VITE_APP_URL=http://localhost:5173
```

---

## 🎣 Passo 4: Configurar Webhooks Localmente

### 4.1 Instalar Stripe CLI

**Windows**:
```powershell
scoop install stripe
```

**Mac/Linux**:
```bash
brew install stripe/stripe-cli/stripe
```

### 4.2 Fazer Login

```bash
stripe login
```

Siga as instruções no navegador para autenticar.

### 4.3 Encaminhar Webhooks

Em um terminal separado, execute:

```bash
stripe listen --forward-to localhost:5173/api/webhooks/stripe
```

Você verá uma mensagem como:
```
> Ready! Your webhook signing secret is whsec_abc123...
```

**Copie o `whsec_...`** e adicione ao `.env.local` como `STRIPE_WEBHOOK_SECRET`.

### 4.4 Reiniciar Servidor

```bash
npm run dev
```

---

## ✅ Passo 5: Testar o Sistema

### 5.1 Teste de Checkout

1. Acesse `http://localhost:5173`
2. Faça login ou crie uma conta
3. Vá para a aba **Plano** (ou clique em um botão de upgrade)
4. Clique em "Fazer Upgrade" para o plano Pro
5. No Stripe Checkout, use o cartão de teste:
   - **Número**: `4242 4242 4242 4242`
   - **Data**: Qualquer data futura (ex: `12/30`)
   - **CVC**: Qualquer 3 dígitos (ex: `123`)
   - **CEP**: Qualquer (ex: `12345-678`)
6. Complete o checkout

**Resultado esperado**:
- Redirecionamento de volta para o app
- Plano do usuário atualizado para "Pro"
- Assinatura visível na aba "Plano"
- Status "Em Trial" (14 dias)

### 5.2 Verificar Webhook

No terminal do Stripe CLI, você deve ver:
```
✅ checkout.session.completed
✅ customer.subscription.created
```

### 5.3 Verificar Banco de Dados

```sql
-- Ver assinatura criada
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;

-- Ver usuário atualizado
SELECT id, email, plan_type, stripe_customer_id FROM users WHERE plan_type = 'pro';
```

### 5.4 Testar Billing Portal

1. Na aba "Plano", clique em "Gerenciar Assinatura"
2. Você será redirecionado para o Stripe Billing Portal
3. Teste:
   - Visualizar faturas
   - Atualizar método de pagamento
   - Cancelar assinatura (escolha "Cancelar ao fim do período")
4. Volte para o app
5. Verifique que o status mostra "Cancelamento agendado"

---

## 🧪 Cartões de Teste do Stripe

| Cenário | Número do Cartão | Resultado |
|---------|------------------|-----------|
| Sucesso | `4242 4242 4242 4242` | Pagamento aprovado |
| Falha | `4000 0000 0000 0002` | Pagamento recusado |
| 3D Secure | `4000 0025 0000 3155` | Requer autenticação |
| Insuficiente | `4000 0000 0000 9995` | Saldo insuficiente |

---

## 🌐 Passo 6: Deploy para Produção

### 6.1 Configurar Webhook em Produção

1. Acesse o Stripe Dashboard (modo test ainda)
2. Vá em **Developers** → **Webhooks**
3. Clique em **Add endpoint**
4. Configure:
   - **Endpoint URL**: `https://12vai.com/api/webhooks/stripe`
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.trial_will_end`
5. Copie o **Signing secret** (começa com `whsec_`)

### 6.2 Configurar Variáveis no Vercel

```bash
# Adicionar variáveis de ambiente
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add STRIPE_PRICE_PRO_MONTHLY
vercel env add STRIPE_PRICE_PRO_YEARLY
vercel env add STRIPE_PRICE_BUSINESS_MONTHLY
vercel env add STRIPE_PRICE_BUSINESS_YEARLY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add VITE_APP_URL
```

Para cada variável, cole o valor correspondente.

### 6.3 Deploy

```bash
git add .
git commit -m "feat: implementar sistema de pagamentos com Stripe"
git push origin main
vercel --prod
```

### 6.4 Ativar Modo Live

⚠️ **IMPORTANTE**: Só faça isso quando estiver 100% testado!

1. No Stripe Dashboard, desative o modo de teste
2. Vá em **Developers** → **API keys**
3. Copie as chaves **LIVE** (`pk_live_...` e `sk_live_...`)
4. Atualize as variáveis de ambiente no Vercel com as chaves live
5. Reconfigure o webhook com a URL de produção
6. Faça um novo deploy

---

## 🐛 Troubleshooting

### Erro: "Webhook signature verification failed"

**Causa**: `STRIPE_WEBHOOK_SECRET` incorreto ou ausente.

**Solução**:
1. Verifique se a variável está definida no `.env.local`
2. Reinicie o servidor (`npm run dev`)
3. Confirme que o Stripe CLI está rodando

### Erro: "Price ID não configurado"

**Causa**: Price IDs não foram adicionados ao `.env.local`.

**Solução**:
1. Copie os Price IDs do Stripe Dashboard
2. Adicione ao `.env.local`
3. Reinicie o servidor

### Checkout não redireciona de volta

**Causa**: URLs de sucesso/cancelamento incorretas.

**Solução**:
1. Verifique `VITE_APP_URL` no `.env.local`
2. Confirme que está usando `http://localhost:5173` localmente
3. Em produção, use `https://12vai.com`

### Plano do usuário não atualiza

**Causa**: Webhook não está sendo processado.

**Solução**:
1. Verifique logs do Stripe CLI
2. Confirme que o webhook está chegando em `/api/webhooks/stripe`
3. Verifique logs do servidor para erros

---

## 📊 Monitoramento

### Logs do Stripe

Acesse **Developers** → **Logs** para ver:
- Requisições de API
- Webhooks enviados
- Erros e falhas

### Logs do Vercel

```bash
vercel logs --follow
```

### Banco de Dados

```sql
-- Assinaturas ativas
SELECT COUNT(*) FROM subscriptions WHERE status = 'active';

-- Receita total
SELECT SUM(amount) FROM payment_history WHERE status = 'paid';

-- Falhas de pagamento
SELECT * FROM payment_history WHERE status = 'failed' ORDER BY created_at DESC;
```

---

## 🎉 Pronto!

Seu sistema de pagamentos está configurado e funcionando! 

**Próximos passos**:
- Testar todos os fluxos em modo test
- Configurar emails de notificação (boas-vindas, falha de pagamento, etc.)
- Adicionar analytics de conversão
- Implementar cupons de desconto (já suportado pelo Stripe Checkout)

import Stripe from 'stripe';
import { supabase } from '../lib/supabase';

// Inicializar Stripe com chave secreta (APENAS SERVIDOR)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});

// Mapeamento de planos para Price IDs do Stripe
const PRICE_IDS = {
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
    business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
    business_yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',
};

/**
 * Payment Service - Server Side
 * 
 * Este serviço contém funções que usam o Stripe SDK e só podem ser executadas no servidor.
 * Use estas funções APENAS dentro de API routes (api/*.ts)
 */
export const serverPaymentService = {
    /**
     * Cria ou recupera um customer do Stripe
     */
    async getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
        // Verificar se usuário já tem customer_id
        const { data: user } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();

        if (user?.stripe_customer_id) {
            return user.stripe_customer_id;
        }

        // Criar novo customer no Stripe
        const customer = await stripe.customers.create({
            email,
            metadata: {
                supabase_user_id: userId,
            },
        });

        // Salvar customer_id no banco
        await supabase
            .from('users')
            .update({ stripe_customer_id: customer.id })
            .eq('id', userId);

        return customer.id;
    },

    /**
     * Cria uma sessão de checkout do Stripe
     */
    async createCheckoutSession(
        userId: string,
        email: string,
        planName: 'pro' | 'business',
        billingInterval: 'month' | 'year',
        successUrl: string,
        cancelUrl: string
    ): Promise<{ sessionId: string; url: string }> {
        // Verificar se já tem assinatura ativa
        const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .in('status', ['active', 'trialing'])
            .single();

        if (existingSubscription) {
            throw new Error('Usuário já possui uma assinatura ativa');
        }

        // Obter ou criar customer
        const customerId = await this.getOrCreateStripeCustomer(userId, email);

        // Mapear plano + intervalo para price_id
        const priceKey = `${planName}_${billingInterval === 'year' ? 'yearly' : 'monthly'}` as keyof typeof PRICE_IDS;
        const priceId = PRICE_IDS[priceKey];

        if (!priceId) {
            throw new Error(`Price ID não configurado para ${priceKey}`);
        }

        // Criar sessão de checkout
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: 14, // 14 dias de trial gratuito
                metadata: {
                    user_id: userId,
                    plan_name: planName,
                },
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            allow_promotion_codes: true, // Permitir cupons de desconto
            billing_address_collection: 'required',
            customer_update: {
                address: 'auto',
            },
        });

        return {
            sessionId: session.id,
            url: session.url || '',
        };
    },

    /**
     * Cria uma sessão do Billing Portal
     */
    async createBillingPortalSession(
        userId: string,
        returnUrl: string
    ): Promise<{ url: string }> {
        // Obter customer_id do usuário
        const { data: user } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();

        if (!user?.stripe_customer_id) {
            throw new Error('Usuário não possui customer do Stripe');
        }

        // Criar sessão do portal
        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: returnUrl,
        });

        return { url: session.url };
    },

    /**
     * Sincroniza status da assinatura do Stripe para o banco
     */
    async syncSubscriptionStatus(subscriptionId: string): Promise<void> {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer as string,
                user_id: subscription.metadata.user_id,
                plan_name: subscription.metadata.plan_name,
                status: subscription.status,
                stripe_price_id: subscription.items.data[0].price.id,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
                trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'stripe_subscription_id',
            });

        if (error) {
            console.error('Erro ao sincronizar assinatura:', error);
            throw error;
        }
    },

    /**
     * Cancela assinatura
     */
    async cancelSubscription(
        subscriptionId: string,
        immediately: boolean = false
    ): Promise<void> {
        if (immediately) {
            await stripe.subscriptions.cancel(subscriptionId);
        } else {
            await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
        }

        // Sincronizar status
        await this.syncSubscriptionStatus(subscriptionId);
    },

    /**
     * Registra evento de webhook (idempotência)
     */
    async recordWebhookEvent(eventId: string, eventType: string, payload: any): Promise<boolean> {
        const { data, error } = await supabase
            .from('stripe_webhook_events')
            .insert({
                stripe_event_id: eventId,
                event_type: eventType,
                payload,
            })
            .select()
            .single();

        // Se erro de duplicação, evento já foi processado
        if (error && error.code === '23505') {
            console.log(`Evento ${eventId} já processado anteriormente`);
            return false;
        }

        if (error) {
            console.error('Erro ao registrar evento:', error);
            throw error;
        }

        return true;
    },

    /**
     * Registra pagamento no histórico
     */
    async recordPayment(invoice: Stripe.Invoice): Promise<void> {
        const { error } = await supabase
            .from('payment_history')
            .insert({
                user_id: invoice.subscription_details?.metadata?.user_id || invoice.metadata?.user_id,
                subscription_id: invoice.subscription as string,
                stripe_invoice_id: invoice.id,
                stripe_payment_intent_id: invoice.payment_intent as string,
                amount: invoice.amount_paid / 100, // Converter de centavos
                currency: invoice.currency.toUpperCase(),
                status: invoice.status === 'paid' ? 'paid' : invoice.status === 'open' ? 'pending' : 'failed',
                payment_method: invoice.payment_intent ? 'card' : 'unknown',
                invoice_pdf_url: invoice.invoice_pdf || null,
                hosted_invoice_url: invoice.hosted_invoice_url || null,
                paid_at: invoice.status_transitions.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : null,
                failure_reason: invoice.last_finalization_error?.message || null,
            });

        if (error) {
            console.error('Erro ao registrar pagamento:', error);
            throw error;
        }
    },
};

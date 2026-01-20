import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { serverPaymentService } from '../services/serverPaymentService';
import { supabase } from '../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export const config = {
    api: {
        bodyParser: false, // Necessário para validar assinatura do webhook
    },
};

// Helper para ler o body raw
async function buffer(req: VercelRequest): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
        req.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        req.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        req.on('error', reject);
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let event: Stripe.Event;

    try {
        // Obter body raw
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        if (!sig) {
            console.error('Assinatura do webhook ausente');
            return res.status(400).json({ error: 'Assinatura ausente' });
        }

        // Verificar assinatura do webhook
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);

        console.log(`✅ Webhook recebido: ${event.type}`);

    } catch (err: any) {
        console.error(`❌ Erro na verificação do webhook: ${err.message}`);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Verificar idempotência (evitar processar evento duplicado)
    const isNew = await serverPaymentService.recordWebhookEvent(
        event.id,
        event.type,
        event.data.object
    );

    if (!isNew) {
        console.log(`⏭️ Evento ${event.id} já processado anteriormente`);
        return res.status(200).json({ received: true, skipped: true });
    }

    // Processar evento baseado no tipo
    try {
        switch (event.type) {
            // ============================================
            // CHECKOUT COMPLETADO
            // ============================================
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.mode === 'subscription') {
                    const subscriptionId = session.subscription as string;

                    // Sincronizar assinatura
                    await serverPaymentService.syncSubscriptionStatus(subscriptionId);

                    console.log(`✅ Assinatura criada: ${subscriptionId}`);

                    // TODO: Enviar email de boas-vindas
                }
                break;
            }

            // ============================================
            // ASSINATURA ATUALIZADA
            // ============================================
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;

                // Sincronizar status
                await serverPaymentService.syncSubscriptionStatus(subscription.id);

                console.log(`✅ Assinatura atualizada: ${subscription.id} - Status: ${subscription.status}`);
                break;
            }

            // ============================================
            // ASSINATURA DELETADA/CANCELADA
            // ============================================
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                // Sincronizar status (trigger automático reverterá plano para free)
                await serverPaymentService.syncSubscriptionStatus(subscription.id);

                console.log(`✅ Assinatura cancelada: ${subscription.id}`);

                // TODO: Enviar email de cancelamento
                break;
            }

            // ============================================
            // PAGAMENTO BEM-SUCEDIDO
            // ============================================
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;

                // Registrar pagamento no histórico
                await serverPaymentService.recordPayment(invoice);

                console.log(`✅ Pagamento registrado: ${invoice.id} - R$ ${(invoice.amount_paid / 100).toFixed(2)}`);

                // TODO: Enviar email com recibo
                break;
            }

            // ============================================
            // FALHA NO PAGAMENTO
            // ============================================
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;

                // Registrar falha no histórico
                await serverPaymentService.recordPayment(invoice);

                // Atualizar status da assinatura
                if (invoice.subscription) {
                    await serverPaymentService.syncSubscriptionStatus(invoice.subscription as string);
                }

                console.log(`❌ Falha no pagamento: ${invoice.id}`);

                // TODO: Enviar email de notificação de falha
                break;
            }

            // ============================================
            // TRIAL TERMINANDO
            // ============================================
            case 'customer.subscription.trial_will_end': {
                const subscription = event.data.object as Stripe.Subscription;

                console.log(`⏰ Trial terminando em breve: ${subscription.id}`);

                // TODO: Enviar email lembrando que trial está acabando
                break;
            }

            // ============================================
            // OUTROS EVENTOS (LOG APENAS)
            // ============================================
            default:
                console.log(`ℹ️ Evento não tratado: ${event.type}`);
        }

        return res.status(200).json({ received: true, processed: true });

    } catch (error: any) {
        console.error(`❌ Erro ao processar evento ${event.type}:`, error);

        // Retornar 500 para que Stripe tente reenviar
        return res.status(500).json({
            error: 'Erro ao processar evento',
            details: error.message
        });
    }
}

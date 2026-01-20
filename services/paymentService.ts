import { supabase } from '../lib/supabase';

export interface Subscription {
    id: string;
    user_id: string;
    plan_name: 'pro' | 'business';
    status: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    trial_end?: string;
}

export interface PaymentRecord {
    id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method?: string;
    invoice_pdf_url?: string;
    hosted_invoice_url?: string;
    paid_at?: string;
    created_at: string;
    failure_reason?: string;
}

/**
 * Payment Service - Client Side
 * 
 * Este serviço contém apenas funções que podem ser executadas no navegador.
 * Funções que usam o Stripe SDK estão nas API routes (api/checkout.ts, api/billing-portal.ts, etc.)
 */
export const paymentService = {
    /**
     * Obtém assinatura ativa do usuário
     */
    async getActiveSubscription(userId: string): Promise<Subscription | null> {
        const { data, error } = await supabase
            .rpc('get_active_subscription', { p_user_id: userId })
            .single();

        if (error) {
            console.error('Erro ao buscar assinatura:', error);
            return null;
        }

        return data;
    },

    /**
     * Obtém histórico de pagamentos do usuário
     */
    async getPaymentHistory(
        userId: string,
        limit: number = 10,
        offset: number = 0
    ): Promise<PaymentRecord[]> {
        const { data, error } = await supabase
            .rpc('get_payment_history', {
                p_user_id: userId,
                p_limit: limit,
                p_offset: offset,
            });

        if (error) {
            console.error('Erro ao buscar histórico:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Obtém estatísticas de pagamentos (Admin)
     */
    async getPaymentStats(): Promise<any> {
        const { data, error } = await supabase
            .rpc('get_payment_stats')
            .single();

        if (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return null;
        }

        return data;
    },
};

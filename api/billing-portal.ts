import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serverPaymentService } from '../services/serverPaymentService';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Apenas POST permitido
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Obter token de autenticação
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        // Verificar usuário autenticado
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        // URL de retorno
        const returnUrl = req.body.returnUrl || process.env.VITE_APP_URL || 'https://12vai.com/dashboard';

        // Criar sessão do billing portal
        const session = await serverPaymentService.createBillingPortalSession(
            user.id,
            returnUrl
        );

        return res.status(200).json({
            url: session.url,
        });

    } catch (error: any) {
        console.error('Erro ao criar billing portal:', error);

        if (error.message === 'Usuário não possui customer do Stripe') {
            return res.status(400).json({ error: 'Você ainda não possui uma assinatura' });
        }

        return res.status(500).json({
            error: 'Erro ao criar sessão do portal',
            details: error.message
        });
    }
}

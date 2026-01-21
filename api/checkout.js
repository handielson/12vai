const { serverPaymentService } = require('../services/serverPaymentService.js');
const { supabase } = require('../lib/supabase.js');

module.exports = async function handler(req, res) {
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

        // Obter dados do body
        const { planName, billingInterval } = req.body;

        // Validar parâmetros
        if (!planName || !['pro', 'business'].includes(planName)) {
            return res.status(400).json({ error: 'Plano inválido' });
        }

        if (!billingInterval || !['month', 'year'].includes(billingInterval)) {
            return res.status(400).json({ error: 'Intervalo de cobrança inválido' });
        }

        // URLs de retorno
        const baseUrl = process.env.VITE_APP_URL || 'https://12vai.com';
        const successUrl = `${baseUrl}/dashboard?checkout=success`;
        const cancelUrl = `${baseUrl}/dashboard?checkout=canceled`;

        // Criar sessão de checkout
        const session = await serverPaymentService.createCheckoutSession(
            user.id,
            user.email,
            planName,
            billingInterval,
            successUrl,
            cancelUrl
        );

        return res.status(200).json({
            sessionId: session.sessionId,
            url: session.url,
        });

    } catch (error) {
        console.error('Erro ao criar checkout:', error);

        if (error.message === 'Usuário já possui uma assinatura ativa') {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({
            error: 'Erro ao criar sessão de checkout',
            details: error.message
        });
    }
};

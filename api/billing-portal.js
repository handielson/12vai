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

        // Buscar stripe_customer_id do usuário
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (userError) {
            console.error('Erro ao buscar dados do usuário:', userError);
            return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
        }

        if (!userData.stripe_customer_id) {
            return res.status(400).json({ error: 'Cliente Stripe não encontrado' });
        }

        // Criar sessão do portal de billing
        const baseUrl = process.env.VITE_APP_URL || 'https://12vai.com';
        const returnUrl = `${baseUrl}/dashboard`;

        const portalSession = await serverPaymentService.createBillingPortalSession(
            user.id,
            returnUrl
        );

        return res.status(200).json({
            url: portalSession.url,
        });

    } catch (error) {
        console.error('Erro ao criar portal session:', error);
        return res.status(500).json({
            error: 'Erro ao criar sessão do portal',
            details: error.message
        });
    }
};

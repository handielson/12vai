const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    console.log('=== CHECKOUT API CALLED ===');
    console.log('Method:', req.method);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        console.log('ERROR: Method not allowed');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Inicializar Supabase com Service Role Key
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        // Inicializar Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2024-12-18.acacia',
        });

        // Price IDs
        const PRICE_IDS = {
            pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
            pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
            business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
            business_yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',
        };

        console.log('Step 1: Checking auth header...');
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('ERROR: No auth header');
            return res.status(401).json({ error: 'Não autenticado' });
        }

        console.log('Step 2: Validating token...');
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.log('ERROR: Invalid token', authError);
            return res.status(401).json({ error: 'Token inválido' });
        }

        console.log('Step 3: User authenticated:', user.id);

        // Validar parâmetros
        const { planName, billingInterval } = req.body;

        if (!planName || !['pro', 'business'].includes(planName)) {
            return res.status(400).json({ error: 'Plano inválido' });
        }

        if (!billingInterval || !['month', 'year'].includes(billingInterval)) {
            return res.status(400).json({ error: 'Intervalo de cobrança inválido' });
        }

        console.log('Step 4: Checking existing subscription...');
        // Verificar assinatura ativa
        const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing'])
            .single();

        if (existingSubscription) {
            return res.status(400).json({ error: 'Usuário já possui uma assinatura ativa' });
        }

        console.log('Step 5: Getting or creating Stripe customer...');
        // Obter ou criar customer Stripe
        let customerId;
        const { data: userData } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (userData?.stripe_customer_id) {
            customerId = userData.stripe_customer_id;
        } else {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_user_id: user.id,
                },
            });

            await supabase
                .from('users')
                .update({ stripe_customer_id: customer.id })
                .eq('id', user.id);

            customerId = customer.id;
        }

        console.log('Step 6: Creating checkout session...');
        // Obter Price ID
        const priceKey = `${planName}_${billingInterval === 'year' ? 'yearly' : 'monthly'}`;
        const priceId = PRICE_IDS[priceKey];

        if (!priceId) {
            return res.status(500).json({ error: `Price ID não configurado para ${priceKey}` });
        }

        // Criar sessão de checkout
        const baseUrl = process.env.VITE_APP_URL || 'https://12vai.com';
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
            success_url: `${baseUrl}/dashboard?checkout=success`,
            cancel_url: `${baseUrl}/dashboard?checkout=canceled`,
            metadata: {
                user_id: user.id,
                plan_name: planName,
                billing_interval: billingInterval,
            },
        });

        console.log('SUCCESS: Checkout session created:', session.id);
        return res.status(200).json({
            sessionId: session.id,
            url: session.url,
        });

    } catch (error) {
        console.error('ERROR in checkout:', error);
        return res.status(500).json({
            error: 'Erro ao criar sessão de checkout',
            details: error.message
        });
    }
};

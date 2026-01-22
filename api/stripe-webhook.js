import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('📨 Webhook received:', event.type);

    try {
        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                console.log('✅ Checkout completed:', session.id);

                // Get subscription details
                const subscription = await stripe.subscriptions.retrieve(session.subscription);
                const customerId = session.customer;
                const userId = session.metadata.user_id;

                // Get user from database
                const { data: user } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (!user) {
                    console.error('User not found:', userId);
                    break;
                }

                // Create subscription record
                await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: userId,
                        stripe_subscription_id: subscription.id,
                        stripe_customer_id: customerId,
                        status: subscription.status,
                        plan_name: session.metadata.plan_name,
                        billing_interval: session.metadata.billing_interval,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end,
                    });

                // Update user's plan
                await supabase
                    .from('users')
                    .update({
                        plan: session.metadata.plan_name,
                        stripe_customer_id: customerId
                    })
                    .eq('id', userId);

                console.log('✅ Subscription created for user:', userId);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                console.log('🔄 Subscription updated:', subscription.id);

                // Update subscription in database
                await supabase
                    .from('subscriptions')
                    .update({
                        status: subscription.status,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end,
                    })
                    .eq('stripe_subscription_id', subscription.id);

                console.log('✅ Subscription updated');
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                console.log('❌ Subscription canceled:', subscription.id);

                // Update subscription status
                await supabase
                    .from('subscriptions')
                    .update({ status: 'canceled' })
                    .eq('stripe_subscription_id', subscription.id);

                // Downgrade user to free plan
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('user_id')
                    .eq('stripe_subscription_id', subscription.id)
                    .single();

                if (sub) {
                    await supabase
                        .from('users')
                        .update({ plan: 'free' })
                        .eq('id', sub.user_id);
                }

                console.log('✅ Subscription canceled');
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                console.log('💰 Payment succeeded:', invoice.id);

                // Record payment in history
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('user_id, plan_name')
                    .eq('stripe_customer_id', invoice.customer)
                    .single();

                if (sub) {
                    await supabase
                        .from('payment_history')
                        .insert({
                            user_id: sub.user_id,
                            stripe_invoice_id: invoice.id,
                            stripe_payment_intent_id: invoice.payment_intent,
                            amount: invoice.amount_paid / 100,
                            currency: invoice.currency,
                            status: 'succeeded',
                            plan_name: sub.plan_name,
                            billing_reason: invoice.billing_reason,
                        });
                }

                console.log('✅ Payment recorded');
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                console.log('⚠️ Payment failed:', invoice.id);

                // Record failed payment
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('user_id, plan_name')
                    .eq('stripe_customer_id', invoice.customer)
                    .single();

                if (sub) {
                    await supabase
                        .from('payment_history')
                        .insert({
                            user_id: sub.user_id,
                            stripe_invoice_id: invoice.id,
                            stripe_payment_intent_id: invoice.payment_intent,
                            amount: invoice.amount_due / 100,
                            currency: invoice.currency,
                            status: 'failed',
                            plan_name: sub.plan_name,
                            billing_reason: invoice.billing_reason,
                        });
                }

                console.log('⚠️ Failed payment recorded');
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Return 200 to acknowledge receipt
        res.json({ received: true });

    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
}

import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, ExternalLink, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { paymentService, type Subscription, type PaymentRecord } from '../services/paymentService';
import { planSettingsService, type PlanSettings } from '../services/planSettingsService';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function BillingPanel() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
    const [planSettings, setPlanSettings] = useState<PlanSettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadBillingData();
            loadPlanSettings();
        }
    }, [user]);

    async function loadPlanSettings() {
        try {
            const plans = await planSettingsService.getAllPlanSettings();
            setPlanSettings(plans.filter(p => p.plan_name !== 'free')); // Apenas Pro e Business
        } catch (err) {
            console.error('Erro ao carregar planos:', err);
        }
    }

    async function loadBillingData() {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Carregar assinatura ativa
            const sub = await paymentService.getActiveSubscription(user.id);
            setSubscription(sub);

            // Carregar histórico de pagamentos
            const history = await paymentService.getPaymentHistory(user.id, 10);
            setPaymentHistory(history);

        } catch (err: any) {
            console.error('Erro ao carregar dados de cobrança:', err);
            setError('Erro ao carregar informações de cobrança');
        } finally {
            setLoading(false);
        }
    }

    async function handleManageSubscription() {
        try {
            const session = await fetch('/api/billing-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`, // Ajustar para usar token real
                },
                body: JSON.stringify({
                    returnUrl: window.location.href,
                }),
            });

            const data = await session.json();

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Erro ao abrir portal:', err);
            alert('Erro ao abrir portal de gerenciamento');
        }
    }

    async function handleStartCheckout(planName: 'pro' | 'business', billingInterval: 'month' | 'year') {
        if (!user) {
            alert('Você precisa estar logado para fazer upgrade');
            return;
        }

        // Detectar se está em desenvolvimento (localhost)
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isDevelopment) {
            const planLabel = planName === 'pro' ? 'Pro' : 'Business';
            const intervalLabel = billingInterval === 'month' ? 'Mensal' : 'Anual';

            alert(`🚧 Modo de Desenvolvimento\n\nPlano selecionado: ${planLabel} - ${intervalLabel}\n\nAs APIs de pagamento só funcionam em produção (Vercel).\n\nPara testar:\n1. Faça deploy no Vercel\n2. Configure webhooks do Stripe\n3. Use cartão de teste: 4242 4242 4242 4242\n\nDocumentação completa em: docs/PAYMENTS_SETUP.md`);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.id}`,
                },
                body: JSON.stringify({
                    planName,
                    billingInterval,
                }),
            });

            const data = await response.json();

            if (data.error) {
                alert(data.error);
                setLoading(false);
                return;
            }

            if (data.url) {
                // Redirecionar para o Stripe Checkout
                window.location.href = data.url;
            }
        } catch (err: any) {
            console.error('Erro ao iniciar checkout:', err);
            alert('Erro ao iniciar checkout: ' + err.message);
            setLoading(false);
        }
    }

    function getPlanName(planName: string) {
        const plans: Record<string, string> = {
            pro: 'Pro',
            business: 'Business',
        };
        return plans[planName] || planName;
    }

    // Sanitizar features vindas do banco (corrigir "Lesmas" para "Slugs")
    function sanitizeFeature(feature: string): string {
        return feature
            .replace(/Lesmas/gi, 'Slugs')
            .replace(/lesma/gi, 'slug');
    }

    // Formatar limite de URLs
    function formatUrlLimit(limit: number | null): string {
        if (limit === null || limit === 0) {
            return 'URLs ilimitadas';
        }
        return `${limit.toLocaleString('pt-BR')} URLs`;
    }

    function getStatusBadge(status: string) {
        const badges: Record<string, { label: string; color: string; icon: any }> = {
            active: { label: 'Ativa', color: 'bg-green-100 text-green-800', icon: CheckCircle },
            trialing: { label: 'Em Trial', color: 'bg-blue-100 text-blue-800', icon: Clock },
            past_due: { label: 'Inadimplente', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            canceled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle },
            incomplete: { label: 'Incompleta', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
        };

        const badge = badges[status] || badges.incomplete;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                <Icon className="w-4 h-4" />
                {badge.label}
            </span>
        );
    }

    function getPlanName(planName: string) {
        const plans: Record<string, string> = {
            pro: 'Pro',
            business: 'Business',
        };
        return plans[planName] || planName;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Usuário sem assinatura (plano Free)
    if (!subscription) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">Faça Upgrade e Desbloqueie Todo o Potencial!</h2>
                    <p className="text-blue-100 mb-6">
                        Você está no plano Free. Faça upgrade para Pro ou Business e tenha acesso a recursos premium.
                    </p>

                    {planSettings.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {planSettings.map((plan) => (
                                <div key={plan.plan_name} className="bg-white/10 backdrop-blur rounded-lg p-4">
                                    <h3 className="font-bold mb-2">
                                        {plan.plan_name === 'pro' ? '✨ Plano Pro' : '🚀 Plano Business'}
                                    </h3>
                                    <ul className="text-sm text-blue-100 space-y-1">
                                        <li>• {formatUrlLimit(plan.url_limit)}</li>
                                        {plan.allow_custom_slug && <li>• Slugs personalizados</li>}
                                        {plan.allow_qr_customization && <li>• QR Codes customizados</li>}
                                        {plan.allow_password_protection && <li>• Proteção por senha</li>}
                                        {plan.allow_api_access && <li>• API de integração</li>}
                                        {plan.features.slice(0, 2).map((feature, idx) => (
                                            <li key={idx}>• {sanitizeFeature(feature)}</li>
                                        ))}
                                    </ul>
                                    <p className="mt-3 font-bold">
                                        R$ {plan.monthly_price.toFixed(2).replace('.', ',')}/mês
                                    </p>
                                    <p className="text-sm text-blue-200 mb-3">
                                        ou R$ {(plan.monthly_price * 10).toFixed(2).replace('.', ',')}/ano (economize 17%)
                                    </p>

                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleStartCheckout(plan.plan_name as 'pro' | 'business', 'month')}
                                            className={`w-full px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-sm ${plan.plan_name === 'pro'
                                                ? 'bg-white text-blue-600'
                                                : 'bg-white text-purple-600'
                                                }`}
                                        >
                                            Assinar Mensal
                                        </button>
                                        <button
                                            onClick={() => handleStartCheckout(plan.plan_name as 'pro' | 'business', 'year')}
                                            className="w-full bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition text-sm"
                                        >
                                            Assinar Anual
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Fallback com dados hardcoded enquanto carrega do banco
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                                <h3 className="font-bold mb-2">✨ Plano Pro</h3>
                                <ul className="text-sm text-blue-100 space-y-1">
                                    <li>• URLs ilimitadas</li>
                                    <li>• Slugs personalizados</li>
                                    <li>• QR Codes customizados</li>
                                    <li>• Proteção por senha</li>
                                </ul>
                                <p className="mt-3 font-bold">R$ 29,90/mês</p>
                                <p className="text-sm text-blue-200 mb-3">ou R$ 299/ano (economize 17%)</p>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleStartCheckout('pro', 'month')}
                                        className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-sm"
                                    >
                                        Assinar Mensal
                                    </button>
                                    <button
                                        onClick={() => handleStartCheckout('pro', 'year')}
                                        className="w-full bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition text-sm"
                                    >
                                        Assinar Anual
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                                <h3 className="font-bold mb-2">🚀 Plano Business</h3>
                                <ul className="text-sm text-blue-100 space-y-1">
                                    <li>• Tudo do Pro +</li>
                                    <li>• API de integração</li>
                                    <li>• Suporte prioritário</li>
                                    <li>• Relatórios avançados</li>
                                </ul>
                                <p className="mt-3 font-bold">R$ 79,90/mês</p>
                                <p className="text-sm text-blue-200 mb-3">ou R$ 799/ano (economize 17%)</p>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleStartCheckout('business', 'month')}
                                        className="w-full bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-sm"
                                    >
                                        Assinar Mensal
                                    </button>
                                    <button
                                        onClick={() => handleStartCheckout('business', 'year')}
                                        className="w-full bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition text-sm"
                                    >
                                        Assinar Anual
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Usuário com assinatura
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Status da Assinatura */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Plano {getPlanName(subscription.plan_name)}
                        </h2>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(subscription.status)}
                            {subscription.cancel_at_period_end && (
                                <span className="text-sm text-yellow-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    Cancelamento agendado
                                </span>
                            )}
                        </div>
                    </div>
                    <CreditCard className="w-12 h-12 text-blue-600" />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-sm text-gray-600">Próxima cobrança</p>
                            <p className="font-semibold text-gray-900">
                                {format(new Date(subscription.current_period_end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                        </div>
                    </div>

                    {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-blue-600">Trial termina em</p>
                                <p className="font-semibold text-blue-900">
                                    {format(new Date(subscription.trial_end), "dd 'de' MMMM", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleManageSubscription}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    Gerenciar Assinatura
                    <ExternalLink className="w-4 h-4" />
                </button>

                <p className="text-sm text-gray-500 mt-3 text-center">
                    Você será redirecionado para o portal seguro do Stripe
                </p>
            </div>

            {/* Histórico de Pagamentos */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Histórico de Pagamentos</h3>

                {paymentHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum pagamento registrado ainda</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Método</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fatura</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paymentHistory.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {format(new Date(payment.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                            {payment.currency} {payment.amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {payment.status === 'paid' && (
                                                <span className="text-green-600 flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Pago
                                                </span>
                                            )}
                                            {payment.status === 'failed' && (
                                                <span className="text-red-600 flex items-center gap-1">
                                                    <XCircle className="w-4 h-4" />
                                                    Falhou
                                                </span>
                                            )}
                                            {payment.status === 'pending' && (
                                                <span className="text-yellow-600 flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                                            {payment.payment_method || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {payment.invoice_pdf_url && (
                                                <a
                                                    href={payment.invoice_pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    PDF
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}
        </div>
    );
}

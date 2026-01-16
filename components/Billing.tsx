import React from 'react';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Billing: React.FC = () => {
    const { user } = useAuth();

    const plans = [
        {
            name: 'Free',
            price: 'Grátis',
            period: '',
            icon: Sparkles,
            color: 'slate',
            features: [
                '10 URLs encurtadas',
                '1.000 cliques por mês',
                'Slugs aleatórios',
                'Analytics básico',
                'Suporte por email'
            ],
            limitations: [
                'Sem slugs personalizados',
                'Sem slugs premium',
                'Sem domínios customizados'
            ]
        },
        {
            name: 'Pro',
            price: 'R$ 29',
            period: '/mês',
            icon: Zap,
            color: 'indigo',
            popular: true,
            features: [
                '100 URLs encurtadas',
                '50.000 cliques por mês',
                'Slugs personalizados',
                'Analytics avançado',
                'Suporte prioritário',
                'Exportar relatórios'
            ],
            limitations: [
                'Sem slugs premium',
                'Sem domínios customizados'
            ]
        },
        {
            name: 'Business',
            price: 'R$ 99',
            period: '/mês',
            icon: Crown,
            color: 'purple',
            features: [
                'URLs ilimitadas',
                'Cliques ilimitados',
                'Slugs personalizados',
                'Slugs premium',
                'Analytics completo',
                'API de integração',
                'Suporte 24/7',
                'Exportar relatórios'
            ],
            limitations: []
        }
    ];

    const currentPlan = user?.plan || 'free';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Faturamento</h1>
                <p className="text-slate-500">Gerencie seu plano e pagamentos</p>
            </div>

            {/* Current Plan */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">Plano Atual</p>
                        <h2 className="text-3xl font-black text-slate-900 capitalize">{currentPlan}</h2>
                        <p className="text-sm text-slate-600 mt-2">
                            {currentPlan === 'free' && 'Aproveite recursos básicos gratuitamente'}
                            {currentPlan === 'pro' && 'Recursos profissionais para seu negócio'}
                            {currentPlan === 'business' && 'Recursos completos para empresas'}
                        </p>
                    </div>
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <Crown className="text-indigo-600" size={40} />
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6">Planos Disponíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const isCurrentPlan = plan.name.toLowerCase().replace(' ', '_') === currentPlan;

                        return (
                            <div
                                key={plan.name}
                                className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${plan.popular
                                    ? 'border-indigo-600 shadow-md'
                                    : isCurrentPlan
                                        ? 'border-emerald-500'
                                        : 'border-slate-200'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                                            Mais Popular
                                        </span>
                                    </div>
                                )}

                                {isCurrentPlan && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                                            Plano Atual
                                        </span>
                                    </div>
                                )}

                                <div className={`w-12 h-12 bg-${plan.color}-100 rounded-xl flex items-center justify-center text-${plan.color}-600 mb-4`}>
                                    <Icon size={24} />
                                </div>

                                <h4 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h4>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                                    {plan.period && <span className="text-slate-500 text-sm">{plan.period}</span>}
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <Check className="text-emerald-600 flex-shrink-0 mt-0.5" size={16} />
                                            <span className="text-slate-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    disabled={isCurrentPlan}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${isCurrentPlan
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : plan.popular
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {isCurrentPlan ? 'Plano Atual' : 'Fazer Upgrade'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Histórico de Pagamentos</h3>
                <div className="text-center py-12 text-slate-400">
                    <p>Nenhum pagamento registrado</p>
                    <p className="text-sm mt-2">Seu histórico de pagamentos aparecerá aqui</p>
                </div>
            </div>
        </div>
    );
};

export default Billing;

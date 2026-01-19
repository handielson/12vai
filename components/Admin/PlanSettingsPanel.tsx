import React, { useState, useEffect } from 'react';
import { Save, X, Edit2, DollarSign, Link as LinkIcon, Check } from 'lucide-react';
import { planSettingsService, PlanSettings } from '../../services/planSettingsService';
import { getPlanName } from '../../lib/planLimits';

export const PlanSettingsPanel: React.FC = () => {
    const [plans, setPlans] = useState<PlanSettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<PlanSettings>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const data = await planSettingsService.getAllPlanSettings();
            setPlans(data);
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (plan: PlanSettings) => {
        setEditingPlan(plan.plan_name);
        setEditForm({
            url_limit: plan.url_limit,
            allow_custom_slugs: plan.allow_custom_slugs,
            allow_premium_slugs: plan.allow_premium_slugs,
            allow_password_protection: plan.allow_password_protection,
            monthly_price: plan.monthly_price,
            features: plan.features
        });
    };

    const cancelEdit = () => {
        setEditingPlan(null);
        setEditForm({});
    };

    const saveEdit = async (planName: string) => {
        setSaving(true);
        try {
            await planSettingsService.updatePlanSettings(planName, editForm);
            await loadPlans();
            setEditingPlan(null);
            setEditForm({});
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const getPlanIcon = (planName: string) => {
        if (planName === 'free') return '🆓';
        if (planName === 'pro') return '⚡';
        return '👔';
    };

    const getPlanColor = (planName: string) => {
        if (planName === 'free') return 'border-slate-300 bg-slate-50';
        if (planName === 'pro') return 'border-indigo-300 bg-indigo-50';
        return 'border-purple-300 bg-purple-50';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Carregando configurações...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Configurações de Planos</h2>
                <p className="text-slate-600 mt-1">Gerencie os limites e recursos de cada plano</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isEditing = editingPlan === plan.plan_name;

                    return (
                        <div
                            key={plan.id}
                            className={`border-2 rounded-2xl p-6 ${getPlanColor(plan.plan_name)}`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl">{getPlanIcon(plan.plan_name)}</span>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {getPlanName(plan.plan_name)}
                                    </h3>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => startEdit(plan)}
                                        className="p-2 text-slate-600 hover:bg-white rounded-lg transition-colors"
                                        title="Editar plano"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                {/* URL Limit */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Limite de URLs
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editForm.url_limit === null ? '' : editForm.url_limit}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                url_limit: e.target.value === '' ? null : parseInt(e.target.value)
                                            })}
                                            placeholder="Ilimitado"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-900 font-medium">
                                            <LinkIcon size={16} />
                                            {plan.url_limit === null ? '∞ Ilimitado' : `${plan.url_limit} URLs`}
                                        </div>
                                    )}
                                </div>

                                {/* Monthly Price */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Preço Mensal
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.monthly_price}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    monthly_price: parseFloat(e.target.value)
                                                })}
                                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-900 font-medium">
                                            <DollarSign size={16} />
                                            R$ {plan.monthly_price.toFixed(2)}
                                        </div>
                                    )}
                                </div>

                                {/* Custom Slugs */}
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isEditing ? editForm.allow_custom_slugs : plan.allow_custom_slugs}
                                            onChange={(e) => isEditing && setEditForm({
                                                ...editForm,
                                                allow_custom_slugs: e.target.checked
                                            })}
                                            disabled={!isEditing}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">
                                            Slugs Personalizados
                                        </span>
                                    </label>
                                </div>

                                {/* Password Protection */}
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isEditing ? editForm.allow_password_protection : plan.allow_password_protection}
                                            onChange={(e) => isEditing && setEditForm({
                                                ...editForm,
                                                allow_password_protection: e.target.checked
                                            })}
                                            disabled={!isEditing}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">
                                            🔒 Proteção por Senha
                                        </span>
                                    </label>
                                </div>

                                {/* Premium Slugs */}
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isEditing ? editForm.allow_premium_slugs : plan.allow_premium_slugs}
                                            onChange={(e) => isEditing && setEditForm({
                                                ...editForm,
                                                allow_premium_slugs: e.target.checked
                                            })}
                                            disabled={!isEditing}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">
                                            Slugs Premium
                                        </span>
                                    </label>
                                </div>

                                {/* Features */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Recursos Inclusos
                                    </label>
                                    <ul className="space-y-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                                <Check size={14} className="text-green-600" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Actions */}
                                {isEditing && (
                                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                                        <button
                                            onClick={() => saveEdit(plan.plan_name)}
                                            disabled={saving}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                        >
                                            <Save size={18} />
                                            Salvar
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            disabled={saving}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

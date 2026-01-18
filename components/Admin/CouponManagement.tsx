import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BarChart3, Eye, EyeOff } from 'lucide-react';
import CouponService, { Coupon, CouponStats } from '../../services/couponService';

export default function CouponManagement() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [stats, setStats] = useState<Map<string, CouponStats>>(new Map());

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        const data = await CouponService.getAllCoupons();
        setCoupons(data);
        setLoading(false);
    };

    const loadStats = async (couponId: string) => {
        const couponStats = await CouponService.getCouponStats(couponId);
        if (couponStats) {
            setStats(new Map(stats.set(couponId, couponStats)));
        }
    };

    const handleDeactivate = async (id: string) => {
        if (confirm('Deseja realmente desativar este cupom?')) {
            await CouponService.deactivateCoupon(id);
            loadCoupons();
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciamento de Cupons</h1>
                <button
                    onClick={() => {
                        setEditingCoupon(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={20} />
                    Novo Cupom
                </button>
            </div>

            {showForm && (
                <CouponForm
                    coupon={editingCoupon}
                    onClose={() => {
                        setShowForm(false);
                        setEditingCoupon(null);
                    }}
                    onSave={() => {
                        setShowForm(false);
                        setEditingCoupon(null);
                        loadCoupons();
                    }}
                />
            )}

            {loading ? (
                <div className="text-center py-12">Carregando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desconto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aplica em</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coupons.map((coupon) => (
                                <CouponRow
                                    key={coupon.id}
                                    coupon={coupon}
                                    stats={stats.get(coupon.id)}
                                    onEdit={() => {
                                        setEditingCoupon(coupon);
                                        setShowForm(true);
                                    }}
                                    onDeactivate={() => handleDeactivate(coupon.id)}
                                    onViewStats={() => loadStats(coupon.id)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Componente de linha da tabela
function CouponRow({
    coupon,
    stats,
    onEdit,
    onDeactivate,
    onViewStats,
}: {
    coupon: Coupon;
    stats?: CouponStats;
    onEdit: () => void;
    onDeactivate: () => void;
    onViewStats: () => void;
}) {
    const [showStats, setShowStats] = useState(false);

    const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();

    return (
        <>
            <tr className={!coupon.active || isExpired ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                    {coupon.description && (
                        <div className="text-sm text-gray-500">{coupon.description}</div>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">
                        {CouponService.formatDiscount(coupon.discount_type, coupon.discount_value)}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.applies_to === 'both' ? 'Upgrade e Renovação' :
                        coupon.applies_to === 'upgrade' ? 'Upgrade' : 'Renovação'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Sem limite'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stats ? (
                        <div>
                            <div>{stats.total_uses} usos</div>
                            {coupon.max_uses && (
                                <div className="text-xs text-gray-400">
                                    Limite: {coupon.max_uses}
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                onViewStats();
                                setShowStats(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Ver estatísticas
                        </button>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {isExpired ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Expirado
                        </span>
                    ) : coupon.active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Ativo
                        </span>
                    ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inativo
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onEdit}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                        >
                            <Edit2 size={16} />
                        </button>
                        {coupon.active && (
                            <button
                                onClick={onDeactivate}
                                className="text-red-600 hover:text-red-900"
                                title="Desativar"
                            >
                                <EyeOff size={16} />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {showStats && stats && (
                <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <div className="text-xs text-gray-500">Total de Usos</div>
                                <div className="text-lg font-semibold">{stats.total_uses}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Usuários Únicos</div>
                                <div className="text-lg font-semibold">{stats.unique_users}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Desconto Total</div>
                                <div className="text-lg font-semibold text-red-600">
                                    {CouponService.formatPrice(stats.total_discount)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Receita Gerada</div>
                                <div className="text-lg font-semibold text-green-600">
                                    {CouponService.formatPrice(stats.total_revenue)}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// Componente de formulário
function CouponForm({
    coupon,
    onClose,
    onSave,
}: {
    coupon: Coupon | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState({
        code: coupon?.code || '',
        description: coupon?.description || '',
        discount_type: coupon?.discount_type || 'percentage',
        discount_value: coupon?.discount_value || 0,
        applies_to: coupon?.applies_to || 'both',
        applicable_plans: coupon?.applicable_plans || null,
        max_uses: coupon?.max_uses || null,
        max_uses_per_user: coupon?.max_uses_per_user || 1,
        valid_from: coupon?.valid_from || new Date().toISOString().split('T')[0],
        valid_until: coupon?.valid_until?.split('T')[0] || '',
        active: coupon?.active ?? true,
    });

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const data = {
            ...formData,
            code: formData.code.toUpperCase(),
            discount_value: Number(formData.discount_value),
            max_uses: formData.max_uses ? Number(formData.max_uses) : null,
            max_uses_per_user: formData.max_uses_per_user ? Number(formData.max_uses_per_user) : null,
            valid_until: formData.valid_until || null,
        };

        if (coupon) {
            await CouponService.updateCoupon(coupon.id, data);
        } else {
            await CouponService.createCoupon(data as any);
        }

        setSaving(false);
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                    {coupon ? 'Editar Cupom' : 'Novo Cupom'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Código *
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                                maxLength={20}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Desconto *
                            </label>
                            <select
                                value={formData.discount_type}
                                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="percentage">Percentual</option>
                                <option value="fixed_amount">Valor Fixo</option>
                                <option value="trial_extension">Extensão de Trial</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor do Desconto *
                        </label>
                        <input
                            type="number"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                            min="0"
                            step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.discount_type === 'percentage' && '% de desconto'}
                            {formData.discount_type === 'fixed_amount' && 'Valor em R$'}
                            {formData.discount_type === 'trial_extension' && 'Dias de extensão'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Aplica em *
                            </label>
                            <select
                                value={formData.applies_to}
                                onChange={(e) => setFormData({ ...formData, applies_to: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="both">Upgrade e Renovação</option>
                                <option value="upgrade">Apenas Upgrade</option>
                                <option value="renewal">Apenas Renovação</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Limite de Usos
                            </label>
                            <input
                                type="number"
                                value={formData.max_uses || ''}
                                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? Number(e.target.value) : null })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                min="1"
                                placeholder="Ilimitado"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Válido de *
                            </label>
                            <input
                                type="date"
                                value={formData.valid_from}
                                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Válido até
                            </label>
                            <input
                                type="date"
                                value={formData.valid_until}
                                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="rounded"
                        />
                        <label className="text-sm font-medium text-gray-700">
                            Cupom ativo
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

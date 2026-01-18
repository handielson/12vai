import React, { useState } from 'react';
import { Tag, Check, X, Loader } from 'lucide-react';
import CouponService, { ApplyResult } from '../services/couponService';

interface CouponFieldProps {
    userId: string;
    plan: string;
    originalPrice: number;
    action: 'upgrade' | 'renewal';
    onCouponApplied: (result: ApplyResult) => void;
    onCouponRemoved: () => void;
}

export default function CouponField({
    userId,
    plan,
    originalPrice,
    action,
    onCouponApplied,
    onCouponRemoved,
}: CouponFieldProps) {
    const [couponCode, setCouponCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<ApplyResult | null>(null);
    const [error, setError] = useState('');

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Digite um código de cupom');
            return;
        }

        setValidating(true);
        setError('');

        // Primeiro validar
        const validation = await CouponService.validateCoupon(
            couponCode,
            userId,
            plan,
            action
        );

        if (!validation.valid) {
            setError(validation.message);
            setValidating(false);
            return;
        }

        // Se válido, aplicar
        const result = await CouponService.applyCoupon(
            couponCode,
            userId,
            plan,
            originalPrice,
            action
        );

        setValidating(false);

        if (result.success) {
            setAppliedCoupon(result);
            onCouponApplied(result);
            setError('');
        } else {
            setError(result.message);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setError('');
        onCouponRemoved();
    };

    return (
        <div className="space-y-3">
            {!appliedCoupon ? (
                <>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Tag className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => {
                                    setCouponCode(e.target.value.toUpperCase());
                                    setError('');
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                placeholder="Código do cupom"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                disabled={validating}
                            />
                        </div>
                        <button
                            onClick={handleApplyCoupon}
                            disabled={validating || !couponCode.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {validating ? (
                                <>
                                    <Loader className="animate-spin" size={16} />
                                    Validando...
                                </>
                            ) : (
                                'Aplicar'
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                            <X size={16} />
                            {error}
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                            <Check className="text-green-600 mt-0.5" size={20} />
                            <div>
                                <div className="font-medium text-green-900">
                                    Cupom "{couponCode}" aplicado!
                                </div>
                                <div className="text-sm text-green-700 mt-1">
                                    Você economizou {CouponService.formatPrice(appliedCoupon.discount_amount)}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleRemoveCoupon}
                            className="text-green-600 hover:text-green-800"
                            title="Remover cupom"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Componente de resumo de preço com cupom
export function PriceSummary({
    originalPrice,
    appliedCoupon,
}: {
    originalPrice: number;
    appliedCoupon: ApplyResult | null;
}) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {appliedCoupon ? (
                <>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Preço original</span>
                        <span className="line-through">
                            {CouponService.formatPrice(originalPrice)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto</span>
                        <span>-{CouponService.formatPrice(appliedCoupon.discount_amount)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-green-600">
                            {CouponService.formatPrice(appliedCoupon.final_price)}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                        Você economizou {Math.round((appliedCoupon.discount_amount / originalPrice) * 100)}%!
                    </div>
                </>
            ) : (
                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{CouponService.formatPrice(originalPrice)}</span>
                </div>
            )}
        </div>
    );
}

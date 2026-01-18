import { supabase } from './supabase';

// =====================================================
// TYPES
// =====================================================

export type DiscountType = 'percentage' | 'fixed_amount' | 'trial_extension';
export type AppliesTo = 'upgrade' | 'renewal' | 'both';
export type UsageAction = 'upgrade' | 'renewal';

export interface Coupon {
    id: string;
    code: string;
    description: string | null;
    discount_type: DiscountType;
    discount_value: number;
    applies_to: AppliesTo;
    applicable_plans: string[] | null;
    max_uses: number | null;
    max_uses_per_user: number | null;
    valid_from: string;
    valid_until: string | null;
    active: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface CouponUsage {
    id: string;
    coupon_id: string;
    user_id: string;
    plan: string;
    original_price: number;
    discount_amount: number;
    final_price: number;
    used_for: UsageAction;
    used_at: string;
}

export interface ValidationResult {
    valid: boolean;
    message: string;
    coupon_id: string | null;
    discount_type: DiscountType | null;
    discount_value: number | null;
}

export interface ApplyResult {
    success: boolean;
    message: string;
    original_price: number;
    discount_amount: number;
    final_price: number;
}

export interface CouponStats {
    total_uses: number;
    total_discount: number;
    total_revenue: number;
    unique_users: number;
}

// =====================================================
// COUPON SERVICE
// =====================================================

export class CouponService {
    /**
     * Valida se um cupom pode ser usado
     */
    static async validateCoupon(
        code: string,
        userId: string,
        plan: string,
        action: UsageAction
    ): Promise<ValidationResult> {
        try {
            const { data, error } = await supabase.rpc('validate_coupon', {
                p_code: code.toUpperCase(),
                p_user_id: userId,
                p_plan: plan,
                p_action: action,
            });

            if (error) throw error;

            return data[0];
        } catch (error) {
            console.error('Error validating coupon:', error);
            return {
                valid: false,
                message: 'Erro ao validar cupom',
                coupon_id: null,
                discount_type: null,
                discount_value: null,
            };
        }
    }

    /**
     * Aplica um cupom e registra o uso
     */
    static async applyCoupon(
        code: string,
        userId: string,
        plan: string,
        originalPrice: number,
        action: UsageAction
    ): Promise<ApplyResult> {
        try {
            const { data, error } = await supabase.rpc('apply_coupon', {
                p_code: code.toUpperCase(),
                p_user_id: userId,
                p_plan: plan,
                p_original_price: originalPrice,
                p_action: action,
            });

            if (error) throw error;

            return data[0];
        } catch (error) {
            console.error('Error applying coupon:', error);
            return {
                success: false,
                message: 'Erro ao aplicar cupom',
                original_price: originalPrice,
                discount_amount: 0,
                final_price: originalPrice,
            };
        }
    }

    /**
     * Calcula o desconto sem aplicar
     */
    static calculateDiscount(
        discountType: DiscountType,
        discountValue: number,
        originalPrice: number
    ): number {
        switch (discountType) {
            case 'percentage':
                return Math.round((originalPrice * (discountValue / 100)) * 100) / 100;
            case 'fixed_amount':
                return Math.min(discountValue, originalPrice);
            case 'trial_extension':
                return 0;
            default:
                return 0;
        }
    }

    /**
     * Busca histórico de uso de cupons do usuário
     */
    static async getUserCouponUsage(userId: string): Promise<CouponUsage[]> {
        try {
            const { data, error } = await supabase
                .from('coupon_usage')
                .select('*')
                .eq('user_id', userId)
                .order('used_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error fetching user coupon usage:', error);
            return [];
        }
    }

    /**
     * Busca todos os cupons ativos (admin)
     */
    static async getAllCoupons(): Promise<Coupon[]> {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error fetching coupons:', error);
            return [];
        }
    }

    /**
     * Busca cupons ativos disponíveis
     */
    static async getActiveCoupons(): Promise<Coupon[]> {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('active', true)
                .gte('valid_until', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error fetching active coupons:', error);
            return [];
        }
    }

    /**
     * Cria um novo cupom (admin)
     */
    static async createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>): Promise<Coupon | null> {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .insert({
                    ...coupon,
                    code: coupon.code.toUpperCase(),
                })
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error creating coupon:', error);
            return null;
        }
    }

    /**
     * Atualiza um cupom (admin)
     */
    static async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error updating coupon:', error);
            return null;
        }
    }

    /**
     * Desativa um cupom (admin)
     */
    static async deactivateCoupon(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('coupons')
                .update({ active: false })
                .eq('id', id);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error deactivating coupon:', error);
            return false;
        }
    }

    /**
     * Busca estatísticas de um cupom (admin)
     */
    static async getCouponStats(couponId: string): Promise<CouponStats | null> {
        try {
            const { data, error } = await supabase.rpc('get_coupon_stats', {
                p_coupon_id: couponId,
            });

            if (error) throw error;

            return data[0];
        } catch (error) {
            console.error('Error fetching coupon stats:', error);
            return null;
        }
    }

    /**
     * Formata valor de desconto para exibição
     */
    static formatDiscount(discountType: DiscountType, discountValue: number): string {
        switch (discountType) {
            case 'percentage':
                return `${discountValue}%`;
            case 'fixed_amount':
                return `R$ ${discountValue.toFixed(2)}`;
            case 'trial_extension':
                return `+${discountValue} dias`;
            default:
                return '';
        }
    }

    /**
     * Formata preço
     */
    static formatPrice(price: number): string {
        return `R$ ${price.toFixed(2)}`;
    }
}

export default CouponService;

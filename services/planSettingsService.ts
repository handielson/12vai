import { supabase } from '../lib/supabase';

export interface PlanSettings {
    id: string;
    plan_name: string;
    url_limit: number | null;
    allow_custom_slugs: boolean;
    allow_premium_slugs: boolean;
    allow_password_protection?: boolean; // Nova feature
    monthly_price: number;
    features: string[];
    created_at: string;
    updated_at: string;
}

export const planSettingsService = {
    async getAllPlanSettings(): Promise<PlanSettings[]> {
        const { data, error } = await supabase
            .from('plan_settings')
            .select('*')
            .order('monthly_price', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getPlanSettings(planName: string): Promise<PlanSettings | null> {
        const { data, error } = await supabase
            .from('plan_settings')
            .select('*')
            .eq('plan_name', planName)
            .single();

        if (error) {
            console.error('Error fetching plan settings:', error);
            return null;
        }
        return data;
    },

    async updatePlanSettings(planName: string, updates: Partial<PlanSettings>): Promise<void> {
        const { error } = await supabase
            .from('plan_settings')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('plan_name', planName);

        if (error) throw error;
    }
};

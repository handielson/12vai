import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
    id: string;
    admin_id: string;
    admin_email?: string;
    action: string;
    target_type?: string;
    target_id?: string;
    details?: any;
    ip_address?: string;
    created_at: string;
}

export type AuditAction =
    | 'edit_user_plan'
    | 'edit_user_limit'
    | 'impersonate_user'
    | 'edit_plan_settings'
    | 'toggle_feature'
    | 'add_roadmap_item'
    | 'remove_roadmap_item';

export const auditLogService = {
    /**
     * Registra uma ação administrativa
     */
    async log(
        adminId: string,
        action: AuditAction,
        targetType?: string,
        targetId?: string,
        details?: any
    ): Promise<void> {
        try {
            const { error } = await supabase.from('admin_audit_log').insert({
                admin_id: adminId,
                action,
                target_type: targetType,
                target_id: targetId,
                details: details || {}
            });

            if (error) {
                console.error('Erro ao registrar log de auditoria:', error);
            }
        } catch (error) {
            console.error('Erro ao registrar log de auditoria:', error);
        }
    },

    /**
     * Busca logs recentes
     */
    async getRecentLogs(limit = 50): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase
            .from('admin_audit_log')
            .select(`
        *,
        users!admin_id(email)
      `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Erro ao buscar logs:', error);
            return [];
        }

        return (data || []).map(log => ({
            ...log,
            admin_email: log.users?.email
        }));
    },

    /**
     * Busca logs por administrador
     */
    async getLogsByAdmin(adminId: string, limit = 50): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase
            .from('admin_audit_log')
            .select(`
        *,
        users!admin_id(email)
      `)
            .eq('admin_id', adminId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Erro ao buscar logs por admin:', error);
            return [];
        }

        return (data || []).map(log => ({
            ...log,
            admin_email: log.users?.email
        }));
    },

    /**
     * Busca logs por tipo de ação
     */
    async getLogsByAction(action: AuditAction, limit = 50): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase
            .from('admin_audit_log')
            .select(`
        *,
        users!admin_id(email)
      `)
            .eq('action', action)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Erro ao buscar logs por ação:', error);
            return [];
        }

        return (data || []).map(log => ({
            ...log,
            admin_email: log.users?.email
        }));
    },

    /**
     * Busca logs por período
     */
    async getLogsByDateRange(startDate: Date, endDate: Date): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase
            .from('admin_audit_log')
            .select(`
        *,
        users!admin_id(email)
      `)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar logs por período:', error);
            return [];
        }

        return (data || []).map(log => ({
            ...log,
            admin_email: log.users?.email
        }));
    }
};

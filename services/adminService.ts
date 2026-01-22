import { supabase } from '../lib/supabase';
import { auditLogService } from './auditLogService';

export interface SystemStats {
    totalUsers: number;
    freeUsers: number;
    proUsers: number;
    businessUsers: number;
    totalUrls: number;
    totalClicks: number;
}

export interface UserWithStats {
    id: string;
    email: string;
    plan: string;
    custom_url_limit: number | null;
    is_admin: boolean;
    created_at: string;
    url_count: number;
    total_clicks: number;
}

export const adminService = {
    // Verificar se usuário é admin
    async isAdmin(userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', userId)
            .maybeSingle();

        if (error) return false;
        return data?.is_admin || false;
    },

    // Listar todos os usuários com estatísticas
    async getAllUsers(): Promise<UserWithStats[]> {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error('Erro ao carregar usuários');

        // Buscar contagem de URLs e cliques para cada usuário
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const { data: urls } = await supabase
                    .from('urls')
                    .select('clicks_count')
                    .eq('user_id', user.id);

                const url_count = urls?.length || 0;
                const total_clicks = urls?.reduce((sum, url) => sum + url.clicks_count, 0) || 0;

                return {
                    ...user,
                    url_count,
                    total_clicks
                };
            })
        );

        return usersWithStats;
    },

    // Atualizar plano do usuário
    async updateUserPlan(userId: string, plan: string, adminId: string, userEmail: string, oldPlan: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .update({ plan })
            .eq('id', userId);

        if (error) throw new Error('Erro ao atualizar plano');

        // Log de auditoria
        await auditLogService.log(
            adminId,
            'edit_user_plan',
            'user',
            userId,
            { user_email: userEmail, old_plan: oldPlan, new_plan: plan }
        );
    },

    // Definir limite personalizado
    async setCustomLimit(userId: string, limit: number | null, adminId: string, userEmail: string, oldLimit: number | null): Promise<void> {
        const { error } = await supabase
            .from('users')
            .update({ custom_url_limit: limit })
            .eq('id', userId);

        if (error) throw new Error('Erro ao definir limite personalizado');

        // Log de auditoria
        await auditLogService.log(
            adminId,
            'edit_user_limit',
            'user',
            userId,
            { user_email: userEmail, old_limit: oldLimit, new_limit: limit }
        );
    },

    // Obter estatísticas do sistema
    async getSystemStats(): Promise<SystemStats> {
        // Total de usuários
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Usuários por plano
        const { data: users } = await supabase
            .from('users')
            .select('plan');

        const freeUsers = users?.filter(u => u.plan === 'free').length || 0;
        const proUsers = users?.filter(u => u.plan === 'pro').length || 0;
        const businessUsers = users?.filter(u => u.plan === 'business').length || 0;

        // Total de URLs
        const { count: totalUrls } = await supabase
            .from('urls')
            .select('*', { count: 'exact', head: true });

        // Total de cliques
        const { data: urlsWithClicks } = await supabase
            .from('urls')
            .select('clicks_count');

        const totalClicks = urlsWithClicks?.reduce(
            (sum, url) => sum + url.clicks_count,
            0
        ) || 0;

        return {
            totalUsers: totalUsers || 0,
            freeUsers,
            proUsers,
            businessUsers,
            totalUrls: totalUrls || 0,
            totalClicks
        };
    },

    // Bloquear usuário
    async blockUser(userId: string, adminId: string, userEmail: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .update({ is_blocked: true })
            .eq('id', userId);

        if (error) throw new Error('Erro ao bloquear usuário');

        // Log de auditoria
        await auditLogService.log(
            adminId,
            'block_user',
            'user',
            userId,
            { user_email: userEmail, action: 'blocked' }
        );
    },

    // Desbloquear usuário
    async unblockUser(userId: string, adminId: string, userEmail: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .update({ is_blocked: false })
            .eq('id', userId);

        if (error) throw new Error('Erro ao desbloquear usuário');

        // Log de auditoria
        await auditLogService.log(
            adminId,
            'unblock_user',
            'user',
            userId,
            { user_email: userEmail, action: 'unblocked' }
        );
    },

    // Excluir usuário
    async deleteUser(userId: string, deleteUrls: boolean, adminId: string, userEmail: string): Promise<void> {
        // Se deve excluir URLs, fazer primeiro
        if (deleteUrls) {
            const { error: urlsError } = await supabase
                .from('urls')
                .delete()
                .eq('user_id', userId);

            if (urlsError) throw new Error('Erro ao excluir URLs do usuário');
        }

        // Excluir usuário
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) throw new Error('Erro ao excluir usuário');

        // Log de auditoria
        await auditLogService.log(
            adminId,
            'delete_user',
            'user',
            userId,
            { user_email: userEmail, urls_deleted: deleteUrls }
        );
    }
};

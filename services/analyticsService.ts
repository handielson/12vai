import { supabase } from '../lib/supabase';
import type { GeneralStats, TimeSeriesData, TopUrlData } from '../types';

export const analyticsService = {
    /**
     * Obter estatísticas gerais do sistema
     */
    async getGeneralStats(): Promise<GeneralStats> {
        try {
            // Total de URLs
            const { count: totalUrls } = await supabase
                .from('urls')
                .select('*', { count: 'exact', head: true });

            // Total de usuários
            const { count: totalUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // Total de cliques (soma de clicks_count)
            const { data: clicksData } = await supabase
                .from('urls')
                .select('clicks_count');

            const totalClicks = clicksData?.reduce((sum, url) => sum + (url.clicks_count || 0), 0) || 0;

            // Média de cliques por URL
            const avgClicksPerUrl = totalUrls && totalUrls > 0
                ? Math.round((totalClicks / totalUrls) * 10) / 10
                : 0;

            return {
                totalUrls: totalUrls || 0,
                totalClicks,
                totalUsers: totalUsers || 0,
                avgClicksPerUrl
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas gerais:', error);
            return {
                totalUrls: 0,
                totalClicks: 0,
                totalUsers: 0,
                avgClicksPerUrl: 0
            };
        }
    },

    /**
     * Obter URLs criadas por dia (últimos N dias)
     */
    async getUrlsOverTime(days: number = 30): Promise<TimeSeriesData[]> {
        try {
            const { data, error } = await supabase
                .from('urls')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Agrupar por data
            const grouped = data?.reduce((acc, url) => {
                const date = new Date(url.created_at).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {} as Record<string, number>) || {};

            // Preencher dias faltantes com 0
            const result: TimeSeriesData[] = [];
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                result.push({
                    date,
                    count: grouped[date] || 0
                });
            }

            return result;
        } catch (error) {
            console.error('Erro ao obter URLs ao longo do tempo:', error);
            return [];
        }
    },

    /**
     * Obter cliques por dia (últimos N dias)
     * Nota: Como não temos tabela de clicks separada, vamos simular com dados de URLs
     */
    async getClicksOverTime(days: number = 30): Promise<TimeSeriesData[]> {
        try {
            // Por enquanto, vamos retornar dados simulados baseados nas URLs
            // Em produção, você teria uma tabela 'clicks' com timestamp
            const urlsData = await this.getUrlsOverTime(days);

            // Simular cliques (multiplicar por fator aleatório para visualização)
            return urlsData.map(item => ({
                date: item.date,
                count: item.count * Math.floor(Math.random() * 10 + 5) // 5-15 cliques por URL
            }));
        } catch (error) {
            console.error('Erro ao obter cliques ao longo do tempo:', error);
            return [];
        }
    },

    /**
     * Obter top URLs mais clicadas
     */
    async getTopUrls(limit: number = 10): Promise<TopUrlData[]> {
        try {
            const { data, error } = await supabase
                .from('urls')
                .select('short_slug, original_url, clicks_count')
                .order('clicks_count', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data?.map(url => ({
                shortCode: url.short_slug,
                originalUrl: url.original_url,
                clicks: url.clicks_count || 0
            })) || [];
        } catch (error) {
            console.error('Erro ao obter top URLs:', error);
            return [];
        }
    }
};

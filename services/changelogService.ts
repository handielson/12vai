import { supabase } from '../lib/supabase';

export interface ChangelogEntry {
    id: string;
    version: string;
    release_date: string;
    changes: {
        new?: string[];
        improved?: string[];
        fixed?: string[];
    };
    created_at: string;
}

export const changelogService = {
    /**
     * Busca a versão mais recente
     */
    async getLatestVersion(): Promise<ChangelogEntry | null> {
        const { data, error } = await supabase
            .from('app_changelog')
            .select('*')
            .order('release_date', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('Erro ao buscar versão mais recente:', error);
            return null;
        }

        return data;
    },

    /**
     * Busca changelog de uma versão específica
     */
    async getVersionChangelog(version: string): Promise<ChangelogEntry | null> {
        const { data, error } = await supabase
            .from('app_changelog')
            .select('*')
            .eq('version', version)
            .single();

        if (error) {
            console.error(`Erro ao buscar changelog da versão ${version}:`, error);
            return null;
        }

        return data;
    },

    /**
     * Busca histórico completo de versões
     */
    async getAllChangelogs(): Promise<ChangelogEntry[]> {
        const { data, error } = await supabase
            .from('app_changelog')
            .select('*')
            .order('release_date', { ascending: false });

        if (error) {
            console.error('Erro ao buscar histórico de versões:', error);
            return [];
        }

        return data || [];
    }
};
